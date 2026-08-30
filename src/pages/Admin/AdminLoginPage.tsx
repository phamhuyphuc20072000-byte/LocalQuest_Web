import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  KeyRound, 
  ArrowRight, 
  Sparkles, 
  Compass, 
  CheckCircle2, 
  AlertCircle,
  Terminal,
  Cpu,
  Radio,
  Eye,
  EyeOff,
  Server,
  Zap
} from 'lucide-react';
import { useQuest } from '../../context/QuestContext';
import { useAuth } from '../../context/AuthContext';

export function AdminLoginPage() {
  const { setActivePage } = useQuest();
  const { setRole, loginAsDemo } = useAuth();
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [error, setError] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setError(false);

    setTimeout(() => {
      // Allow demo bypass codes or empty for frictionless testing
      if (
        passcode === 'admin' || 
        passcode === 'localquest2026' || 
        passcode === '123456' || 
        passcode === '888888' ||
        passcode === ''
      ) {
        setRole('admin');
        loginAsDemo('admin');
        setActivePage('ADMIN_DASHBOARD');
      } else {
        setError(true);
        setIsAuthenticating(false);
      }
    }, 400);
  };

  const handleQuickDemoAdmin = () => {
    setRole('admin');
    loginAsDemo('admin');
    setActivePage('ADMIN_DASHBOARD');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#0B150F] text-stone-100 relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 space-y-6">
        
        {/* Command Center Card */}
        <div 
          className="rounded-3xl p-8 sm:p-10 shadow-2xl border space-y-6 animate-in zoom-in-95 duration-300 backdrop-blur-md"
          style={{
            background: 'linear-gradient(145deg, #0F2D1E 0%, #133322 60%, #0D2619 100%)',
            borderColor: 'rgba(212, 175, 55, 0.45)',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 40px rgba(212, 175, 55, 0.15)'
          }}
        >
          {/* Header & Crest */}
          <div className="text-center space-y-3">
            <div className="relative inline-block">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-[#D4AF37] flex items-center justify-center mx-auto text-amber-300 shadow-xl">
                <Shield size={32} />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#0F2D1E]"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-amber-300 uppercase tracking-widest font-bold">
                <Cpu size={12} className="text-amber-400" />
                <span>COMMAND CENTER • FIREBASE REALTIME</span>
              </div>
              <h1 className="font-heritage text-2xl sm:text-3xl font-bold gold-gradient-text mt-1">
                Cổng Quản Trị Hệ Thống
              </h1>
              <p className="text-xs text-stone-300 font-luxury-sans mt-1 max-w-sm mx-auto">
                Hệ thống thẩm định nhiệm vụ di sản, phê duyệt Local Guide và xử lý tài chính thời gian thực.
              </p>
            </div>
          </div>

          {/* System Telemetry Chips */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-black/40 border border-emerald-800/60 text-[10px] font-mono">
            <div className="flex flex-col items-center text-center p-1.5 rounded-lg bg-white/5">
              <span className="text-stone-400">GATEWAY</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                <Radio size={10} className="animate-pulse" /> TLS 1.3
              </span>
            </div>
            <div className="flex flex-col items-center text-center p-1.5 rounded-lg bg-white/5">
              <span className="text-stone-400">FIRESTORE</span>
              <span className="text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                <Server size={10} /> Realtime
              </span>
            </div>
            <div className="flex flex-col items-center text-center p-1.5 rounded-lg bg-white/5">
              <span className="text-stone-400">AUTH ROLE</span>
              <span className="text-amber-300 font-bold flex items-center gap-1 mt-0.5">
                <Shield size={10} /> SuperAdmin
              </span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-stone-300">
                <span>MÃ KHÓA BẢO MẬT (ADMIN PASSCODE)</span>
                <span className="text-[10px] text-amber-400">Mặc định: 123456</span>
              </div>
              
              <div className="relative">
                <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
                <input
                  type={showPasscode ? "text" : "password"}
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setError(false);
                  }}
                  placeholder="Nhập mã quản trị (hoặc bấm Đăng nhập demo)"
                  className="w-full pl-10 pr-10 py-3.5 rounded-xl border border-amber-500/40 bg-black/50 text-sm font-mono text-amber-200 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-300 p-1"
                >
                  {showPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && (
                <p className="text-xs text-rose-400 font-mono flex items-center gap-1.5 mt-1.5 bg-rose-950/40 p-2 rounded-lg border border-rose-800/60">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>Mã bảo mật không đúng. Vui lòng nhập '123456' hoặc nhấn Truy Cập Demo bên dưới.</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full btn-gold-aura py-3.5 text-xs font-bold tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              {isAuthenticating ? (
                <>
                  <Zap size={15} className="animate-spin" />
                  <span>ĐANG XÁC THỰC QUYỀN ADMIN...</span>
                </>
              ) : (
                <>
                  <Shield size={16} />
                  <span>ĐĂNG NHẬP BAN QUẢN TRỊ</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Direct Demo Login */}
          <div className="pt-3 border-t border-emerald-800/80 flex flex-col items-center gap-2">
            <button
              onClick={handleQuickDemoAdmin}
              className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-amber-400/40 text-amber-300 hover:text-amber-200 text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles size={14} className="text-amber-400" />
              <span>Truy Cập Nhanh 1-Click (Chế Độ Demo Admin)</span>
            </button>

            <button
              onClick={() => setActivePage('EXPLORE')}
              className="text-[11px] text-stone-400 hover:text-stone-200 font-mono transition-colors mt-1"
            >
              ← Quay lại Cổng Du Khách (Khám Phá)
            </button>
          </div>
        </div>

        {/* Audit Log Footer */}
        <div className="text-center text-[11px] font-mono text-stone-500 flex items-center justify-center gap-2">
          <Terminal size={12} className="text-amber-500/60" />
          <span>LocalQuest Enterprise Vault v2.6 • Active Node Asia-East1</span>
        </div>

      </div>

    </div>
  );
}
