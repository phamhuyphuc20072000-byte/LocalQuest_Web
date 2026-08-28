import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Navigation,
  Star,
  Award,
  Sparkles,
  Camera,
  Compass,
  CheckCircle2,
  Bookmark,
  Calendar,
  Users,
  ShieldCheck,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Quest, UserProfile, Checkpoint } from '../types';

interface QuestDetailModalProps {
  quest: Quest | null;
  user: UserProfile | null;
  onClose: () => void;
  onCompleteQuest: (questId: string, points: number) => void;
  onToggleSaveQuest: (questId: string) => void;
  onOpenAuthModal: () => void;
  onBookTour: (quest: Quest, touristsCount: number, bookingDate: string) => void;
}

export const QuestDetailModal: React.FC<QuestDetailModalProps> = ({
  quest,
  user,
  onClose,
  onCompleteQuest,
  onToggleSaveQuest,
  onOpenAuthModal,
  onBookTour
}) => {
  const [activeCheckpointIndex, setActiveCheckpointIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [bookingDate, setBookingDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [touristsCount, setTouristsCount] = useState(1);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  if (!quest) return null;

  const isSaved = user?.savedQuests?.includes(quest.id) || false;
  const isCompleted = user?.completedQuests?.includes(quest.id) || false;

  const handleStepCheckIn = (stepIndex: number) => {
    if (!completedSteps.includes(stepIndex)) {
      const nextSteps = [...completedSteps, stepIndex];
      setCompletedSteps(nextSteps);

      // Trigger mini confetti
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });

      // If all checkpoints completed, trigger main quest completion
      if (nextSteps.length === quest.checkpoints.length) {
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.5 }
        });
        onCompleteQuest(quest.id, quest.rewardPoints);
      }
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuthModal();
      return;
    }
    onBookTour(quest, touristsCount, bookingDate);
    setBookingSuccess(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      setBookingSuccess(false);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        id="quest-detail-modal"
        className="relative w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl text-stone-100 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-stone-950/80 hover:bg-stone-900 text-stone-300 hover:text-white border border-stone-700 backdrop-blur transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1 space-y-6 pb-6">
          {/* Hero Banner Header */}
          <div className="relative h-64 sm:h-80 w-full bg-stone-950">
            <img
              src={quest.heroImage}
              alt={quest.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-black/30"></div>

            <div className="absolute bottom-6 left-6 right-6 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-stone-950 font-bold text-xs shadow-md">
                  {quest.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur text-stone-200 text-xs border border-stone-700">
                  {quest.destination}
                </span>
                <span className="px-3 py-1 rounded-full bg-stone-900/80 backdrop-blur text-stone-200 text-xs border border-stone-700">
                  Độ khó: {quest.difficulty}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {quest.title}
              </h2>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="px-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800 text-center">
              <p className="text-[11px] text-stone-400">Thời gian ước tính</p>
              <p className="text-base font-bold text-white mt-0.5">{quest.durationHours} giờ</p>
            </div>
            <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800 text-center">
              <p className="text-[11px] text-stone-400">Quãng đường</p>
              <p className="text-base font-bold text-white mt-0.5">{quest.distanceKm} km</p>
            </div>
            <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800 text-center">
              <p className="text-[11px] text-stone-400">Đánh giá du khách</p>
              <p className="text-base font-bold text-amber-400 mt-0.5 flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{quest.rating} ({quest.reviewCount})</span>
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
              <p className="text-[11px] text-amber-300">Phần thưởng hoàn thành</p>
              <p className="text-base font-bold text-amber-400 mt-0.5 flex items-center justify-center gap-1">
                <Award className="w-4 h-4" />
                <span>+{quest.rewardPoints} Điểm</span>
              </p>
            </div>
          </div>

          {/* Main Content Layout: Story + Checkpoints + Host Booking */}
          <div className="px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Story & Checkpoints */}
            <div className="lg:col-span-2 space-y-6">
              {/* Detailed Story */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  Câu chuyện & Trải nghiệm
                </h3>
                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-stone-950/40 p-4 rounded-2xl border border-stone-800/80">
                  {quest.detailedStory}
                </p>
              </div>

              {/* Checkpoints Timeline */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-amber-400" />
                    Lộ trình các Trạm Checkpoint ({completedSteps.length}/{quest.checkpoints.length} đã mở)
                  </h3>
                </div>

                <div className="space-y-3">
                  {quest.checkpoints.map((cp, idx) => {
                    const isStepDone = completedSteps.includes(idx);

                    return (
                      <div
                        key={cp.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isStepDone
                            ? 'bg-amber-950/20 border-amber-500/40 text-stone-200'
                            : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                                isStepDone
                                  ? 'bg-amber-500 text-stone-950 shadow-md'
                                  : 'bg-stone-800 text-stone-300 border border-stone-700'
                              }`}
                            >
                              {isStepDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-bold text-sm text-white">{cp.title}</h4>
                              <p className="text-xs text-stone-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-stone-500" />
                                <span>{cp.locationName}</span>
                              </p>
                            </div>
                          </div>

                          <span className="text-[11px] text-stone-400 whitespace-nowrap bg-stone-900 px-2 py-0.5 rounded-md border border-stone-800">
                            ~{cp.estimatedMinutes} phút
                          </span>
                        </div>

                        <div className="mt-3 pl-10 space-y-2 text-xs">
                          <p className="text-stone-300 leading-relaxed">{cp.description}</p>

                          {/* Task challenge */}
                          <div className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-800 text-amber-200/90 flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-amber-400">Thử thách trạm: </span>
                              <span>{cp.taskDescription}</span>
                            </div>
                          </div>

                          {/* Secret Local Tip */}
                          <div className="p-2.5 rounded-xl bg-stone-900/90 border border-stone-800 text-stone-300 flex items-start gap-2">
                            <span className="text-amber-400 font-bold">💡 Mẹo bản địa:</span>
                            <span>{cp.localTip}</span>
                          </div>

                          {/* Photo spot suggestion */}
                          {cp.photoSpotPrompt && (
                            <div className="text-[11px] text-stone-400 flex items-center gap-1.5 pt-1">
                              <Camera className="w-3.5 h-3.5 text-stone-500" />
                              <span>Góc ảnh đẹp: {cp.photoSpotPrompt}</span>
                            </div>
                          )}

                          {/* Action Button: Check in */}
                          <div className="pt-2">
                            <button
                              onClick={() => handleStepCheckIn(idx)}
                              disabled={isStepDone}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                isStepDone
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 cursor-default'
                                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md active:scale-95'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{isStepDone ? 'Đã hoàn thành trạm này' : 'Check-in trạm này (+50đ)'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right 1 Col: Host Profile & Booking Box */}
            <div className="space-y-6">
              {/* Host Card */}
              <div className="p-5 rounded-3xl bg-stone-950/70 border border-stone-800 space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={quest.hostAvatar}
                    alt={quest.hostName}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400/50"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">{quest.hostName}</h4>
                    <p className="text-[11px] text-amber-400 font-medium">{quest.hostBadge}</p>
                    <p className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3 h-3 text-green-400" />
                      <span>Host Bản Địa Đã Xác Minh</span>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-stone-400 leading-relaxed">
                  "Tôi sinh ra và lớn lên tại đây. Với tôi, mỗi góc phố con hẻm đều có một câu chuyện riêng muốn chia sẻ cùng bạn."
                </p>
              </div>

              {/* Booking Form Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-b from-stone-900 to-stone-950 border border-stone-800 shadow-xl space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-stone-400">Chi phí trải nghiệm trọn gói</span>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-amber-400">
                      {quest.priceVnd.toLocaleString('vi-VN')} đ
                    </span>
                    <span className="text-[11px] text-stone-500"> / người</span>
                  </div>
                </div>

                {bookingSuccess ? (
                  <div className="p-4 rounded-2xl bg-green-950/50 border border-green-800 text-green-300 text-xs space-y-1 text-center animate-fade-in">
                    <CheckCircle2 className="w-6 h-6 mx-auto text-green-400" />
                    <p className="font-bold">Đặt hành trình thành công!</p>
                    <p className="text-[11px] text-green-400">Host sẽ liên hệ qua email xác nhận trong 15 phút.</p>
                  </div>
                ) : (
                  <form onSubmit={handleBookingSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-stone-400 mb-1 font-medium">Chọn ngày trải nghiệm</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                        <input
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          required
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-stone-400 mb-1 font-medium">Số lượng du khách</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                        <select
                          value={touristsCount}
                          onChange={(e) => setTouristsCount(Number(e.target.value))}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value={1}>1 người ({(quest.priceVnd).toLocaleString('vi-VN')} đ)</option>
                          <option value={2}>2 người ({(quest.priceVnd * 2).toLocaleString('vi-VN')} đ)</option>
                          <option value={3}>3 người ({(quest.priceVnd * 3).toLocaleString('vi-VN')} đ)</option>
                          <option value={4}>4 người ({(quest.priceVnd * 4).toLocaleString('vi-VN')} đ)</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-stone-300 font-semibold">
                      <span>Tổng thanh toán:</span>
                      <span className="text-amber-400 font-bold">
                        {(quest.priceVnd * touristsCount).toLocaleString('vi-VN')} đ
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>{user ? 'Đặt Hành Trình & Kết Nối Host' : 'Đăng nhập để đặt tour'}</span>
                    </button>
                  </form>
                )}

                {/* Bookmark Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      onOpenAuthModal();
                    } else {
                      onToggleSaveQuest(quest.id);
                    }
                  }}
                  className="w-full py-2.5 rounded-2xl bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
                  <span>{isSaved ? 'Đã lưu vào Sổ tay du lịch' : 'Lưu Quest vào Sổ tay du lịch'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
