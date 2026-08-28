import React from 'react';
import { Compass, User as UserIcon, ShieldAlert, Sparkles, MapPin, Bookmark, LogOut, CheckCircle2, AlertTriangle } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  activeTab: 'quests' | 'map' | 'ai-guide' | 'passport' | 'auth-doctor';
  setActiveTab: (tab: 'quests' | 'map' | 'ai-guide' | 'passport' | 'auth-doctor') => void;
  onOpenAuthModal: () => void;
  onOpenLoginScreen?: () => void;
  onOpenGoogleChooser?: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAuthModal,
  onOpenLoginScreen,
  onOpenGoogleChooser,
  onLogout
}) => {
  return (
    <header id="main-header" className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-stone-800 text-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            id="brand-logo-btn"
            onClick={() => setActiveTab('quests')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-stone-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">LocalQuest</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">Tourist Web</span>
              </div>
              <p className="text-[11px] text-stone-400">Trải nghiệm du lịch bản địa độc bản</p>
            </div>
          </div>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-950/60 p-1 rounded-xl border border-stone-800/80">
            <button
              id="nav-tab-quests"
              onClick={() => setActiveTab('quests')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'quests'
                  ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Khám phá Quest
            </button>

            <button
              id="nav-tab-map"
              onClick={() => setActiveTab('map')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'map'
                  ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Bản đồ Trực quan
            </button>

            <button
              id="nav-tab-ai-guide"
              onClick={() => setActiveTab('ai-guide')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'ai-guide'
                  ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Hướng dẫn viên AI
            </button>

            <button
              id="nav-tab-passport"
              onClick={() => setActiveTab('passport')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'passport'
                  ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              Sổ tay & Điểm ({user ? user.points : 0})
            </button>

            <button
              id="nav-tab-auth-doctor"
              onClick={() => setActiveTab('auth-doctor')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'auth-doctor'
                  ? 'bg-red-500 text-white font-semibold shadow-sm'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30'
              }`}
              title="Khắc phục sự cố đăng nhập Google trên Firebase"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Sửa lỗi Google Auth
            </button>
          </nav>

          {/* Right Action: Auth / User Profile */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <div 
                  id="user-profile-trigger"
                  onClick={() => setActiveTab('passport')}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-stone-800/80 hover:bg-stone-800 border border-stone-700 cursor-pointer transition-colors"
                >
                  <img
                    src={user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=tourist'}
                    alt={user.displayName || 'Avatar'}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover border border-amber-400/50"
                  />
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold text-stone-100 max-w-[110px] truncate">
                      {user.displayName || 'Du khách'}
                    </p>
                    <p className="text-[10px] text-amber-400 font-medium">
                      {user.points} Điểm Quest
                    </p>
                  </div>
                </div>

                <button
                  id="logout-btn"
                  onClick={onLogout}
                  title="Đăng xuất"
                  className="p-2 rounded-lg text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {onOpenLoginScreen && (
                  <button
                    id="login-screen-btn-header"
                    onClick={onOpenLoginScreen}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-xs border border-stone-700 transition-all"
                  >
                    <span>Đăng nhập</span>
                  </button>
                )}

                <button
                  id="google-login-btn-header"
                  onClick={onOpenGoogleChooser ? onOpenGoogleChooser : onOpenAuthModal}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-900 font-semibold text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Đăng nhập Google</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-stone-800 text-xs overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('quests')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'quests' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-300'
            }`}
          >
            Quests
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'map' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-300'
            }`}
          >
            Bản đồ
          </button>
          <button
            onClick={() => setActiveTab('ai-guide')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'ai-guide' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-300'
            }`}
          >
            Trợ lý AI
          </button>
          <button
            onClick={() => setActiveTab('passport')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'passport' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-300'
            }`}
          >
            Sổ tay
          </button>
          <button
            onClick={() => setActiveTab('auth-doctor')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap border border-amber-500/40 text-amber-400 ${
              activeTab === 'auth-doctor' ? 'bg-amber-500 text-stone-950 font-bold' : ''
            }`}
          >
            Sửa Google Auth
          </button>
        </div>
      </div>
    </header>
  );
};
