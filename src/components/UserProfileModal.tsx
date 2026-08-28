import React from 'react';
import {
  X,
  Award,
  Bookmark,
  Calendar,
  CheckCircle2,
  Compass,
  Star,
  ShieldCheck,
  LogOut,
  MapPin,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { UserProfile, Quest, BookingRecord } from '../types';

interface UserProfileModalProps {
  user: UserProfile | null;
  quests: Quest[];
  bookings: BookingRecord[];
  onClose: () => void;
  onSelectQuest: (quest: Quest) => void;
  onLogout: () => void;
  onOpenAuthModal: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  quests,
  bookings,
  onClose,
  onSelectQuest,
  onLogout,
  onOpenAuthModal
}) => {
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-8 text-center space-y-4 text-stone-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <Compass className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="text-xl font-bold text-white">Chưa Đăng Nhập</h3>
          <p className="text-xs text-stone-400">
            Vui lòng đăng nhập bằng Google để mở khoá Sổ tay Du khách, tích luỹ huy hiệu và điểm thưởng.
          </p>
          <button
            onClick={() => {
              onClose();
              onOpenAuthModal();
            }}
            className="w-full py-3 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-colors"
          >
            Đăng nhập ngay
          </button>
        </div>
      </div>
    );
  }

  const savedQuestsList = quests.filter((q) => user.savedQuests?.includes(q.id));
  const completedQuestsList = quests.filter((q) => user.completedQuests?.includes(q.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        id="user-passport-modal"
        className="relative w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl text-stone-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header with Profile Info */}
        <div className="p-6 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/40 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=tourist'}
              alt={user.displayName || 'Avatar'}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{user.displayName}</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                  Hộ Chiếu Du Khách
                </span>
              </div>
              <p className="text-xs text-stone-400 font-mono">{user.email}</p>
              <div className="flex items-center gap-3 text-xs text-stone-300 pt-1">
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  {user.points} Điểm Quest
                </span>
                <span className="text-stone-500">•</span>
                <span>Tham gia: {user.joinedDate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-red-950 hover:text-red-300 text-stone-300 text-xs font-semibold border border-stone-700 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Badge Collection Section */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Huy Hiệu Du Lịch Đã Đạt ({user.badges?.length || 0})
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {user.badges && user.badges.length > 0 ? (
                user.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-3 rounded-2xl bg-stone-950/80 border border-amber-500/30 flex items-start gap-2.5 shadow-sm"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
                      <Star className="w-4 h-4 fill-amber-400" />
                    </div>
                    <div>
                      <h5 className="font-bold text-white text-xs">{badge.name}</h5>
                      <p className="text-[10px] text-stone-400 leading-tight mt-0.5">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-stone-500 italic col-span-3">Chưa có huy hiệu. Hãy hoàn thành nhiệm vụ đầu tiên!</p>
              )}
            </div>
          </div>

          {/* Booked Tours Section */}
          {bookings.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Lịch Trình Đã Đặt Tour ({bookings.length})
              </h4>

              <div className="space-y-2">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800 flex items-center justify-between"
                  >
                    <div>
                      <h5 className="font-bold text-white text-xs">{b.questTitle}</h5>
                      <p className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        <span>{b.destination}</span>
                        <span>•</span>
                        <span>Ngày đi: {b.bookingDate}</span>
                        <span>•</span>
                        <span>{b.touristsCount} khách</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        Đã xác nhận
                      </span>
                      <p className="text-xs font-bold text-amber-400 mt-1">
                        {b.totalPriceVnd.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved Quests Section */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-400" />
              Nhiệm Vụ Đã Lưu ({savedQuestsList.length})
            </h4>

            {savedQuestsList.length === 0 ? (
              <div className="p-4 rounded-2xl bg-stone-950/40 border border-stone-800 text-center text-stone-500">
                Chưa có quest nào được lưu. Hãy bấm vào biểu tượng dấu trang trên từng hành trình để lưu lại.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedQuestsList.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => {
                      onClose();
                      onSelectQuest(q);
                    }}
                    className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 hover:border-amber-500/40 cursor-pointer flex items-center justify-between group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={q.heroImage}
                        alt={q.title}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                      <div>
                        <h5 className="font-bold text-white text-xs group-hover:text-amber-400 transition-colors line-clamp-1">
                          {q.title}
                        </h5>
                        <p className="text-[10px] text-stone-400">{q.destination} • {q.durationHours}h</p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
