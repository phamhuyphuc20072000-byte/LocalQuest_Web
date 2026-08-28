// ■■■ Google Gemini API Service for LocalQuest ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
// Tệp tích hợp chính thức Google Gemini API cho Thuyết Minh AI & Trợ Lý AI 24/7

export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""; 

export async function generateGeminiStory(waypointName: string, baseStory: string) {
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Bạn là Hướng dẫn viên bản địa am hiểu sâu sắc. Hãy tạo 1 kịch bản thuyết minh âm thanh ngắn (khoảng 80-100 từ) truyền cảm, hấp dẫn cho trạm dừng "${waypointName}" dựa trên tư liệu: ${baseStory}`
              }
            ]
          }
        ]
      })
    });
    const data = await response.json();
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }
  } catch (err) {
    console.warn("[Gemini API] Chi tiết gọi API fallback:", err);
  }
  return baseStory;
}

/**
 * Gọi Google Gemini API giải đáp thắc mắc du khách thời gian thực 24/7
 */
export async function askGeminiAiGuide(userQuestion: string, locationName: string) {
  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Bạn là Trợ Lý AI Local Guide 24/7 tại địa điểm "${locationName}". Hãy trả lời câu hỏi du khách ngắn gọn (2-3 câu), thân thiện: "${userQuestion}"`
              }
            ]
          }
        ]
      })
    });
    const data = await response.json();
    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      return data.candidates[0].content.parts[0].text;
    }
  } catch (err) {
    console.warn("[Gemini API] Chi tiết trả lời chatbot fallback:", err);
  }
  return `🤖 [Trợ Lý AI Local Bot]: Về "${userQuestion}" tại ${locationName}, đây là một địa điểm tuyệt vời với nhiều nét văn hóa độc đáo!`;
}
