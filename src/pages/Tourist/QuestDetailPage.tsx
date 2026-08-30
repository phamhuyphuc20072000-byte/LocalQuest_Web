import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Footprints, 
  MapPin, 
  Volume2, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  Play, 
  MessageSquare, 
  Share2, 
  Heart,
  Calendar,
  Users
} from 'lucide-react';
import { useQuest } from '../../context/QuestContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, img } from '../../data/quests';
import { Stars } from '../../components/common/Stars';
import { ThemeBadge, DifficultyBadge } from '../../components/common/Badges';
import { LeafletTreasureMap } from '../../components/maps/LeafletTreasureMap';

export function QuestDetailPage() {
  const { selectedQuest, setActivePage, navigateToCheckout, playAudio } = useQuest();
  const { isQuestSaved, toggleSaveQuest } = useAuth();
  const [activeWpIndex, setActiveWpIndex] = useState(0);

  if (!selectedQuest) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <p className="text-stone-600 font-luxury-sans">Chưa chọn Quest nào.</p>
        <button onClick={() => setActivePage('EXPLORE')} className="btn-gold-aura text-xs mt-4">
          Quay lại Khám Phá
        </button>
      </div>
    );
  }

  const saved = isQuestSaved(selectedQuest.id);

  return (
    <div className="min-h-screen pb-24 space-y-12">
      
      {/* Top Back Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => setActivePage('EXPLORE')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-800 hover:bg-[#FDFAF5] transition-colors shadow-xs font-mono"
        >
          <ArrowLeft size={14} />
          <span>QUAY LẠI DANH MỤC QUEST</span>
        </button>
      </div>

      {/* Cinematic Hero Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="relative rounded-3xl overflow-hidden shadow-2xl border min-h-[400px] lg:min-h-[480px] flex flex-col justify-end p-6 sm:p-10 lg:p-12 text-white"
          style={{
            borderColor: '#D4AF37'
          }}
        >
          {/* Background Image */}
          <img
            src={img(selectedQuest.imageId, 1600, 900)}
            alt={selectedQuest.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121412] via-[#0F2D1E]/60 to-black/30" />

          {/* Hero Content */}
          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <ThemeBadge theme={selectedQuest.theme} size="md" />
              <span className="px-3 py-1 rounded bg-black/60 text-amber-300 font-mono text-xs font-bold border border-amber-500/40 backdrop-blur-xs">
                {selectedQuest.city}
              </span>
              <DifficultyBadge difficulty={selectedQuest.difficulty} />
            </div>

            <h1 className="font-heritage text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight gold-gradient-text">
              {selectedQuest.name}
            </h1>

            <p className="text-sm sm:text-base text-stone-200 font-luxury-sans leading-relaxed">
              {selectedQuest.teaser}
            </p>

            {/* Metrics */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 text-xs font-mono text-stone-300">
              <span className="flex items-center gap-1.5">
                <Clock size={15} className="text-amber-400" /> Thời gian: <strong className="text-white">{selectedQuest.walkTime}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Footprints size={15} className="text-amber-400" /> Quãng đường: <strong className="text-white">{selectedQuest.distance}</strong>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={15} className="text-amber-400" /> Số trạm dừng: <strong className="text-white">{selectedQuest.waypoints.length} trạm</strong>
              </span>
            </div>
          </div>

          {/* Top-Right Quick Actions */}
          <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
            <button
              onClick={() => toggleSaveQuest(selectedQuest.id)}
              className="p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white hover:text-rose-400 transition-colors shadow-lg"
            >
              <Heart size={18} className={saved ? 'fill-rose-500 text-rose-500' : ''} />
            </button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert('Đã sao chép liên kết chia sẻ Quest!');
              }}
              className="p-3 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white hover:text-amber-300 transition-colors shadow-lg"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left 2 Columns: Story, Interactive Map, Timeline Waypoints */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* 1. Cultural Narrative & Story */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FDFAF5] border border-stone-300/80 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heritage text-2xl font-bold text-[#0F2D1E] m-0">
                Câu Chuyện Di Sản & Bối Cảnh
              </h2>
              <button
                onClick={() => playAudio({
                  title: selectedQuest.name,
                  questName: selectedQuest.name,
                  script: selectedQuest.story,
                  city: selectedQuest.city
                })}
                className="btn-outline-gold text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <Volume2 size={14} />
                <span>Nghe Thuyết Minh AI</span>
              </button>
            </div>

            <p className="text-stone-700 font-luxury-sans text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {selectedQuest.story}
            </p>

            <div className="p-4 rounded-2xl bg-[#F5F0E8] border-l-4 border-[#C97D1A] text-xs font-luxury-sans text-stone-700">
              <strong className="text-[#C97D1A] font-mono block mb-1">MẸO KHÁM PHÁ TỪ LOCAL GUIDE:</strong>
              Hãy chuẩn bị một đôi giày đi bộ thoải mái, sạc đầy pin điện thoại và sẵn sàng quan sát kỹ từng hoa văn gạch ngói cổ kính!
            </div>
          </div>

          {/* 2. Interactive Treasure Map */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-heritage text-2xl font-bold text-[#0F2D1E] m-0">
                Lộ Trình Thực Địa ({selectedQuest.waypoints.length} Trạm)
              </h2>
              <span className="text-xs text-stone-500 font-mono">GPS TRACKING SẴN SÀNG</span>
            </div>
            
            <LeafletTreasureMap
              waypoints={selectedQuest.waypoints}
              activeWaypointIndex={activeWpIndex}
              onSelectWaypoint={(idx) => setActiveWpIndex(idx)}
              questName={selectedQuest.name}
              city={selectedQuest.city}
              height={440}
            />
          </div>

          {/* 3. Waypoint Timeline Cards */}
          <div className="space-y-4">
            <h3 className="font-heritage text-xl font-bold text-stone-900">
              Chi Tiết Các Trạm Dừng & Thử Thách
            </h3>

            <div className="space-y-3">
              {selectedQuest.waypoints.map((wp, index) => {
                const isActive = index === activeWpIndex;
                return (
                  <div
                    key={wp.id}
                    onClick={() => setActiveWpIndex(index)}
                    className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-[#FDFAF5] border-[#D4AF37] shadow-lg ring-2 ring-[#D4AF37]/30'
                        : 'bg-white border-stone-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center font-heritage font-bold text-xs flex-shrink-0 shadow-sm"
                          style={{
                            background: isActive ? '#0F2D1E' : '#F5F0E8',
                            color: isActive ? '#D4AF37' : '#6B6355',
                            border: '1.5px solid #D4AF37'
                          }}
                        >
                          {wp.id}
                        </div>
                        <div>
                          <h4 className="font-heritage text-base font-bold text-stone-900 m-0">
                            {wp.name}
                          </h4>
                          <p className="text-xs text-stone-600 font-luxury-sans mt-1 leading-relaxed">
                            "{wp.script}"
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playAudio({
                            title: wp.name,
                            questName: selectedQuest.name,
                            script: wp.script,
                            city: selectedQuest.city,
                            waypointIndex: index,
                            questId: selectedQuest.id
                          });
                        }}
                        className="p-2 rounded-lg bg-amber-500/10 text-amber-800 hover:bg-amber-500/20 border border-amber-400/40 text-xs font-mono flex items-center gap-1 flex-shrink-0"
                        title="Nghe thuyết minh audio"
                      >
                        <Volume2 size={14} />
                        <span className="hidden sm:inline">Audio</span>
                      </button>
                    </div>

                    {isActive && (
                      <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs font-mono text-emerald-800">
                        <span>❓ Thử thách câu đố mật thư đang chờ đón</span>
                        <span className="font-bold">+100 PTS</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Local Guide Profile */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#FDFAF5] border border-[#D4AF37]/40 shadow-md flex flex-col sm:flex-row items-center gap-6">
            <img
              src={img(selectedQuest.guideImageId, 160, 160)}
              alt={selectedQuest.guideName}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-[#D4AF37] shadow-lg flex-shrink-0"
            />
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <span className="text-[10px] font-mono text-amber-700 uppercase font-bold tracking-wider">
                    NGƯỜI KỂ CHUYỆN DI SẢN (LOCAL GUIDE)
                  </span>
                  <h3 className="font-heritage text-xl font-bold text-stone-900 m-0 flex items-center justify-center sm:justify-start gap-1.5">
                    {selectedQuest.guideName}
                    <Award size={16} className="text-amber-500" />
                  </h3>
                </div>
                <div className="flex items-center justify-center sm:justify-end gap-1 text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  ⭐ {selectedQuest.guideRating} / 5.0
                </div>
              </div>
              <p className="text-xs text-stone-600 font-luxury-sans leading-relaxed m-0">
                Nghệ nhân bản địa với niềm đam mê sâu sắc với từng ngõ ngách di sản văn hóa. Tác giả của nhiều bộ mật thư khám phá độc quyền tại {selectedQuest.city}.
              </p>
            </div>
          </div>

        </div>

        {/* Right 1 Column: Sticky Booking Card & Guarantees */}
        <div className="space-y-6">
          <div 
            className="sticky top-28 rounded-3xl p-6 sm:p-8 shadow-2xl border space-y-6"
            style={{
              background: '#FDFAF5',
              borderColor: '#D4AF37',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)'
            }}
          >
            <div>
              <span className="text-xs font-mono text-stone-500 uppercase tracking-wider block">
                GIÁ VÉ TRẢI NGHIỆM TRỌN GÓI
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-bold font-mono text-[#C97D1A]">
                  {formatPrice(selectedQuest.price)}
                </span>
                <span className="text-xs text-stone-400 font-mono line-through">
                  {formatPrice(selectedQuest.price + 70000)}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-mono mt-1">
                * Áp dụng cho nhóm 1-3 người tự do trải nghiệm
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-stone-300 text-xs font-luxury-sans text-stone-700">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0" />
                <span>Nhận ngay mã vé QR Code check-in tức thì</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0" />
                <span>Bao gồm giọng đọc thuyết minh AI & bản đồ GPS</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0" />
                <span>Hỗ trợ Trợ lý AI gợi ý mật thư 24/7</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-700 flex-shrink-0" />
                <span>Tích luỹ 100 Điểm Thưởng Di Sản</span>
              </div>
            </div>

            {/* Direct Booking Action */}
            <button
              onClick={() => navigateToCheckout(selectedQuest)}
              className="w-full btn-gold-aura py-4 text-sm font-bold tracking-wider"
            >
              <span>ĐẶT VÉ TRẢI NGHIỆM NGAY</span>
            </button>

            <div className="p-3.5 rounded-xl bg-[#0F2D1E] text-amber-200 text-xs font-mono flex items-center gap-2.5 border border-amber-500/30">
              <ShieldCheck size={18} className="text-amber-400 flex-shrink-0" />
              <span>BẢO HÀNH TRẢI NGHIỆM: Hoàn tiền 100% nếu không hài lòng.</span>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
}
