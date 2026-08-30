import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Diagnostic endpoint for Firebase Auth / Google Login configuration
  app.post('/api/auth/diagnose', (req, res) => {
    const { apiKey, authDomain, projectId, currentOrigin } = req.body;

    const issues: Array<{ id: string; title: string; severity: 'error' | 'warning' | 'info'; description: string; solution: string }> = [];

    // Check Firebase Auth domain
    if (!authDomain) {
      issues.push({
        id: 'missing-auth-domain',
        title: 'Thiếu authDomain',
        severity: 'error',
        description: 'Chưa cấu hình authDomain trong Firebase config.',
        solution: 'Thêm authDomain (ví dụ: localquest2-tourist-web.firebaseapp.com) vào cấu hình Firebase.'
      });
    } else if (!authDomain.includes('.firebaseapp.com') && !authDomain.includes('.web.app')) {
      issues.push({
        id: 'custom-auth-domain',
        title: 'authDomain tuỳ chỉnh',
        severity: 'info',
        description: `authDomain hiện tại là ${authDomain}. Đảm bảo DNS và SSL đã được trỏ đúng.`,
        solution: 'Kiểm tra cấu hình domain trong Firebase Console > Authentication > Settings.'
      });
    }

    // Check Authorized Domains requirement
    issues.push({
      id: 'authorized-domains-check',
      title: 'Xác thực Danh sách Miền Được Uỷ Quyền (Authorized Domains)',
      severity: 'warning',
      description: `Để Google Sign-In hoạt động, miền "${currentOrigin || 'localquest2-tourist-web.web.app'}" và "localhost" phải có trong danh sách Authorized Domains.`,
      solution: 'Vào Firebase Console -> Authentication -> Cài đặt (Settings) -> Authorized domains -> Thêm "localquest2-tourist-web.web.app" và "localquest2-tourist-web.firebaseapp.com".'
    });

    // Check OAuth consent screen
    issues.push({
      id: 'oauth-client-check',
      title: 'OAuth Consent Screen & Google Provider trong Firebase Console',
      severity: 'info',
      description: 'Nhà cung cấp Google (Google Sign-in Provider) phải được "Bật" (Enabled) trong Firebase Console.',
      solution: 'Vào Firebase Console -> Authentication -> Sign-in method -> Bật "Google" và điền email hỗ trợ dự án.'
    });

    res.json({
      success: true,
      diagnostics: {
        checkedOrigin: currentOrigin,
        projectId: projectId || 'localquest2-tourist-web',
        authDomain: authDomain || 'localquest2-tourist-web.firebaseapp.com',
        timestamp: new Date().toISOString(),
        issues
      }
    });
  });

  // AI Chat & Assistant endpoint (Gemini Server-Side)
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { message, history = [], questName, city, destination, mode = 'chat', context, availableQuests = [] } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // High-quality contextual fallback when API key is not yet set
        let fallbackText = `Chào bạn! Tôi là Trợ Lý Di Sản & Local Guide AI 24/7 của LocalQuest tại ${city || destination || 'Việt Nam'}.`;
        const q = (message || '').toLowerCase();
        if (q.includes('phở') || q.includes('ăn') || q.includes('món') || q.includes('quán') || q.includes('ngon')) {
          fallbackText += `\n\n🍜 **Gợi ý Ẩm thực Bản địa:**\n- **Phở gia truyền**: Hãy ghé các quán phở gánh hoặc phở nước dùng ninh xương trên 12 tiếng ở ngõ Hàng Trống, Bát Đàn (Hà Nội) từ 6:00 - 8:30 sáng.\n- **Cà phê trứng**: Quán Đinh hoặc Giảng ngõ nhỏ cổ kính, lớp kem trứng sánh mịn thơm lừng.\n\n💡 *Mẹo:* Bạn có thể tham gia ngay Quest **"Hương Vị Phở Trăm Năm"** hoặc **"Bí Ẩn Phố Cổ Hà Nội"** để được dẫn đường qua từng quán gia truyền chuẩn vị nhất!`;
        } else if (q.includes('chùa cầu') || q.includes('hội an') || q.includes('đèn lồng')) {
          fallbackText += `\n\n🏮 **Bí ẩn Chùa Cầu & Phố Cổ Hội An:**\n- Chùa Cầu (Lai Viễn Kiều) được các thương nhân Nhật Bản xây dựng vào thế kỷ 17 với truyền thuyết trấn yểm con thủy quái Mamazu.\n- **Góc chụp đẹp nhất:** Ban công gác hai quán trà đối diện Chùa Cầu lúc 16:45 hoàng hôn khi đèn lồng bắt đầu thắp sáng.\n\n💡 *Gợi ý:* Hãy trải nghiệm Quest **"Ánh Sáng Đèn Lồng Hội An"** để giải mã câu đố từ các nghệ nhân phố Hội!`;
        } else if (q.includes('huế') || q.includes('kinh thành') || q.includes('sông hương')) {
          fallbackText += `\n\n👑 **Khám Phá Cố Đô Huế 1 Ngày:**\n- **Sáng (7:00 - 10:30):** Khám phá Đại Nội, Cửa Ngọ Môn và thưởng thức Bún Bò Huế Mụ Rơi.\n- **Chiều (14:30 - 17:00):** Ghé Lăng Khải Định hoặc Chùa Thiên Mụ nghe chuông chiều ngân.\n- **Tối:** Thưởng thức trà cung đình và nghe ca Huế trên Sông Hương.\n\n💡 *Gợi ý Quest:* **"Huyền Thoại Sông Hương"** đưa bạn qua 7 trạm di sản cung đình độc bản.`;
        } else if (q.includes('ảnh') || q.includes('chụp') || q.includes('check-in') || q.includes('sống ảo')) {
          fallbackText += `\n\n📸 **Góc Check-in Bí Mật Ít Người Biết:**\n- **Khung giờ vàng:** 7:00 - 8:30 sáng khi nắng sớm rọi xiên qua những bức tường vàng rêu phong và cửa sổ lá sách cổ.\n- Tọa độ GPS trên ứng dụng LocalQuest sẽ rung nhẹ để báo khi bạn đang đứng đúng góc chụp kinh điển của các nghệ nhân nhiếp ảnh bản địa!`;
        } else {
          fallbackText += `\n\n✨ **Lời khuyên đồng hành:**\n- Hành trình LocalQuest được thiết kế theo kịch bản tương tác thực tế kết hợp câu đố lịch sử dân gian độc bản.\n- Hãy chuẩn bị giày đi bộ thoải mái, sạc đầy điện thoại và sẵn sàng đón nhận những câu chuyện bất ngờ từ người dân địa phương!`;
        }
        return res.json({ success: true, source: 'curated_fallback', content: fallbackText });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `Bạn là LocalQuest AI Concierge - Chuyên gia Văn Hóa & Hướng Dẫn Viên Bản Địa (Local Guide) 24/7 thông minh, phong thái ấm áp, tao nhã, am hiểu sâu sắc văn hóa, lịch sử ngàn năm, ẩm thực gia truyền và các góc ảnh "hidden gems" tại Việt Nam (Hà Nội, Hội An, TP.HCM, Huế, Ninh Bình, Đà Lạt...).

Phong cách và quy tắc trả lời:
1. Văn phong: Ấm áp, nhiệt tình, am hiểu, như một nghệ nhân hoặc người bạn địa phương lâu năm dẫn đường.
2. Nội dung: Đưa ra thông tin chính xác, địa chỉ/ngõ phố cụ thể, khung giờ vàng tránh đông đúc, câu chuyện dân gian hoặc sự tích gắn liền với địa danh.
3. Định dạng: Trình bày súc tích với tiêu đề in đậm, biểu tượng cảm xúc nhã nhặn (🍜, 🏮, 🏛️, 📸, 💡), gạch đầu dòng rõ ràng.
4. Gợi ý Quest: Khi thảo luận về các chủ đề liên quan đến tour/trải nghiệm, hãy tự nhiên lồng ghép và nhắc đến tên các Quest có sẵn trong LocalQuest (ví dụ: "Bí Ẩn Phố Cổ Hà Nội", "Hương Vị Sài Gòn Xưa", "Ánh Sáng Đèn Lồng Hội An", "Huyền Thoại Sông Hương", "Dấu Chân Cố Đô Hoa Lư", "Sương Mù Đà Lạt 1930").`;

      // Build conversation contents
      const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      // Add previous history turns if provided
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-8)) { // keep last 8 turns for context
          formattedContents.push({
            role: item.role === 'model' || item.sender === 'ai' ? 'model' : 'user',
            parts: [{ text: item.content || item.text || '' }]
          });
        }
      }

      // Add the current prompt with context
      const promptText = `[Bối cảnh người dùng: Quest "${questName || 'Tự do'}", Điểm đến: "${city || destination || 'Việt Nam'}"${context ? `, Ghi chú: ${context}` : ''}]
Câu hỏi du khách: ${message}`;

      formattedContents.push({
        role: 'user',
        parts: [{ text: promptText }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const responseText = response.text || 'Tôi rất vui được đồng hành cùng bạn trên mọi nẻo đường di sản!';
      res.json({ success: true, source: 'gemini', content: responseText });
    } catch (error: any) {
      console.error('Error generating AI response:', error);
      const { message, questName, city, destination } = req.body;
      let fallbackText = `Chào bạn! Tôi là Trợ Lý Di Sản AI LocalQuest 24/7.`;
      const q = (message || '').toLowerCase();
      if (q.includes('ăn') || q.includes('món') || q.includes('quán') || q.includes('ngon')) {
        fallbackText += `\n\n🍜 **Gợi ý Ẩm thực Bản địa (${city || destination || 'Địa phương'}):**\n- Khám phá các quán ăn gia truyền trong hẻm nhỏ với tuổi đời trên 30 năm.\n- Thời gian lý tưởng: Sáng sớm từ 6:30 - 8:30 hoặc chiều tối để thưởng thức hương vị trọn vẹn nhất.`;
      } else if (q.includes('ảnh') || q.includes('chụp') || q.includes('check-in') || q.includes('sống ảo')) {
        fallbackText += `\n\n📸 **Góc Check-in Bí Mật:**\n- Chụp ảnh với ánh sáng tự nhiên lúc 7:30 sáng hoặc 16:30 chiều tại các trạm dừng lịch sử để có bức hình lung linh nhất.`;
      } else {
        fallbackText += `\n\n✨ **Gợi ý cho Quest "${questName || 'Hành trình khám phá'}":**\n- Chuẩn bị giày đi bộ thoải mái và điện thoại đầy pin để quét manh mối và trải nghiệm trọn vẹn các câu chuyện bản địa!`;
      }
      res.json({
        success: true,
        source: 'smart_fallback',
        content: fallbackText
      });
    }
  });

  // AI Narration & Audio Script Generator endpoint
  app.post('/api/ai/narrate', async (req, res) => {
    try {
      const { waypointName, baseStory, city, questName, theme } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.json({
          success: true,
          source: 'curated_fallback',
          script: `Chào mừng bạn đến với ${waypointName || 'trạm dừng này'} tại ${city || 'phố cổ'}. Hãy lắng tai nghe tiếng bước chân vang vọng trên những phiến đá rêu phong. Nơi đây chất chứa câu chuyện văn hóa ${theme || 'di sản'} hàng trăm năm được lưu truyền qua bao thế hệ người dân bản địa.`
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `Bạn là một nghệ nhân kể chuyện (Heritage Storyteller & Audio Guide) bản địa truyền cảm và uyên bác tại Việt Nam.
Hãy viết một kịch bản thuyết minh âm thanh ngắn gọn (khoảng 80-120 từ tiếng Việt) dành cho trạm dừng:
- Tên trạm dừng: "${waypointName || 'Trạm Khám Phá Di Sản'}"
- Thành phố / Vùng đất: "${city || 'Việt Nam'}"
- Thuộc hành trình Quest: "${questName || 'Hành Trình Khám Phá'}"
- Chủ đề: "${theme || 'Văn hoá Lịch sử'}"
- Tư liệu / ý tưởng cơ sở (nếu có): "${baseStory || ''}"

Yêu cầu:
1. Giọng điệu ấm áp, giàu hình ảnh, truyền cảm xúc, như một người bạn bản địa đang thì thầm kể lại bí sử hoặc vẻ đẹp độc bản của địa danh.
2. Nêu bật chi tiết đặc sắc (mùi hương, ánh sáng, âm thanh hoặc truyền thuyết).
3. Độ dài súc tích (khoảng 80 - 120 từ), hoàn hảo để phát trong Trình Phát Audio Nổi.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt
      });

      res.json({
        success: true,
        source: 'gemini',
        script: response.text || baseStory || `Chào mừng bạn đến với ${waypointName}!`
      });
    } catch (error: any) {
      console.error('Error in AI narrate:', error);
      const { waypointName, baseStory, city } = req.body;
      res.json({
        success: true,
        source: 'smart_fallback',
        script: baseStory || `Chào mừng bạn đến với ${waypointName || 'trạm dừng này'} tại ${city || 'Việt Nam'}. Hãy cùng lắng nghe câu chuyện lịch sử độc đáo nơi đây!`
      });
    }
  });

  // AI Quest Assistant endpoint (Gemini - kept for backward compatibility)
  app.post('/api/ai/quest-assistant', async (req, res) => {
    try {
      const { prompt, destination, touristType, language = 'vi' } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          success: true,
          source: 'curated_guide',
          content: `Chào bạn! Tôi là Hướng dẫn viên AI LocalQuest. Dưới đây là gợi ý hành trình trải nghiệm bản địa dành cho bạn tại ${destination || 'Việt Nam'}:\n\n1. 🍜 **Trải nghiệm Ẩm thực Đường phố**: Thưởng thức món ăn gia truyền tại các con ngõ nhỏ cùng hướng dẫn viên bản địa.\n2. 🏛️ **Khám phá Di sản Ẩn mình**: Tham quan các di tích và nghe các câu chuyện lịch sử dân gian ít người biết.\n3. 🎨 **Workshop Thủ công Truyền thống**: Trực tiếp làm gốm, thêu tranh hoặc vẽ nón lá cùng nghệ nhân lâu năm.\n\n💡 *Mẹo bản địa:* Hãy bắt đầu từ sáng sớm (6:00 - 8:30) để tận hưởng không khí trong lành và tránh đông đúc!`
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `Bạn là LocalQuest AI - Trợ lý du lịch và thiết kế nhiệm vụ trải nghiệm bản địa (Local Quests) chuyên nghiệp.
Nhiệm vụ của bạn:
1. Gợi ý các địa điểm "hidden gems" (viên ngọc ẩn) mà khách du lịch thông thường ít biết.
2. Thiết kế các quest (nhiệm vụ trải nghiệm) thú vị từng bước kèm mẹo bản địa, thời gian lý tưởng, món ăn phải thử.
3. Giải thích ngắn gọn văn hoá, lịch sử và cách chào hỏi bản địa bằng ngôn ngữ ${language === 'vi' ? 'Tiếng Việt' : 'English'}.
4. Trả lời thân thiện, súc tích, trình bày rõ ràng với biểu tượng cảm xúc và bullet points.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\n\nThông tin người dùng yêu cầu:\nĐịa điểm: ${destination || 'Tự do'}\nKiểu khách du lịch: ${touristType || 'Thích khám phá văn hoá và ẩm thực'}\nYêu cầu cụ thể: ${prompt || 'Gợi ý các nhiệm vụ du lịch độc đáo'}` }]
          }
        ]
      });

      const responseText = response.text || 'Không có phản hồi từ AI.';
      res.json({ success: true, source: 'gemini', content: responseText });
    } catch (error: any) {
      console.error('Error generating AI response:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Lỗi xử lý AI',
        fallback: 'Hệ thống gợi ý: Hãy thử ghé thăm các khu chợ địa phương vào lúc sáng sớm và giao lưu cùng người bán hàng để có trải nghiệm chân thực nhất.'
      });
    }
  });

  // Vite middleware for development vs static in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LocalQuest Tourist Web server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
