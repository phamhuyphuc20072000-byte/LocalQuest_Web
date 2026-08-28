import React from 'react';
import { Compass, ShieldAlert, Heart, Globe } from 'lucide-react';

interface FooterProps {
  onOpenTroubleshooter: () => void;
  onOpenAIGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenTroubleshooter, onOpenAIGuide }) => {
  return (
    <footer className="mt-16 border-t border-stone-800 bg-stone-950 text-stone-400 text-xs py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">LocalQuest Tourist Web</span>
              <p className="text-[11px] text-stone-500">Du lịch bản địa & Khám phá nhiệm vụ độc bản</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <button
              onClick={onOpenTroubleshooter}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Sửa lỗi Đăng nhập Google (Firebase Doctor)
            </button>

            <button
              onClick={onOpenAIGuide}
              className="text-stone-300 hover:text-white"
            >
              Hướng dẫn viên AI
            </button>

            <a
              href="https://localquest2-tourist-web.web.app/"
              target="_blank"
              rel="noreferrer"
              className="text-stone-400 hover:text-stone-200"
            >
              localquest2-tourist-web.web.app
            </a>
          </div>
        </div>

        <div className="border-t border-stone-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-500">
          <p>© {new Date().getFullYear()} LocalQuest. Tất cả quyền được bảo lưu.</p>
          <p className="flex items-center gap-1">
            Được phát triển với <Heart className="w-3 h-3 text-red-500 fill-red-500" /> cho cộng đồng du khách và người bản địa Việt Nam.
          </p>
        </div>
      </div>
    </footer>
  );
};
