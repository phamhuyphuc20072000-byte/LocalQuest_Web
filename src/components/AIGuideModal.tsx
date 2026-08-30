import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  Compass,
  MapPin,
  Utensils,
  BookOpen,
  RefreshCw,
  MessageSquare
} from 'lucide-react';

interface AIGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AIGuideModal: React.FC<AIGuideModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: 'Xin chào! Tôi là Hướng dẫn viên Du lịch AI LocalQuest. Bạn đang muốn khám phá những bí mật địa phương nào ở Việt Nam (Hà Nội, Hội An, Sài Gòn, Đà Lạt, Ninh Bình...)?',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState('Hà Nội');

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputPrompt;
    if (!messageText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: messages.map(m => ({ role: m.sender === 'ai' ? 'model' : 'user', content: m.text })),
          destination: selectedDestination,
          city: selectedDestination,
          context: `Khu vực tìm kiếm: ${selectedDestination}. Du khách yêu thích trải nghiệm bản địa chân thực, ẩm thực đường phố và các góc phố cổ.`
        })
      });

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: data.content || 'Tôi rất vui được hỗ trợ bạn khám phá!',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: any) {
      const errorMsg: ChatMessage = {
        id: 'ai-err-' + Date.now(),
        sender: 'ai',
        text: 'Mẹo bản địa: Hãy thử ghé thăm các con hẻm cổ vào sáng sớm (6h30-8h00) để thưởng thức phở gánh hoặc cà phê vợt nóng hổi!',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Quán cà phê trứng ngon nhất phố cổ Hà Nội?',
    'Lộ trình 1 ngày khám phá Hội An vắng khách',
    'Tìm địa điểm ăn đêm chuẩn vị Chợ Lớn Sài Gòn',
    'Kinh nghiệm săn mây Cầu Đất Đà Lạt lúc 5h sáng'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        id="ai-guide-modal"
        className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl text-stone-100 overflow-hidden flex flex-col h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Trợ lý Du lịch AI LocalQuest</h3>
              <p className="text-xs text-stone-400">Gợi ý địa điểm ẩn & Lập lịch trình nhiệm vụ bản địa</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Location Pills */}
        <div className="px-6 py-2 bg-stone-950/40 border-b border-stone-800/80 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-stone-500 font-medium whitespace-nowrap">Khu vực:</span>
          {['Hà Nội', 'Hội An / Đà Nẵng', 'TP. Hồ Chí Minh', 'Đà Lạt', 'Ninh Bình'].map((dest) => (
            <button
              key={dest}
              onClick={() => setSelectedDestination(dest)}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors ${
                selectedDestination === dest
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {dest}
            </button>
          ))}
        </div>

        {/* Chat Conversation Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs sm:text-sm">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] p-4 rounded-2xl shadow-sm space-y-1 ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-stone-950 font-medium rounded-br-none'
                    : 'bg-stone-950 border border-stone-800 text-stone-200 rounded-bl-none leading-relaxed whitespace-pre-line'
                }`}
              >
                <p>{msg.text}</p>
                <span
                  className={`text-[10px] block ${
                    msg.sender === 'user' ? 'text-stone-800 text-right' : 'text-stone-500'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 text-amber-400 flex items-center gap-2 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI đang tìm kiếm các gợi ý bản địa độc đáo nhất...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Quick Questions */}
        <div className="px-6 py-2 border-t border-stone-800/80 bg-stone-950/50 overflow-x-auto flex items-center gap-2">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1 rounded-full bg-stone-900 hover:bg-stone-800 border border-stone-700/60 text-stone-300 text-[11px] whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-stone-800 bg-stone-950">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={`Hỏi về món ăn, địa điểm bí mật tại ${selectedDestination}...`}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-900 border border-stone-700 text-stone-100 placeholder-stone-500 text-xs focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || loading}
              className="p-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
