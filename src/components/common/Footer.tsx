import React from 'react';
import { Compass, Heart, MapPin, Phone, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useQuest } from '../../context/QuestContext';

export function Footer() {
  const { setActivePage, setSelectedCity } = useQuest();

  return (
    <footer className="w-full text-stone-300 mt-20" style={{
      background: 'linear-gradient(180deg, #121412 0%, #080A08 100%)',
      borderTop: '1px solid rgba(212, 175, 55, 0.25)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#1C4A32] border border-[#D4AF37] flex items-center justify-center shadow-md">
                <Compass className="w-5 h-5 text-amber-300" />
              </div>
              <span className="font-heritage text-2xl font-bold gold-gradient-text">
                LocalQuest
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed font-luxury-sans">
              Nền tảng du lịch khám phá di sản và trải nghiệm bản địa thông qua các nhiệm vụ thực địa tương tác (Interactive City Quests), kết nối trực tiếp du khách với những người kể chuyện văn hoá địa phương.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400/90 pt-2">
              <ShieldCheck size={16} />
              <span>BẢO HỘ BẢN QUYỀN TRẢI NGHIỆM DI SẢN VIỆT NAM</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-heritage text-base font-semibold text-amber-300 mb-4 tracking-wide">
              Điểm Đến Di Sản
            </h4>
            <ul className="space-y-2.5 text-sm font-luxury-sans">
              {['Hà Nội', 'Hội An', 'TP. Hồ Chí Minh', 'Huế', 'Đà Lạt', 'Ninh Bình'].map((city) => (
                <li key={city}>
                  <button
                    onClick={() => {
                      setSelectedCity(city);
                      setActivePage('EXPLORE');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-stone-400 hover:text-amber-300 transition-colors flex items-center gap-1.5"
                  >
                    <MapPin size={12} className="text-amber-500" />
                    <span>{city}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Guide & Creators */}
          <div>
            <h4 className="font-heritage text-base font-semibold text-amber-300 mb-4 tracking-wide">
              Dành Cho Nghệ Nhân
            </h4>
            <ul className="space-y-2.5 text-sm font-luxury-sans">
              <li>
                <button
                  onClick={() => {
                    setActivePage('GUIDE_LANDING');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-stone-400 hover:text-amber-300 transition-colors"
                >
                  Trở Thành Local Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePage('GUIDE_STUDIO');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-stone-400 hover:text-amber-300 transition-colors"
                >
                  Guide Studio & Tạo Quest
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePage('GUIDE_WALLET');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-stone-400 hover:text-amber-300 transition-colors"
                >
                  Ví Doanh Thu & Rút Tiền
                </button>
              </li>
              <li>
                <span className="text-stone-500 text-xs">Chính sách chia sẻ 80% doanh thu</span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="font-heritage text-base font-semibold text-amber-300 mb-4 tracking-wide">
              Hỗ Trợ & Liên Hệ
            </h4>
            <div className="space-y-3 text-xs font-mono text-stone-400">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-amber-400" />
                <span>1900 8899 (24/7 Hotline)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-amber-400" />
                <span>concierge@localquest.vn</span>
              </div>
              <div className="pt-2">
                <div className="p-3 rounded-lg bg-stone-900/90 border border-amber-500/20 text-[11px] text-stone-300">
                  <span className="text-amber-400 font-bold">✨ Trợ Lý AI 24/7:</span> Bấm vào nút AI góc phải màn hình để được tư vấn lộ trình và quán ăn chuẩn bản địa.
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 font-mono">
          <p className="m-0">
            © 2026 LocalQuest Inc. Tinh hoa di sản & Trải nghiệm thực địa thượng lưu.
          </p>
          <div className="flex items-center gap-1 mt-3 sm:mt-0">
            <span>Thiết kế với lòng tự hào di sản Việt</span>
            <Heart size={12} className="text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
}
