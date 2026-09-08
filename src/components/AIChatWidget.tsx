import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, X, Send, Volume2, VolumeX, RotateCcw, Compass, MapPin, ChevronDown } from 'lucide-react';
import { askGeminiAiGuide, AIChatMessage } from '../gemini';
import { vietnameseSpeech } from '../utils/vietnameseSpeech';

// Hàm render chữ in đậm và định dạng dòng cho câu trả lời của AI
function renderFormattedMessage(text: string, isUser: boolean) {
  return text.split('\n').map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={lineIdx} className="block min-h-[1.25em]">
        {parts.map((part, partIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong
                key={partIdx}
                className={isUser ? 'font-bold text-white' : 'font-bold text-stone-950'}
              >
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        })}
      </span>
    );
  });
}
// Function AIChatWidget
export function AIChatWidget({
  currentQuestName,
  currentCity
}: {
  currentQuestName?: string;
  currentCity?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      sender: 'ai',
      text: `Xin chào! Tôi là Trợ Lý AI LocalQuest 24/7. Tôi có thể gợi ý các quán ăn gia truyền, điểm check-in ít người biết, hay hướng dẫn mẹo làm nhiệm vụ Quest tại ${currentCity || 'Việt Nam'}. Bạn muốn khám phá điều gì hôm nay?`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Tự động focus vào ô nhập khi mở khung chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus(); // inputRef: Tự động đưa con trỏ vào ô nhập ngay khi người dùng bấm mở chat để có thể gõ phím ngay.
    }
  }, [isOpen, isMinimized]);

  // Cleanup âm thanh khi unmount & hỗ trợ bấm phím Escape để đóng nhanh
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        vietnameseSpeech.stop();
        setSpeakingIndex(null);
        setIsOpen(false);  // Bấm phím Esc trên bàn phím là đóng khung chat ngay.
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {  // Dừng ngay giọng nói nếu người dùng đóng tab hoặc chuyển trang, không để âm thanh phát ngầm.

      window.removeEventListener('keydown', handleKeyDown);
      vietnameseSpeech.stop();
    };
  }, [isOpen]);

  // Handle Text-to-speech audio narration with pure Vietnamese native voice
  const handleSpeak = (text: string, index: number) => {
    if (speakingIndex === index) {
      vietnameseSpeech.stop();
      setSpeakingIndex(null);
      return;
    }

    setSpeakingIndex(index);
    vietnameseSpeech.speak(text, {
      rate: 1.0,
      onEnd: () => setSpeakingIndex(null),
      onError: () => setSpeakingIndex(null)
    });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg: AIChatMessage = {
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const reply = await askGeminiAiGuide(
        text,
        currentQuestName || 'Hành trình LocalQuest',
        newMessages,
        currentCity || 'Hà Nội'
      );

      const aiMsg: AIChatMessage = {
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      const errorMsg: AIChatMessage = {
        sender: 'ai',
        text: 'Mẹo bản địa: Hãy ghé thăm các con hẻm cổ vào sáng sớm (6h30-8h00) để cảm nhận trọn vẹn nét văn hóa và thưởng thức ẩm thực nóng hổi!',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickSuggestions = [
    '🍜 Quán ăn gia truyền ngon nhất?',
    '📸 Góc chụp ảnh bí mật ít người?',
    '📜 Bí ẩn lịch sử khu phố này?',
    '💡 Mẹo hoàn thành Quest điểm cao?'
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          id="btn-open-ai-chat"
          onClick={() => { setIsOpen(true); setIsMinimized(false); }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #132E1F 0%, #1C4A32 100%)',
            border: '1.5px solid #C97D1A',
            color: '#FDFAF5',
            boxShadow: '0 12px 32px rgba(19, 46, 31, 0.45)'
          }}
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-stone-950 font-bold text-sm">
            🤖
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-stone-900 rounded-full animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-stone-900 rounded-full" />
          </div>
          <div className="text-left">
            <span className="block text-xs font-bold text-amber-400 tracking-wide font-mono">LOCALQUEST AI</span>
            <span className="block text-[11px] text-stone-300 font-sans">Trợ Lý Du Lịch 24/7</span>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          id="ai-chat-window"
          className={`fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-50 w-[92vw] sm:w-[420px] rounded-2xl shadow-2xl border flex flex-col transition-all duration-300 ${
            isMinimized ? 'h-14' : 'h-[580px] max-h-[85vh]'
          }`}
          style={{
            background: '#FDFAF5',
            borderColor: '#C97D1A',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)'
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 rounded-t-2xl flex items-center justify-between cursor-pointer select-none"
            style={{ background: '#132E1F', color: '#FDFAF5' }}
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-stone-950 text-base shadow-sm">
                🤖
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-amber-400 font-serif m-0">Trợ Lý AI LocalQuest</h4>
                  <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-medium">ONLINE</span>
                </div>
                <p className="text-[10px] text-stone-300 font-mono m-0">
                  {currentQuestName ? `Quest: ${currentQuestName}` : `Khu vực: ${currentCity || 'Toàn quốc'}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 text-stone-400 hover:text-white rounded transition-colors"
                title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
              </button>
              <button
                onClick={() => {
                  vietnameseSpeech.stop();
                  setSpeakingIndex(null);
                  setIsOpen(false);
                }}
                className="p-1 text-stone-400 hover:text-white rounded transition-colors"
                title="Đóng chat (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Context Banner */}
              <div className="px-4 py-2 bg-amber-50 border-b border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
                <span className="flex items-center gap-1 font-medium text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Được hỗ trợ bởi Google Gemini AI
                </span>
                <button
                  onClick={() => {
                    setMessages([
                      {
                        sender: 'ai',
                        text: `Cuộc trò chuyện đã được làm mới! Bạn muốn tôi gợi ý gì về ẩm thực, lịch sử hay mẹo chơi Quest tại ${currentCity || 'Việt Nam'}?`,
                        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                      }
                    ]);
                  }}
                  className="text-[11px] text-amber-800 hover:text-amber-950 flex items-center gap-1 font-mono"
                  title="Xoá lịch sử hội thoại"
                >
                  <RotateCcw className="w-3 h-3" /> Làm mới
                </button>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs sm:text-sm bg-stone-50/50">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] p-3 rounded-2xl leading-relaxed whitespace-pre-line shadow-sm relative group ${
                        m.sender === 'user'
                          ? 'bg-[#1C4A32] text-[#FDFAF5] rounded-br-none font-sans font-medium'
                          : 'bg-[#FDFAF5] border border-stone-200 text-stone-900 rounded-bl-none'
                      }`}
                    >
                      <div className="m-0 text-xs sm:text-[13px] leading-relaxed">
                        {renderFormattedMessage(m.text, m.sender === 'user')}
                      </div>
                      
                      {/* Audio Speak button for AI messages */}
                      {m.sender === 'ai' && (
                        <div className="mt-2 pt-1.5 border-t border-stone-200/60 flex items-center justify-between">
                          <span className="text-[10px] text-stone-400 font-mono">{m.timestamp}</span>
                          <button
                            onClick={() => handleSpeak(m.text, idx)}
                            className="flex items-center gap-1 text-[11px] text-[#C97D1A] hover:text-[#1C4A32] font-semibold transition-colors"
                            title="Nghe đọc giọng AI"
                          >
                            {speakingIndex === idx ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                                <span className="text-red-500">Dừng đọc</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Nghe giọng đọc</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    {m.sender === 'user' && (
                      <span className="text-[10px] text-stone-400 font-mono mt-1 px-1">{m.timestamp}</span>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 p-3 bg-stone-100 rounded-2xl text-stone-600 text-xs w-fit">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] font-mono text-stone-500">AI đang suy nghĩ và tổng hợp dữ liệu bản địa...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Chips */}
              <div className="px-3 py-2 bg-[#FDFAF5] border-t border-stone-200/80 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                {quickSuggestions.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(chip)}
                    disabled={loading}
                    className="px-2.5 py-1 rounded-full bg-stone-100 hover:bg-amber-100 hover:text-amber-900 border border-stone-200 text-stone-700 whitespace-nowrap transition-colors flex-shrink-0 disabled:opacity-50"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <div className="p-3 border-t border-stone-200 bg-[#FDFAF5] rounded-b-2xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Hỏi về quán ăn, góc chụp ảnh, lịch sử..."
                    disabled={loading}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-900 text-xs focus:outline-none focus:border-[#C97D1A] shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || loading}
                    className="px-4 py-2.5 rounded-xl bg-[#C97D1A] hover:bg-[#b06c13] text-white font-bold text-xs transition-colors flex items-center justify-center disabled:opacity-40 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
