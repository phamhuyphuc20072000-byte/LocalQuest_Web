import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Volume2, 
  Compass, 
  Flame, 
  Utensils, 
  Minimize2, 
  Maximize2,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  Headphones,
  MapPin,
  Star
} from 'lucide-react';
import { useQuest } from '../../context/QuestContext';
import { askGeminiAiGuide, findMatchingQuest } from '../../gemini';
import { Quest } from '../../types';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  recommendedQuest?: Quest | null;
  isTyping?: boolean;
}

const QUICK_SUGGESTIONS = [
  '🍜 Quán phở gia truyền & phở gánh ngon nhất phố cổ?',
  '🏮 Sự tích Chùa Cầu & góc chụp ảnh bí mật Hội An?',
  '👑 Lịch trình 1 ngày khám phá trọn vẹn Kinh thành Huế?',
  '☕ Cà phê trứng ngõ cổ Hà Nội quán nào chuẩn vị nhất?',
  '🛵 Khám phá Chợ Lớn Sài Gòn ăn gì và đi đâu?',
  '🌿 Bí ẩn dấu ấn Đinh - Lê tại Cố Đô Hoa Lư?'
];

export function AiChatWidget() {
  const { quests, selectedQuest, selectedCity, navigateToQuestDetail, playAudio } = useQuest();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Dạ chào bạn! Tôi là Trợ Lý Di Sản & Local Guide AI 24/7 của LocalQuest (Gemini 2.5 Flash Engine).\n\nBạn đang quan tâm đến ẩm thực gia truyền, sự tích lịch sử, góc chụp ảnh bí mật hay cần gợi ý hành trình khám phá tại điểm đến nào hôm nay?`,
      timestamp: 'Vừa xong',
      recommendedQuest: null
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Clean up typing timer
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearInterval(typingTimerRef.current);
    };
  }, []);

  // Smooth typewriter text streamer
  const simulateTypewriter = (fullText: string, aiMsgId: string, matchedQuest: Quest | null) => {
    let index = 0;
    const speed = 12; // ms per step
    const chunkSize = 3;

    typingTimerRef.current = setInterval(() => {
      index += chunkSize;
      if (index >= fullText.length) {
        clearInterval(typingTimerRef.current);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? { ...m, text: fullText, isTyping: false, recommendedQuest: matchedQuest }
              : m
          )
        );
        setIsLoading(false);
      } else {
        const currentSlice = fullText.slice(0, index);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId ? { ...m, text: currentSlice, isTyping: true } : m
          )
        );
      }
    }, speed);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputValue).trim();
    if (!textToSend || isLoading) return;

    const userMsgId = 'user-' + Date.now();
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputValue('');
    setIsLoading(true);

    const aiMsgId = 'ai-' + (Date.now() + 1);
    const placeholderAiMsg: ChatMessage = {
      id: aiMsgId,
      sender: 'ai',
      text: '',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isTyping: true
    };
    setMessages((prev) => [...prev, placeholderAiMsg]);

    try {
      // Build history
      const historyTurns = messages
        .filter((m) => m.text && !m.isTyping)
        .slice(-6)
        .map((m) => ({
          sender: m.sender,
          text: m.text,
          role: (m.sender === 'ai' ? 'model' : 'user') as 'model' | 'user'
        }));

      const locationContext = selectedCity !== 'Tất cả' ? selectedCity : selectedQuest?.city || 'Việt Nam';
      const aiResponse = await askGeminiAiGuide(
        textToSend,
        selectedQuest?.name || locationContext,
        historyTurns,
        locationContext
      );

      // Find matching quest for smart recommendation
      const matched = findMatchingQuest(`${textToSend} ${aiResponse}`, quests);

      // Stream text response smoothly
      simulateTypewriter(aiResponse, aiMsgId, matched);
    } catch (error) {
      console.warn('Gemini chat widget notice:', error);
      const fallbackText = `Mẹo bản địa cho bạn: Khi khám phá các phố cổ, bạn nên đi vào khung giờ sáng sớm (6:30 - 8:30) hoặc chiều mát (16:30 - 18:00) để tận hưởng không gian tĩnh lặng và ẩm thực gia truyền chuẩn vị nhất!`;
      simulateTypewriter(fallbackText, aiMsgId, selectedQuest || quests[0] || null);
    }
  };

  const handleSendToAudioPlayer = (title: string, text: string) => {
    playAudio({
      title: `Trợ lý AI: ${title.slice(0, 30)}...`,
      questName: selectedQuest?.name || 'LocalQuest AI Guide',
      script: text,
      city: selectedCity !== 'Tất cả' ? selectedCity : 'Việt Nam'
    });
  };

  const handleSpeakBrowser = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'ai',
        text: `Chào bạn! Tôi đã làm mới hội thoại. Bạn muốn tôi hỗ trợ tìm quán ăn ngon, góc check-in hay giải mã câu đố tại địa phương nào?`,
        timestamp: 'Vừa xong',
        recommendedQuest: null
      }
    ]);
  };

  return (
    <>
      {/* 1. Floating FAB Button */}
      {!isOpen && (
        <button
          id="btn-open-ai-chat"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group"
          style={{
            background: 'linear-gradient(135deg, #0F2D1E 0%, #1C4A32 100%)',
            border: '1.5px solid #D4AF37',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(212, 175, 55, 0.35)'
          }}
          title="Trợ lý AI Hướng Dẫn Viên Bản Địa 24/7 (Gemini 2.5 Flash)"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin [animation-duration:8s]" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>
          <div className="text-left">
            <span className="block font-heritage text-xs font-bold text-amber-200 leading-tight">
              Hỏi Local AI Guide
            </span>
            <span className="block font-mono text-[9px] text-emerald-300 uppercase tracking-widest leading-none mt-0.5">
              Gemini 2.5 Flash
            </span>
          </div>
        </button>
      )}

      {/* 2. Floating AI Chat Modal */}
      {isOpen && (
        <div 
          id="ai-chat-widget-modal"
          className={`fixed z-50 rounded-2xl overflow-hidden shadow-2xl flex flex-col border transition-all duration-300 animate-in zoom-in-95 ${
            isExpanded
              ? 'inset-4 sm:inset-10 max-w-4xl mx-auto'
              : 'bottom-6 right-4 sm:right-6 w-[94vw] sm:w-[420px] max-h-[620px] h-[85vh]'
          }`}
          style={{
            background: '#FDFAF5',
            borderColor: '#D4AF37',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65), 0 0 30px rgba(212, 175, 55, 0.25)'
          }}
        >
          {/* Header */}
          <div 
            className="px-4 sm:px-5 py-3.5 flex items-center justify-between flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #0F2D1E 0%, #1C4A32 100%)',
              borderBottom: '1.5px solid rgba(212, 175, 55, 0.4)'
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300 shadow-md flex-shrink-0">
                <Bot size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="font-heritage text-sm sm:text-base font-bold text-amber-200 m-0 truncate flex items-center gap-2">
                  <span>LocalQuest AI Concierge</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono border border-emerald-400/40">
                    2.5 FLASH
                  </span>
                </h3>
                <p className="text-[11px] font-mono text-stone-300 m-0 flex items-center gap-1.5 mt-0.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Chuyên gia Văn Hóa & Hướng Dẫn Viên Bản Địa 24/7</span>
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-lg text-stone-300 hover:text-amber-300 hover:bg-white/10 transition-colors"
                title="Làm mới hội thoại"
              >
                <RotateCcw size={16} />
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-stone-300 hover:text-amber-300 hover:bg-white/10 transition-colors hidden sm:block"
                title={isExpanded ? 'Thu nhỏ cửa sổ' : 'Phóng to cửa sổ'}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              <button
                id="btn-close-ai-chat"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Đóng cửa sổ"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Suggestions Chips Carousel */}
          <div className="px-3 py-2 bg-[#F4EFE6] border-b border-stone-300/80 overflow-x-auto flex items-center gap-1.5 flex-shrink-0 scrollbar-none">
            {QUICK_SUGGESTIONS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-white border border-amber-500/30 text-[11px] font-medium text-stone-800 hover:bg-amber-100 hover:text-amber-950 transition-colors shadow-xs flex-shrink-0 flex items-center gap-1"
              >
                <span>{chip}</span>
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-4 font-luxury-sans">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-[#0F2D1E] text-amber-300 border border-amber-500/50 flex items-center justify-center flex-shrink-0 text-xs mt-1 shadow-xs">
                    <Sparkles size={14} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm relative group ${
                    m.sender === 'user'
                      ? 'bg-[#1C4A32] text-amber-50 rounded-br-none border border-emerald-700'
                      : 'bg-white text-stone-800 rounded-bl-none border border-stone-300/90'
                  }`}
                >
                  <p className="m-0 whitespace-pre-line font-normal">
                    {m.text}
                    {m.isTyping && <span className="inline-block w-1.5 h-3.5 bg-amber-600 ml-1 animate-pulse" />}
                  </p>

                  {/* Smart Quest Recommendation Card inside chat */}
                  {m.recommendedQuest && (
                    <div className="mt-3 pt-2.5 border-t border-stone-200/90 animate-in fade-in duration-300">
                      <div className="p-2.5 rounded-xl bg-[#F7F4EE] border border-amber-500/30 flex items-center gap-3 hover:border-amber-500/60 transition-colors">
                        <img
                          src={`https://images.unsplash.com/photo-${m.recommendedQuest.imageId}?w=160&auto=format&fit=crop&q=80`}
                          alt={m.recommendedQuest.name}
                          className="w-14 h-14 rounded-lg object-cover border border-amber-400/40 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 text-[10px] text-amber-800 font-mono font-bold">
                            <Compass size={11} />
                            <span>QUEST ĐỀ XUẤT</span>
                          </div>
                          <h5 className="font-heritage font-bold text-xs text-stone-900 truncate m-0 mt-0.5">
                            {m.recommendedQuest.name}
                          </h5>
                          <p className="text-[10px] text-stone-500 font-mono m-0 mt-0.5 flex items-center gap-2">
                            <span>{m.recommendedQuest.city}</span>
                            <span>•</span>
                            <span className="text-amber-700 font-bold">
                              {m.recommendedQuest.price.toLocaleString('vi-VN')} đ
                            </span>
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            navigateToQuestDetail(m.recommendedQuest!);
                            setIsOpen(false);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#0F2D1E] text-amber-300 hover:bg-[#1C4A32] text-[10px] font-bold font-mono transition-colors flex items-center gap-1 flex-shrink-0 border border-amber-500/40"
                        >
                          <span>Xem</span>
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Message Timestamp & Speech actions */}
                  <div className="flex items-center justify-between gap-3 mt-2 pt-1.5 border-t border-black/5 text-[10px] text-stone-400 font-mono">
                    <span>{m.timestamp}</span>
                    {m.sender === 'ai' && m.text && !m.isTyping && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSendToAudioPlayer('LocalQuest AI', m.text)}
                          className="text-amber-800 hover:text-amber-950 flex items-center gap-1 font-semibold"
                          title="Chuyển vào Trình Phát Audio Nổi"
                        >
                          <Headphones size={12} /> Phát Audio
                        </button>
                        <button
                          onClick={() => handleSpeakBrowser(m.text)}
                          className="text-stone-500 hover:text-stone-800 flex items-center gap-0.5"
                          title="Đọc nhanh"
                        >
                          <Volume2 size={12} /> Đọc
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && !messages.some((m) => m.isTyping) && (
              <div className="flex gap-2.5 items-center text-xs text-stone-500 font-mono">
                <div className="w-7 h-7 rounded-lg bg-[#0F2D1E] text-amber-300 border border-amber-500/40 flex items-center justify-center">
                  <Sparkles size={14} className="animate-spin" />
                </div>
                <div className="p-3 bg-white rounded-2xl rounded-bl-none border border-stone-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.1s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce [animation-delay:0.3s]" />
                  <span className="ml-1 text-[11px] text-stone-500">Gemini 2.5 Flash đang phân tích di sản...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-stone-300 flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                id="input-ai-chat-question"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Hỏi về địa điểm, quán ăn gia truyền, bí ẩn lịch sử..."
                className="flex-1 px-4 py-2.5 text-xs bg-[#F7F4EE] rounded-xl border border-stone-300 focus:outline-none focus:border-[#1C4A32] font-luxury-sans text-stone-900 placeholder:text-stone-400"
              />
              <button
                id="btn-ai-chat-send"
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-2.5 rounded-xl bg-[#1C4A32] text-amber-300 hover:bg-[#0F2D1E] disabled:opacity-40 transition-colors shadow-md border border-amber-500/40 flex items-center justify-center flex-shrink-0"
                title="Gửi câu hỏi"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
