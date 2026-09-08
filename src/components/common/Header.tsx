import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, 
  Ticket, 
  Sparkles, 
  UserCheck, 
  Shield, 
  ChevronDown, 
  LogOut, 
  LogIn,
  Volume2, 
  MapPin, 
  Menu, 
  X,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useQuest } from '../../context/QuestContext';
import { UserRole } from '../../types';
import { RoleBadge } from './Badges';

export function Header() {
  const { userProfile, role, setRole, loginAsDemo, logout, openLoginModal } = useAuth();
  const { activePage, setActivePage, setSelectedQuest, tickets, audioTrack } = useQuest();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  const validTicketCount = tickets.filter((t) => t.status === 'valid').length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setShowRoleMenu(false);
      }
    };
    if (showRoleMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRoleMenu]);

  const handleGoHome = () => {
    setActivePage('EXPLORE');
    if (setSelectedQuest) {
      setSelectedQuest(null);
    }
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    loginAsDemo(newRole);
    setShowRoleMenu(false);
    if (newRole === 'admin') setActivePage('ADMIN_DASHBOARD');
    else if (newRole === 'guide') setActivePage('GUIDE_STUDIO');
    else setActivePage('EXPLORE');
  };

  const handleLogout = async () => {
    setShowRoleMenu(false);
    setMobileMenuOpen(false);
    await logout();
    if (['ADMIN_DASHBOARD', 'ADMIN_LOGIN', 'GUIDE_STUDIO', 'QUEST_CREATOR', 'GUIDE_WALLET'].includes(activePage)) {
      setActivePage('EXPLORE');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300 shadow-xl" style={{
      background: 'linear-gradient(180deg, #0F2D1E 0%, #153826 100%)',
      borderBottom: '1px solid rgba(212, 175, 55, 0.28)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Surrounding Area */}
        <button
          id="btn-header-logo-home"
          type="button"
          onClick={handleGoHome}
          className="flex items-center gap-3.5 cursor-pointer group py-2.5 px-3 -my-2 -ml-3 rounded-2xl hover:bg-white/[0.08] active:bg-white/[0.15] transition-all duration-200 text-left border-none bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-amber-400 select-none"
          title="Về trang chủ LocalQuest"
          aria-label="Về trang chủ LocalQuest"
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center relative shadow-lg transition-transform duration-300 group-hover:scale-105 flex-shrink-0" style={{
            background: 'linear-gradient(135deg, #1C4A32 0%, #0F2D1E 100%)',
            border: '1.5px solid #D4AF37',
            boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
          }}>
            <Compass className="w-6 h-6 text-amber-300 transition-transform duration-500 group-hover:rotate-45" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heritage text-2xl font-bold tracking-tight gold-gradient-text">
                LocalQuest
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-emerald-900/80 text-[10px] font-mono text-amber-300/90 border border-amber-500/30">
                LUXURY HERITAGE
              </span>
            </div>
            <p className="text-[11px] text-stone-300/80 font-mono tracking-wider m-0">
              Du Lịch Khám Phá Di Sản & Bản Địa
            </p>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-3">
          <button
            onClick={() => setActivePage('EXPLORE')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
              activePage === 'EXPLORE' || activePage === 'QUEST_DETAIL'
                ? 'bg-amber-400/15 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-stone-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <MapPin size={15} />
            <span>Khám Phá</span>
          </button>

          <button
            onClick={() => setActivePage('MY_TICKETS')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 relative ${
              activePage === 'MY_TICKETS' || activePage === 'GAMEPLAY'
                ? 'bg-amber-400/15 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-stone-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <Ticket size={15} />
            <span>Vé Của Tôi</span>
            {validTicketCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-stone-950 font-bold text-[11px] rounded-full font-mono">
                {validTicketCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActivePage(role === 'guide' ? 'GUIDE_STUDIO' : 'GUIDE_LANDING')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
              activePage.startsWith('GUIDE_') || activePage === 'QUEST_CREATOR'
                ? 'bg-amber-400/15 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-stone-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <Award size={15} />
            <span>{role === 'guide' ? 'Guide Studio' : 'Dành Cho Guide'}</span>
          </button>

          <button
            onClick={() => setActivePage(role === 'admin' ? 'ADMIN_DASHBOARD' : 'ADMIN_LOGIN')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
              activePage.startsWith('ADMIN_')
                ? 'bg-amber-400/15 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-stone-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield size={15} />
            <span>Quản Trị</span>
          </button>
        </nav>

        {/* Right Actions: Points, Audio, Role Switcher, Profile */}
        <div className="hidden sm:flex items-center gap-3">
          
          {/* Points Counter */}
          {userProfile && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/30 border border-amber-500/30 text-amber-300 text-xs font-mono">
              <Sparkles size={13} className="text-amber-400 animate-spin [animation-duration:8s]" />
              <span className="font-bold">{userProfile.points.toLocaleString()}</span>
              <span className="text-[10px] text-stone-400">PTS</span>
            </div>
          )}

          {/* Live Audio Indicator */}
          {audioTrack?.isPlaying && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs">
              <Volume2 size={13} className="animate-pulse text-amber-400" />
              <div className="flex items-center gap-0.5">
                <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-1 h-4 bg-amber-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                <span className="w-1 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          )}

          {/* Role & Profile Dropdown / Login Button */}
          {userProfile ? (
            <div className="relative" ref={roleMenuRef}>
              <button
                id="btn-header-profile-menu"
                type="button"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-200 hover:brightness-110 cursor-pointer"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(212, 175, 55, 0.35)'
                }}
                aria-label="Tài khoản & vai trò"
              >
                <img
                  src={userProfile.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                  alt="Avatar"
                  className="w-7 h-7 rounded-full object-cover border border-amber-400/50"
                />
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-semibold text-stone-100 m-0 leading-tight">
                    {userProfile.displayName?.split(' ')[0] || 'Tài Khoản'}
                  </p>
                  <div className="m-0">
                    <RoleBadge role={role} />
                  </div>
                </div>
                <ChevronDown size={14} className="text-stone-300" />
              </button>

              {/* Role Switcher Menu Popup */}
              {showRoleMenu && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  style={{
                    background: '#121412',
                    border: '1.5px solid rgba(212, 175, 55, 0.4)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
                  }}
                >
                  <div className="px-3 py-2 border-b border-stone-800 text-xs">
                    <p className="text-stone-400 font-mono m-0 text-[10px]">CHUYỂN NHANH VAI TRÒ (PREVIEW)</p>
                    <p className="text-stone-200 font-semibold m-0 mt-0.5 truncate">{userProfile.displayName}</p>
                  </div>

                  <div className="p-1 space-y-1">
                    <button
                      type="button"
                      onClick={() => handleRoleChange('tourist')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                        role === 'tourist' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Compass size={14} /> Du Khách (Tourist)
                      </span>
                      {role === 'tourist' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRoleChange('guide')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                        role === 'guide' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Award size={14} /> Hướng Dẫn Viên (Guide)
                      </span>
                      {role === 'guide' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRoleChange('admin')}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between cursor-pointer transition-colors ${
                        role === 'admin' ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' : 'text-stone-300 hover:bg-stone-800'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Shield size={14} /> Ban Quản Trị (Admin)
                      </span>
                      {role === 'admin' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-stone-800 flex items-center justify-between px-2">
                    <button
                      type="button"
                      onClick={() => {
                        openLoginModal();
                        setShowRoleMenu(false);
                      }}
                      className="text-[11px] text-amber-400 hover:underline font-mono cursor-pointer"
                    >
                      Đổi tài khoản
                    </button>
                    <button
                      id="btn-header-logout"
                      type="button"
                      onClick={handleLogout}
                      className="text-[11px] text-rose-300 hover:text-rose-200 flex items-center gap-1 font-mono transition-colors cursor-pointer py-1 px-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30"
                    >
                      <LogOut size={12} /> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              id="btn-header-login"
              type="button"
              onClick={openLoginModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold cursor-pointer shadow-sm active:scale-95"
              title="Đăng nhập tài khoản LocalQuest"
            >
              <LogIn size={15} />
              <span>Đăng nhập</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-stone-200 hover:text-white hover:bg-white/10"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2 border-t border-emerald-800 bg-[#0F2D1E] text-stone-100">
          <button
            onClick={handleGoHome}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-white/10"
          >
            <MapPin size={16} /> Khám Phá Quest
          </button>
          <button
            onClick={() => { setActivePage('MY_TICKETS'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between hover:bg-white/10"
          >
            <span className="flex items-center gap-2"><Ticket size={16} /> Vé Của Tôi</span>
            {validTicketCount > 0 && <span className="px-2 py-0.5 bg-amber-500 text-black text-xs font-bold rounded-full font-mono">{validTicketCount}</span>}
          </button>
          <button
            onClick={() => { setActivePage(role === 'guide' ? 'GUIDE_STUDIO' : 'GUIDE_LANDING'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-white/10"
          >
            <Award size={16} /> Dành Cho Guide
          </button>
          <button
            onClick={() => { setActivePage(role === 'admin' ? 'ADMIN_DASHBOARD' : 'ADMIN_LOGIN'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-white/10"
          >
            <Shield size={16} /> Bảng Quản Trị
          </button>

          {/* Mobile Auth Section */}
          <div className="pt-2 mt-2 border-t border-emerald-800/60">
            {userProfile ? (
              <div className="flex items-center justify-between px-3 py-2 bg-black/25 rounded-xl border border-amber-500/20">
                <div className="flex items-center gap-2">
                  <img
                    src={userProfile.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover border border-amber-400/50"
                  />
                  <div className="text-left">
                    <p className="text-xs font-semibold text-stone-100 m-0">{userProfile.displayName}</p>
                    <span className="text-[10px] text-amber-300 font-mono">{userProfile.points.toLocaleString()} PTS</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-rose-300 hover:text-rose-200 flex items-center gap-1 font-mono py-1.5 px-2.5 rounded-lg bg-rose-500/20 border border-rose-500/30"
                >
                  <LogOut size={13} /> Đăng xuất
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  openLoginModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center py-2.5 rounded-xl bg-amber-500 text-stone-950 font-semibold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <LogIn size={16} /> Đăng nhập tài khoản
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
