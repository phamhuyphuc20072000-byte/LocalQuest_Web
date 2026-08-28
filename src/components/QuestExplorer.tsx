import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Clock,
  Navigation,
  Star,
  Award,
  Sparkles,
  Filter,
  Bookmark,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Quest, UserProfile } from '../types';
import { DESTINATIONS_LIST, CATEGORIES_LIST } from '../data/questsData';

interface QuestExplorerProps {
  quests: Quest[];
  user: UserProfile | null;
  onSelectQuest: (quest: Quest) => void;
  onToggleSaveQuest: (questId: string) => void;
  onOpenAuthModal: () => void;
  onOpenGoogleChooser?: () => void;
  onOpenLoginScreen?: () => void;
  onOpenAIGuide: () => void;
}

export const QuestExplorer: React.FC<QuestExplorerProps> = ({
  quests,
  user,
  onSelectQuest,
  onToggleSaveQuest,
  onOpenAuthModal,
  onOpenGoogleChooser,
  onOpenLoginScreen,
  onOpenAIGuide
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('Tất cả địa điểm');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả danh mục');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const filteredQuests = useMemo(() => {
    return quests.filter((q) => {
      const matchSearch =
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchDestination =
        selectedDestination === 'Tất cả địa điểm' || q.destination.includes(selectedDestination);

      const matchCategory =
        selectedCategory === 'Tất cả danh mục' || q.category === selectedCategory;

      const matchDifficulty =
        selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;

      return matchSearch && matchDestination && matchCategory && matchDifficulty;
    });
  }, [quests, searchQuery, selectedDestination, selectedCategory, selectedDifficulty]);

  return (
    <div id="quest-explorer-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Hero Banner with Search */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950/60 border border-stone-800 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Khám phá 100+ Hành trình Bản địa Chân thực
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Khám phá Việt Nam qua những <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              Nhiệm Vụ Du Lịch Độc Bản (Local Quests)
            </span>
          </h1>

          <p className="text-stone-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Tham gia các thử thách trải nghiệm từ người bản địa, check-in từng trạm bí mật, tích luỹ điểm thưởng và mở khoá các huy hiệu du lịch độc quyền.
          </p>

          {/* Quick Search & AI Guide Bar */}
          <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                id="search-quest-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhiệm vụ, cà phê trứng, Hội An, săn mây, món ăn bản địa..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-950/80 border border-stone-700/80 text-stone-100 placeholder-stone-400 text-xs sm:text-sm focus:outline-none focus:border-amber-500 shadow-inner"
              />
            </div>

            <button
              id="open-ai-guide-hero-btn"
              onClick={onOpenAIGuide}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              Hỏi Hướng dẫn viên AI
            </button>
          </div>

          {/* Quick Google Sign-In Bar if not logged in */}
          {!user && (
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                id="hero-google-signin-btn"
                onClick={onOpenGoogleChooser ? onOpenGoogleChooser : onOpenAuthModal}
                className="px-4 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs flex items-center gap-2.5 shadow-md transition-transform active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span>Đăng nhập bằng Google</span>
              </button>

              {onOpenLoginScreen && (
                <button
                  id="hero-phone-login-btn"
                  onClick={onOpenLoginScreen}
                  className="px-4 py-2 rounded-xl bg-stone-800/90 hover:bg-stone-800 text-stone-200 font-medium text-xs border border-stone-700 transition-colors"
                >
                  Màn hình Đăng nhập (OTP / SĐT)
                </button>
              )}

              <span className="text-xs text-stone-400 hidden sm:inline">
                Đăng nhập để nhận ngay +350 Điểm thưởng & Lưu hành trình yêu thích
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs & Selectors */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-stone-800 text-xs">
        {/* Destination Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {DESTINATIONS_LIST.map((dest) => (
            <button
              key={dest}
              onClick={() => setSelectedDestination(dest)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all font-medium ${
                selectedDestination === dest
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                  : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
              }`}
            >
              {dest}
            </button>
          ))}
        </div>

        {/* Category & Difficulty Selectors */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {CATEGORIES_LIST.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">Mọi cấp độ</option>
            <option value="Dễ dàng">Dễ dàng</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Thử thách">Thử thách</option>
          </select>
        </div>
      </div>

      {/* Quest Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Nhiệm vụ Nổi bật</span>
            <span className="text-xs font-normal text-stone-400">({filteredQuests.length} kết quả)</span>
          </h3>
        </div>

        {filteredQuests.length === 0 ? (
          <div className="text-center py-16 bg-stone-900/40 rounded-3xl border border-stone-800/80 p-8 space-y-3">
            <MapPin className="w-12 h-12 text-stone-600 mx-auto" />
            <h4 className="font-bold text-white text-base">Không tìm thấy Quest phù hợp</h4>
            <p className="text-xs text-stone-400 max-w-sm mx-auto">
              Hãy thử tìm kiếm với từ khoá khác hoặc xoá bộ lọc để xem toàn bộ danh sách hành trình.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDestination('Tất cả địa điểm');
                setSelectedCategory('Tất cả danh mục');
                setSelectedDifficulty('all');
              }}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs font-semibold transition-colors"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuests.map((quest) => {
              const isSaved = user?.savedQuests?.includes(quest.id) || false;
              const isCompleted = user?.completedQuests?.includes(quest.id) || false;

              return (
                <div
                  key={quest.id}
                  id={`quest-card-${quest.id}`}
                  className="group bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 flex flex-col hover:shadow-xl hover:shadow-black/40"
                >
                  {/* Hero Thumbnail */}
                  <div className="relative h-48 w-full overflow-hidden bg-stone-950">
                    <img
                      src={quest.heroImage}
                      alt={quest.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-black/30"></div>

                    {/* Category & Region Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-stone-950/80 backdrop-blur text-white text-[11px] font-semibold border border-white/10">
                        {quest.category}
                      </span>
                      {quest.featured && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold shadow-sm">
                          HOT
                        </span>
                      )}
                    </div>

                    {/* Bookmark Save Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!user) {
                          onOpenAuthModal();
                        } else {
                          onToggleSaveQuest(quest.id);
                        }
                      }}
                      title={isSaved ? 'Bỏ lưu quest' : 'Lưu quest vào sổ tay'}
                      className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur transition-all ${
                        isSaved
                          ? 'bg-amber-500 text-stone-950 shadow-md'
                          : 'bg-stone-900/80 text-stone-300 hover:text-white hover:bg-stone-800'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
                    </button>

                    {/* Destination Pill & Reward Points */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                      <div className="flex items-center gap-1 font-medium bg-stone-950/70 px-2 py-1 rounded-lg backdrop-blur">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        <span>{quest.destination}</span>
                      </div>

                      <div className="flex items-center gap-1 font-bold text-amber-300 bg-amber-950/80 px-2 py-1 rounded-lg backdrop-blur border border-amber-500/30">
                        <Award className="w-3 h-3" />
                        <span>+{quest.rewardPoints} đ</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h4 
                        onClick={() => onSelectQuest(quest)}
                        className="font-bold text-base text-white group-hover:text-amber-400 transition-colors line-clamp-2 cursor-pointer"
                      >
                        {quest.title}
                      </h4>
                      <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                        {quest.summary}
                      </p>
                    </div>

                    {/* Metadata Chips: Duration, Distance, Checkpoints, Rating */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-stone-800/80 text-[11px] text-stone-300">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>{quest.durationHours}h</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-stone-400" />
                        <span>{quest.checkpoints.length} trạm</span>
                      </div>
                      <div className="flex items-center gap-1 justify-end font-semibold text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{quest.rating}</span>
                      </div>
                    </div>

                    {/* Host & Action Button */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <img
                          src={quest.hostAvatar}
                          alt={quest.hostName}
                          className="w-7 h-7 rounded-full object-cover border border-stone-700"
                        />
                        <div>
                          <p className="text-xs font-semibold text-stone-200">{quest.hostName}</p>
                          <p className="text-[10px] text-stone-500 truncate max-w-[100px]">{quest.hostBadge}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectQuest(quest)}
                        className="px-3.5 py-1.5 rounded-xl bg-stone-800 group-hover:bg-amber-500 group-hover:text-stone-950 text-stone-200 font-semibold text-xs transition-colors flex items-center gap-1"
                      >
                        <span>Chi tiết</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
