import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  Compass, 
  ArrowRight, 
  Clock, 
  Footprints, 
  Heart, 
  ShieldCheck, 
  Volume2, 
  Play,
  Flame,
  Award,
  Map as MapIcon,
  LayoutGrid
} from 'lucide-react';
import { useQuest } from '../../context/QuestContext';
import { useAuth } from '../../context/AuthContext';
import { Quest, QuestTheme } from '../../types';
import { formatPrice, img } from '../../data/quests';
import { Stars } from '../../components/common/Stars';
import { ThemeBadge, DifficultyBadge } from '../../components/common/Badges';
import { LeafletTreasureMap } from '../../components/maps/LeafletTreasureMap';

const CITIES = ['Tất cả', 'Hà Nội', 'TP. Hồ Chí Minh', 'Hội An', 'Huế', 'Đà Lạt', 'Ninh Bình'];
const THEMES: QuestTheme[] = ['Tất cả', 'Bí ẩn', 'Ẩm thực', 'Đêm', 'Lịch sử'];

export function ExplorePage() {
  const { 
    quests, 
    selectedCity, 
    setSelectedCity, 
    selectedTheme, 
    setSelectedTheme, 
    searchQuery, 
    setSearchQuery, 
    navigateToQuestDetail,
    navigateToCheckout,
    playAudio
  } = useQuest();

  const { isQuestSaved, toggleSaveQuest } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const filteredQuests = quests.filter((q) => {
    const matchesCity = selectedCity === 'Tất cả' || q.city === selectedCity;
    const matchesTheme = selectedTheme === 'Tất cả' || q.theme === selectedTheme;
    const matchesSearch = 
      q.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.teaser.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.guideName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesTheme && matchesSearch;
  });

  const featuredQuest = quests[0];

  return (
    <div className="min-h-screen space-y-16 pb-20">
      
      {/* 1. ULTRA-LUXURY HERITAGE HERO BANNER */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden" style={{
        background: 'linear-gradient(180deg, #0F2D1E 0%, #153826 60%, #1A1D1A 100%)'
      }}>
        {/* Animated Background Canvas */}
        <div className="hero-bg-animated opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121412] via-black/40 to-transparent" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(212, 175, 55, 0.15) 0%, transparent 70%)'
        }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 pt-12">
          
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-[#D4AF37]/50 text-amber-300 text-xs font-mono shadow-lg backdrop-blur-md">
            <Sparkles size={14} className="text-amber-400 animate-spin [animation-duration:8s]" />
            <span className="font-semibold tracking-wider uppercase">
              VIETNAM HERITAGE IMMERSIVE CITY QUESTS
            </span>
          </div>

          {/* Majestic Title */}
          <h1 className="font-heritage text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            Khám Phá Di Sản Bí Ẩn <br />
            <span className="gold-gradient-text">
              Qua Từng Dấu Chân Bản Địa
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-stone-300 font-luxury-sans leading-relaxed">
            Hóa thân thành nhà thám hiểm, giải mã mật thư lịch sử, nghe thuyết minh âm thanh AI và thưởng thức ẩm thực gia truyền tại những con hẻm cổ kính nhất Việt Nam.
          </p>

          {/* Search & Filter Bar */}
          <div className="max-w-3xl mx-auto pt-4">
            <div 
              className="p-2 sm:p-3 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 border"
              style={{
                background: 'rgba(253, 250, 245, 0.95)',
                borderColor: '#D4AF37',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 25px rgba(212, 175, 55, 0.25)'
              }}
            >
              {/* Search input */}
              <div className="flex-1 w-full flex items-center gap-2.5 px-3 py-2 text-stone-800">
                <Search size={18} className="text-amber-700 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm tên quest, phố cổ, ẩm thực, người kể chuyện..."
                  className="w-full bg-transparent text-sm focus:outline-none font-luxury-sans placeholder:text-stone-400"
                />
              </div>

              {/* City quick dropdown */}
              <div className="w-full sm:w-auto flex items-center gap-1.5 px-3 py-2 border-t sm:border-t-0 sm:border-l border-stone-300">
                <MapPin size={16} className="text-amber-700" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none font-mono cursor-pointer"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  const target = document.getElementById('quest-catalog');
                  target?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto btn-gold-aura py-2.5 px-6 text-xs whitespace-nowrap"
              >
                <span>TÌM KIẾM</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Quick city pill selectors */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-amber-300/80 font-mono">Điểm đến gợi ý:</span>
            {['Hà Nội', 'TP. Hồ Chí Minh', 'Hội An', 'Huế'].map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1 rounded-full text-xs font-medium font-mono transition-all ${
                  selectedCity === city
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-md'
                    : 'bg-white/10 text-stone-300 hover:bg-white/20'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

        </div>
      </section>


      {/* 2. SPOTLIGHT FEATURED QUEST SHOWCASE */}
      {featuredQuest && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-amber-700 font-bold uppercase tracking-wider">
                <Flame size={14} className="text-amber-600" />
                <span>Nhiệm Vụ Di Sản Nổi Bật Trong Tuần</span>
              </div>
              <h2 className="font-heritage text-2xl sm:text-3xl font-bold text-stone-900 m-0 mt-1">
                Spotlight Trải Nghiệm Hoàng Gia
              </h2>
            </div>
          </div>

          <div 
            className="rounded-3xl overflow-hidden shadow-2xl border flex flex-col lg:flex-row transition-all duration-300 hover:shadow-3xl"
            style={{
              background: '#FDFAF5',
              borderColor: 'rgba(212, 175, 55, 0.4)'
            }}
          >
            {/* Cover Image with Gold Accents */}
            <div className="lg:w-1/2 relative min-h-[320px] lg:min-h-[440px] overflow-hidden group">
              <img
                src={img(featuredQuest.imageId, 1000, 700)}
                alt={featuredQuest.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              <div className="absolute top-4 left-4 flex gap-2">
                <ThemeBadge theme={featuredQuest.theme} size="md" />
                <span className="px-3 py-1 rounded bg-[#0F2D1E]/90 text-amber-300 font-mono text-xs font-bold border border-amber-500/40">
                  {featuredQuest.city}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-xs text-amber-300 font-mono m-0 mb-1">
                  ĐƯỢC BIÊN SOẠN BỞI LOCAL GUIDE UY TÍN
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={img(featuredQuest.guideImageId, 100, 100)}
                    alt={featuredQuest.guideName}
                    className="w-10 h-10 rounded-full border-2 border-amber-400 object-cover shadow-md"
                  />
                  <div>
                    <h4 className="font-semibold text-sm m-0 text-white flex items-center gap-1.5">
                      {featuredQuest.guideName}
                      <Award size={14} className="text-amber-400" />
                    </h4>
                    <span className="text-[11px] text-stone-300 font-mono">
                      ⭐ {featuredQuest.guideRating} • 10 năm kinh nghiệm di sản
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Details */}
            <div className="lg:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Stars rating={featuredQuest.rating} reviews={featuredQuest.reviews} size={16} />
                  <DifficultyBadge difficulty={featuredQuest.difficulty} />
                </div>

                <h3 className="font-heritage text-2xl sm:text-3xl font-bold text-[#0F2D1E] leading-snug">
                  {featuredQuest.name}
                </h3>

                <p className="text-stone-600 font-luxury-sans text-sm sm:text-base leading-relaxed">
                  {featuredQuest.teaser}
                </p>

                {/* Metric Badges */}
                <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-[#F5F0E8] border border-stone-300/80 font-mono text-xs">
                  <div className="text-center">
                    <span className="text-stone-500 text-[10px] block">THỜI GIAN</span>
                    <span className="font-bold text-stone-900 flex items-center justify-center gap-1 mt-0.5">
                      <Clock size={12} className="text-amber-600" /> {featuredQuest.walkTime}
                    </span>
                  </div>
                  <div className="text-center border-x border-stone-300">
                    <span className="text-stone-500 text-[10px] block">QUÃNG ĐƯỜNG</span>
                    <span className="font-bold text-stone-900 flex items-center justify-center gap-1 mt-0.5">
                      <Footprints size={12} className="text-amber-600" /> {featuredQuest.distance}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-stone-500 text-[10px] block">SỐ TRẠM DỪNG</span>
                    <span className="font-bold text-[#1C4A32] flex items-center justify-center gap-1 mt-0.5">
                      <MapPin size={12} className="text-amber-600" /> {featuredQuest.waypoints.length} trạm
                    </span>
                  </div>
                </div>
              </div>

              {/* Price & Actions */}
              <div className="pt-4 border-t border-stone-300/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-stone-500 font-mono block">GIÁ VÉ TRẢI NGHIỆM</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-bold font-mono text-[#C97D1A]">
                      {formatPrice(featuredQuest.price)}
                    </span>
                    <span className="text-xs text-stone-400 font-mono line-through">
                      {formatPrice(featuredQuest.price + 70000)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => playAudio({
                      title: featuredQuest.name,
                      questName: featuredQuest.name,
                      script: featuredQuest.story,
                      city: featuredQuest.city
                    })}
                    className="p-3 rounded-xl border border-amber-600/50 text-amber-800 hover:bg-amber-100 transition-colors shadow-sm"
                    title="Nghe giọng đọc AI giới thiệu quest này"
                  >
                    <Volume2 size={18} />
                  </button>

                  <button
                    onClick={() => navigateToQuestDetail(featuredQuest)}
                    className="flex-1 sm:flex-initial btn-emerald-luxury text-xs px-6 py-3.5"
                  >
                    <span>XEM CHI TIẾT & BẢN ĐỒ</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}


      {/* 3. QUEST CATALOG SECTION */}
      <section id="quest-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Filter bar & View Mode Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-300">
          <div>
            <h2 className="font-heritage text-2xl sm:text-3xl font-bold text-stone-900 m-0">
              Danh Mục Nhiệm Vụ Khám Phá ({filteredQuests.length})
            </h2>
            <p className="text-xs text-stone-500 font-mono m-0 mt-1">
              CHỌN CHỦ ĐỀ & THÀNH PHỐ ĐỂ BẮT ĐẦU CHUYẾN ĐI THỰC ĐỊA
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-stone-200/80 border border-stone-300 text-xs font-mono">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-[#0F2D1E] text-amber-300 shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                <LayoutGrid size={14} />
                <span>Lưới Thẻ</span>
              </button>

              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === 'map'
                    ? 'bg-[#0F2D1E] text-amber-300 shadow-xs'
                    : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                <MapIcon size={14} />
                <span>Bản Đồ Kho Báu</span>
              </button>
            </div>

            {/* Theme Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {THEMES.map((theme) => (
                <button
                  key={theme}
                  onClick={() => setSelectedTheme(theme)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                    selectedTheme === theme
                      ? 'bg-[#0F2D1E] text-amber-300 border border-[#D4AF37] shadow-sm'
                      : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View Mode Map Display */}
        {viewMode === 'map' ? (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-[#FDFAF5] border border-[#D4AF37]/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="text-amber-700" size={18} />
                <span className="text-xs font-mono text-stone-800 font-bold">
                  BẢN ĐỒ KHO BÁU DI SẢN TOÀN QUỐC — NHẤP VÀO HUY HIỆU VÀNG ĐỂ XEM THIỆP TOUR
                </span>
              </div>
              <span className="text-xs text-stone-500 font-mono">
                {filteredQuests.length} Điểm Khám Phá
              </span>
            </div>

            <LeafletTreasureMap
              quests={filteredQuests}
              city={selectedCity}
              height={560}
            />
          </div>
        ) : (
          /* Quests Grid */
          filteredQuests.length === 0 ? (
            <div className="text-center py-20 rounded-3xl bg-[#FDFAF5] border border-dashed border-stone-300 p-8">
              <Compass size={40} className="mx-auto text-amber-700 opacity-60 mb-3" />
              <h3 className="font-heritage text-lg font-bold text-stone-800">Không tìm thấy Quest phù hợp</h3>
              <p className="text-xs text-stone-500 font-luxury-sans">Vui lòng thử chọn lại thành phố hoặc chủ đề khác.</p>
              <button
                onClick={() => {
                  setSelectedCity('Tất cả');
                  setSelectedTheme('Tất cả');
                  setSearchQuery('');
                }}
                className="mt-4 btn-gold-aura text-xs px-4 py-2"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
              {filteredQuests.map((quest) => {
                const saved = isQuestSaved(quest.id);
                return (
                  <div
                    key={quest.id}
                    className="rounded-2xl overflow-hidden shadow-lg border flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group"
                    style={{
                      background: '#FDFAF5',
                      borderColor: 'rgba(212, 175, 55, 0.35)'
                    }}
                  >
                    {/* Card Cover */}
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={img(quest.imageId, 600, 400)}
                        alt={quest.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <ThemeBadge theme={quest.theme} />
                        <span className="px-2 py-0.5 rounded bg-black/70 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30 backdrop-blur-xs">
                          {quest.city}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveQuest(quest.id);
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:text-rose-400 backdrop-blur-xs transition-colors"
                      >
                        <Heart size={16} className={saved ? 'fill-rose-500 text-rose-500' : ''} />
                      </button>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-mono">
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-amber-400" /> {quest.walkTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Footprints size={12} className="text-amber-400" /> {quest.distance}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-amber-400" /> {quest.waypoints.length} trạm
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Stars rating={quest.rating} reviews={quest.reviews} size={13} />
                          <DifficultyBadge difficulty={quest.difficulty} />
                        </div>

                        <h3 
                          onClick={() => navigateToQuestDetail(quest)}
                          className="font-heritage text-lg font-bold text-[#0F2D1E] hover:text-[#C97D1A] transition-colors cursor-pointer line-clamp-1"
                        >
                          {quest.name}
                        </h3>

                        <p className="text-xs text-stone-600 font-luxury-sans line-clamp-2 leading-relaxed">
                          {quest.teaser}
                        </p>
                      </div>

                      {/* Guide & Pricing */}
                      <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={img(quest.guideImageId, 60, 60)}
                            alt={quest.guideName}
                            className="w-7 h-7 rounded-full object-cover border border-amber-400"
                          />
                          <span className="text-xs font-semibold text-stone-700 truncate max-w-[90px]">
                            {quest.guideName}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-stone-400 font-mono block">GIÁ VÉ</span>
                          <span className="font-bold text-sm font-mono text-[#C97D1A]">
                            {formatPrice(quest.price)}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => navigateToQuestDetail(quest)}
                        className="w-full btn-emerald-luxury py-2.5 text-xs font-bold"
                      >
                        <span>KHÁM PHÁ CHI TIẾT</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </section>

    </div>
  );
}
