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

  // AI Quest Assistant endpoint (Gemini)
  app.post('/api/ai/quest-assistant', async (req, res) => {
    try {
      const { prompt, destination, touristType, language = 'vi' } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Fallback with rich intelligent response if API key is not configured
        return res.json({
          success: true,
          source: 'curated_guide',
          content: `Chào bạn! Tôi là Hướng dẫn viên AI LocalQuest. Dưới đây là gợi ý hành trình trải nghiệm bản địa dành cho bạn tại ${destination || 'Việt Nam'}:\n\n1. 🍜 **Trải nghiệm Ẩm thực Đường phố**: Thưởng thức món ăn gia truyền tại các con ngõ nhỏ cùng hướng dẫn viên bản địa.\n2. 🏛️ **Khám phá Di sản Ẩn mình**: Tham quan các di tích và nghe các câu chuyện lịch sử dân gian ít người biết.\n3. 🎨 **Workshop Thủ công Truyền thống**: Trực tiếp làm gốm, thêu tranh hoặc vẽ nón lá cùng nghệ nhân lâu năm.\n\n💡 *Mẹo bản địa:* Hãy bắt đầu từ sáng sớm (6:00 - 8:30) để tận hưởng không khí trong lành và tránh đông đúc!`
        });
      }

      const ai = new GoogleGenAI({ apiKey });
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
