// ■■■ Google Gemini API Service for LocalQuest ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
// Tệp tích hợp chính thức Google Gemini API qua Server-Side API cho Thuyết Minh & Trợ Lý AI 24/7

import { Quest } from './types';

export interface AIChatMessage {
  id?: string;
  sender: 'ai' | 'user';
  role?: 'model' | 'user';
  text: string;
  timestamp?: string;
  recommendedQuestId?: number;
}

/**
 * Tìm kiếm Quest liên quan trong danh sách khi AI trả lời hoặc người dùng hỏi
 */
export function findMatchingQuest(text: string, quests: Quest[]): Quest | null {
  if (!text || !quests || quests.length === 0) return null;
  const lower = text.toLowerCase();

  // 1. Exact or partial match on quest name
  for (const q of quests) {
    if (lower.includes(q.name.toLowerCase())) {
      return q;
    }
  }

  // 2. City or theme keywords match
  if (lower.includes('phố cổ') || lower.includes('hồ gươm') || lower.includes('tháp bút') || lower.includes('hàng bạc')) {
    return quests.find((q) => q.name.includes('Phố Cổ') || q.city === 'Hà Nội') || null;
  }
  if (lower.includes('hội an') || lower.includes('chùa cầu') || lower.includes('đèn lồng')) {
    return quests.find((q) => q.city === 'Hội An') || null;
  }
  if (lower.includes('huế') || lower.includes('kinh thành') || lower.includes('sông hương')) {
    return quests.find((q) => q.city === 'Huế') || null;
  }
  if (lower.includes('sài gòn') || lower.includes('chợ lớn') || lower.includes('bến thành')) {
    return quests.find((q) => q.city === 'TP. Hồ Chí Minh') || null;
  }
  if (lower.includes('ninh bình') || lower.includes('hoa lư') || lower.includes('tràng an')) {
    return quests.find((q) => q.city === 'Ninh Bình') || null;
  }
  if (lower.includes('đà lạt') || lower.includes('sương mù') || lower.includes('biệt thự')) {
    return quests.find((q) => q.city === 'Đà Lạt') || null;
  }

  return null;
}

/**
 * Tạo kịch bản thuyết minh âm thanh truyền cảm từ Gemini API (Server-side)
 */
export async function generateGeminiStory(waypointName: string, baseStory: string, city = 'Việt Nam'): Promise<string> {
  try {
    const response = await fetch('/api/ai/narrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ waypointName, baseStory, city })
    });
    if (response.ok) {
      const data = await response.json();
      if (data.script) return data.script;
    }
  } catch (err) {
    console.warn('[Gemini API] Server narration fallback:', err);
  }
  return baseStory || `Chào mừng bạn đến với trạm dừng ${waypointName}! Hãy lắng nghe câu chuyện lịch sử văn hóa đặc sắc tại nơi này.`;
}

/**
 * AI Sinh Kịch Bản Thuyết Minh Âm Thanh theo trạm dừng cho Local Guide (Gemini 2.5 Flash Engine)
 */
export async function generateWaypointScriptWithGemini(
  waypointName: string,
  city = 'Việt Nam',
  questName?: string,
  theme?: string,
  baseStory?: string
): Promise<string> {
  try {
    const response = await fetch('/api/ai/narrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ waypointName, baseStory, city, questName, theme })
    });
    if (response.ok) {
      const data = await response.json();
      if (data.script) return data.script;
    }
  } catch (err) {
    console.warn('[Gemini API] Waypoint script generation notice:', err);
  }
  return `Chào mừng bạn đến với trạm dừng ${waypointName} tại ${city}. Từng phiến đá rêu phong và góc phố cổ nơi đây chất chứa câu chuyện văn hóa ngàn năm được truyền qua bao thế hệ. Hãy cùng khám phá và sẵn sàng cho mật thư bí ẩn tiếp theo!`;
}

/**
 * Gọi Google Gemini AI (Server-side) giải đáp thắc mắc du khách thời gian thực 24/7
 */
export async function askGeminiAiGuide(
  userQuestion: string,
  locationOrQuestName = 'Việt Nam',
  history: AIChatMessage[] = [],
  city?: string
): Promise<string> {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userQuestion,
        history,
        questName: locationOrQuestName,
        city: city || locationOrQuestName,
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.content) return data.content;
    }
  } catch (err) {
    console.warn('[Gemini API] Server chat fallback:', err);
  }

  // Contextual fallback response
  const q = (userQuestion || '').toLowerCase();
  if (q.includes('ăn') || q.includes('món') || q.includes('quán') || q.includes('phở')) {
    return `🍜 **Gợi ý Ẩm thực Bản địa:** Tại ${locationOrQuestName}, bạn nhất định phải thử các món gia truyền hơn 30 năm trong ngõ cổ! Người dân thường ăn vào sáng sớm (6:30 - 8:30) hoặc lúc chập tối.\n\n💡 *Gợi ý Quest:* Tham gia các tour khám phá ẩm thực để được nghệ nhân dẫn vào từng góc bếp độc bản!`;
  }
  if (q.includes('ảnh') || q.includes('chụp') || q.includes('check-in')) {
    return `📸 **Góc Check-in Bí Mật:** Góc chụp ảnh đẹp nhất tại ${locationOrQuestName} là lúc 7h30 sáng hoặc 16h45 chiều khi ánh nắng vàng rọi qua các mái ngói rêu phong!\n\n💡 *Mẹo:* Khi bạn đến gần trạm dừng, bản đồ sẽ tự động rung để chỉ dẫn góc chụp đẹp nhất.`;
  }
  if (q.includes('hội an') || q.includes('chùa cầu')) {
    return `🏮 **Sự tích Chùa Cầu Hội An:** Cây cầu ngói độc đáo do các thương nhân Nhật Bản dựng vào thế kỷ 17 nhằm trấn yểm con thủy quái Mamazu. Bạn nên ghé vào buổi hoàng hôn khi hàng trăm chiếc đèn lồng hoa đăng lung linh soi bóng dòng sông Hoài.`;
  }
  if (q.includes('huế')) {
    return `👑 **Kinh thành Huế Cổ Kính:** Nơi lưu giữ hào khí triều Nguyễn với 13 đời vua. Đừng quên lắng nghe ca Huế trên sông Hương và thưởng thức chè hẻm gia truyền!`;
  }
  return `🤖 [Trợ Lý AI Di Sản]: Về thắc mắc "${userQuestion}" tại ${locationOrQuestName}, đây là điểm đến độc đáo với nhiều câu chuyện thú vị chờ bạn trải nghiệm!`;
}


