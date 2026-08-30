import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  HelpCircle, 
  Award, 
  Compass, 
  ArrowRight,
  RefreshCw,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useQuest } from '../../context/QuestContext';
import { useAuth } from '../../context/AuthContext';
import { LeafletTreasureMap } from '../../components/maps/LeafletTreasureMap';

export function GameplayPage() {
  const { selectedQuest, activeTicket, setActivePage, playAudio, audioTrack, toggleAudioPlay } = useQuest();
  const { updatePoints } = useAuth();

  const quest = selectedQuest;
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);

  if (!quest) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <p className="text-stone-600 font-luxury-sans">Chưa chọn Quest để bắt đầu chơi.</p>
        <button onClick={() => setActivePage('EXPLORE')} className="btn-gold-aura text-xs mt-4">
          Quay lại Khám Phá
        </button>
      </div>
    );
  }

  const waypoint = quest.waypoints[currentStep] || quest.waypoints[0];

  const playWaypointAudio = () => {
    if (audioTrack && audioTrack.title === waypoint.name && audioTrack.isPlaying) {
      toggleAudioPlay();
      return;
    }
    playAudio({
      title: waypoint.name,
      questName: quest.name,
      script: waypoint.script,
      city: quest.city,
      waypointIndex: currentStep,
      questId: quest.id
    });
  };

  const handleGetAiHint = async () => {
    if (loadingHint) return;
    setLoadingHint(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Tôi đang chơi Quest "${quest.name}" tại trạm "${waypoint.name}". Câu đố là: "${waypoint.question}". Hãy cho tôi 1 gợi ý (hint) thông minh, hóm hỉnh mà không nói toẹt ngay đáp án.`,
          questName: quest.name,
          city: quest.city,
          context: `Trạm ${currentStep + 1}: ${waypoint.name}. Đáp án đúng là: ${waypoint.answers[waypoint.correct]}`
        })
      });
      const data = await response.json();
      setAiHint(data.content || `💡 Gợi ý AI: Hãy quan sát kỹ các kiến trúc và bảng chỉ dẫn cổ kính quanh ${waypoint.name}!`);
    } catch (e) {
      setAiHint(`💡 Gợi ý AI: Hãy chú ý các đặc điểm văn hóa truyền thống đặc trưng của ${quest.city}!`);
    } finally {
      setLoadingHint(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAns(index);
    setIsAnswered(true);
    if (index === waypoint.correct) {
      setScore((prev) => prev + 100);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {}
    }
  };

  const isCurrentWpPlaying = !!(audioTrack && audioTrack.isPlaying && audioTrack.title === waypoint.name);

  const handleNext = () => {
    setAiHint(null);

    if (currentStep < quest.waypoints.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedAns(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      updatePoints(score + 150); // Final bonus points
      try {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 }
        });
      } catch (e) {}
    }
  };

  return (
    <div className="min-h-screen bg-[#121412] text-stone-100 flex flex-col">
      
      {/* Top Header Bar */}
      <div className="px-4 sm:px-6 py-4 bg-[#0F2D1E] border-b border-[#D4AF37]/30 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              setActivePage('MY_TICKETS');
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="font-heritage text-lg font-bold text-amber-200 m-0 leading-tight">
              {quest.name}
            </h2>
            <p className="text-[11px] font-mono text-stone-400 m-0">
              {activeTicket ? `MÃ VÉ: ${activeTicket.ticketCode}` : 'CHẾ ĐỘ THỰC ĐỊA'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5">
            <Trophy size={14} className="text-amber-400" />
            <span>{score} PTS</span>
          </div>
        </div>
      </div>

      {/* Main Gameplay Screen Body */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Left Side: Map with Gold Waypoint Marker */}
        <div className="lg:w-1/2 p-4 lg:p-6 flex flex-col space-y-4">
          <div className="flex-1 min-h-[300px] lg:min-h-[500px]">
            <LeafletTreasureMap
              waypoints={quest.waypoints}
              activeWaypointIndex={currentStep}
              questName={quest.name}
              city={quest.city}
              height="100%"
            />
          </div>
        </div>

        {/* Right Side: Riddle & Waypoint Interactive Card */}
        <div className="lg:w-1/2 p-4 lg:p-6 flex items-center justify-center">
          <div 
            className="w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border text-stone-900 flex flex-col justify-between space-y-6"
            style={{
              background: '#FDFAF5',
              borderColor: '#D4AF37',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)'
            }}
          >
            {!isFinished ? (
              <>
                {/* Station header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-[#0F2D1E] text-amber-300 font-mono text-xs font-bold border border-amber-500/40">
                      TRẠM {currentStep + 1} / {quest.waypoints.length}
                    </span>

                    <button
                      onClick={playWaypointAudio}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold font-mono flex items-center gap-1.5 transition-colors border"
                      style={{
                        background: isCurrentWpPlaying ? '#C97D1A' : 'rgba(15, 45, 30, 0.08)',
                        color: isCurrentWpPlaying ? '#FFFFFF' : '#0F2D1E',
                        borderColor: isCurrentWpPlaying ? '#C97D1A' : 'rgba(15, 45, 30, 0.3)'
                      }}
                    >
                      <Volume2 size={14} className={isCurrentWpPlaying ? 'animate-pulse' : ''} />
                      <span>{isCurrentWpPlaying ? 'Đang phát audio...' : 'Nghe Thuyết Minh AI'}</span>
                    </button>
                  </div>

                  <h3 className="font-heritage text-2xl font-bold text-[#0F2D1E] m-0">
                    {waypoint.name}
                  </h3>

                  {/* Waypoint Story Script */}
                  <div className="p-4 rounded-2xl bg-[#F5F0E8] border-l-4 border-[#C97D1A] text-xs sm:text-sm text-stone-700 font-luxury-sans leading-relaxed italic">
                    "{waypoint.script}"
                  </div>

                  {/* AI Hint Section */}
                  <div>
                    {!aiHint ? (
                      <button
                        onClick={handleGetAiHint}
                        disabled={loadingHint || isAnswered}
                        className="px-3.5 py-1.5 rounded-xl border border-dashed border-amber-600 bg-amber-500/10 text-amber-800 text-xs font-mono font-semibold hover:bg-amber-500/20 transition-colors flex items-center gap-1.5"
                      >
                        <Sparkles size={14} className={loadingHint ? 'animate-spin' : ''} />
                        <span>{loadingHint ? 'AI đang tạo gợi ý...' : '💡 Hỏi Trợ Lý AI Gợi Ý (AI Hint)'}</span>
                      </button>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400 text-xs text-stone-800 font-luxury-sans space-y-1">
                        <strong className="text-amber-800 font-mono flex items-center gap-1">
                          <Sparkles size={13} /> GỢI Ý TỪ LOCALQUEST AI:
                        </strong>
                        <p className="m-0 leading-relaxed">{aiHint}</p>
                      </div>
                    )}
                  </div>

                  {/* Riddle Question */}
                  <div className="pt-2">
                    <p className="font-heritage text-base font-bold text-stone-900 m-0">
                      ❓ {waypoint.question}
                    </p>
                  </div>

                  {/* Multiple Choice Answers */}
                  <div className="space-y-2.5 pt-1">
                    {waypoint.answers.map((ans, idx) => {
                      let btnStyle = 'bg-white border-stone-300 text-stone-800 hover:border-amber-400';
                      let icon = null;

                      if (isAnswered) {
                        if (idx === waypoint.correct) {
                          btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold';
                          icon = <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />;
                        } else if (idx === selectedAns) {
                          btnStyle = 'bg-rose-100 border-rose-500 text-rose-900 font-bold';
                          icon = <XCircle size={16} className="text-rose-600 flex-shrink-0" />;
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleAnswer(idx)}
                          disabled={isAnswered}
                          className={`w-full p-3.5 rounded-xl border-2 text-xs sm:text-sm font-luxury-sans text-left flex items-center justify-between transition-all ${btnStyle}`}
                        >
                          <span>{ans}</span>
                          {icon}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Action */}
                {isAnswered && (
                  <div className="pt-4 border-t border-stone-300 flex items-center justify-between">
                    <span className="text-xs font-mono text-stone-600">
                      {selectedAns === waypoint.correct ? '🎉 CHÍNH XÁC! (+100 PTS)' : '❌ CHƯA CHÍNH XÁC!'}
                    </span>
                    <button
                      onClick={handleNext}
                      className="btn-gold-aura py-2.5 px-6 text-xs font-bold"
                    >
                      <span>{currentStep < quest.waypoints.length - 1 ? 'TRẠM TIẾP THEO' : 'HOÀN THÀNH QUEST'}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Victory Screen */
              <div className="py-8 text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-amber-100 border-2 border-amber-500 text-amber-600 mx-auto flex items-center justify-center shadow-xl">
                  <Award size={44} />
                </div>

                <div>
                  <span className="text-xs font-mono font-bold text-amber-700 uppercase tracking-wider">
                    NHÀ THÁM HIỂM DI SẢN XUẤT SẮC
                  </span>
                  <h2 className="font-heritage text-3xl font-bold text-[#0F2D1E] mt-1">
                    Chúc Mừng Bạn Đã Hoàn Thành Quest!
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 font-luxury-sans max-w-sm mx-auto mt-2">
                    Bạn đã giải mã trọn vẹn toàn bộ các trạm dừng lịch sử tại {quest.city} và tích luỹ điểm thưởng danh giá.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F0E8] border border-amber-300 max-w-xs mx-auto text-center space-y-1">
                  <span className="text-[10px] font-mono text-stone-500 uppercase">TỔNG ĐIỂM ĐẠT ĐƯỢC</span>
                  <h3 className="font-heritage text-3xl font-bold text-[#C97D1A] m-0">
                    {score + 150} PTS
                  </h3>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => setActivePage('EXPLORE')}
                    className="w-full sm:w-auto btn-gold-aura py-3 px-8 text-xs font-bold"
                  >
                    <span>KHÁM PHÁ QUEST TIẾP THEO</span>
                  </button>
                  <button
                    onClick={() => setActivePage('MY_TICKETS')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl border border-stone-300 text-stone-800 hover:bg-stone-100 text-xs font-mono font-semibold"
                  >
                    Xem ví vé của tôi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
