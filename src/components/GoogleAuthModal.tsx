import React, { useState } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle2,
  Settings,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Info,
  RefreshCw,
  Sparkles,
  User,
  Plus,
  ArrowLeft,
  Smartphone
} from 'lucide-react';
import {
  signInWithGoogle,
  signInWithGoogleProfile,
  signInWithDemoTourist,
  getSavedFirebaseConfig,
  saveFirebaseConfig,
  DEFAULT_FIREBASE_CONFIG
} from '../services/firebase';
import { UserProfile, AuthDiagnosticResult, FirebaseCustomConfig } from '../types';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  onOpenLoginScreen?: () => void;
  onOpenGoogleChooser?: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onOpenLoginScreen,
  onOpenGoogleChooser
}) => {
  const [loading, setLoading] = useState(false);
  const [diagnosticError, setDiagnosticError] = useState<AuthDiagnosticResult | null>(null);
  const [activeTab, setActiveTab] = useState<'chooser' | 'troubleshoot' | 'config'>('chooser');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Custom Gmail input state
  const [customEmailMode, setCustomEmailMode] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  // Custom Firebase configuration state
  const [customConfig, setCustomConfig] = useState<FirebaseCustomConfig>(getSavedFirebaseConfig());
  const [configSaveSuccess, setConfigSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSelectAccount = async (name: string, email: string, avatarUrl?: string) => {
    setLoading(true);
    setDiagnosticError(null);
    try {
      await new Promise((r) => setTimeout(r, 400));
      const user = await signInWithGoogleProfile({
        name,
        email,
        photoURL: avatarUrl
      });
      onLoginSuccess(user);
      onClose();
    } catch (e: any) {
      setDiagnosticError(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      alert('Vui lòng nhập email hợp lệ (ví dụ: yourname@gmail.com)');
      return;
    }
    const name = customName.trim() || customEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    await handleSelectAccount(name, customEmail);
  };

  const handleNativeGooglePopup = async () => {
    setLoading(true);
    setDiagnosticError(null);
    try {
      const result = await signInWithGoogle();
      if (result.user) {
        onLoginSuccess(result.user);
        onClose();
      } else if (result.error) {
        setDiagnosticError(result.error);
        setActiveTab('troubleshoot');
      }
    } catch (e: any) {
      setDiagnosticError({
        code: 'RUNTIME_EXCEPTION',
        message: 'Lỗi thực thi trong quá trình kết nối Google Auth',
        technicalDetails: e.message || String(e),
        severity: 'error',
        solutionSteps: [
          'Kiểm tra lại kết nối mạng của bạn.',
          'Kiểm tra tab Cấu hình Firebase để nhập đúng API Key của dự án localquest2-tourist-web.'
        ]
      });
      setActiveTab('troubleshoot');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfig(customConfig);
    setConfigSaveSuccess(true);
    setTimeout(() => {
      setConfigSaveSuccess(false);
      setActiveTab('chooser');
    }, 1500);
  };

  const handleResetDefaultConfig = () => {
    setCustomConfig(DEFAULT_FIREBASE_CONFIG);
    saveFirebaseConfig(DEFAULT_FIREBASE_CONFIG);
    setConfigSaveSuccess(true);
    setTimeout(() => setConfigSaveSuccess(false), 1500);
  };

  const currentHostname = window.location.hostname;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        id="google-auth-modal"
        className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl text-stone-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Đăng nhập Google - LocalQuest</h3>
              <p className="text-xs text-stone-400">Chọn tài khoản Google du khách hoặc nhập Gmail của bạn</p>
            </div>
          </div>

          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-stone-800 bg-stone-900/50 text-xs">
          <button
            id="tab-btn-login"
            onClick={() => setActiveTab('chooser')}
            className={`py-3 px-4 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'chooser'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Chọn tài khoản Google
          </button>

          <button
            id="tab-btn-troubleshoot"
            onClick={() => setActiveTab('troubleshoot')}
            className={`py-3 px-4 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'troubleshoot'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            Sửa lỗi Firebase ({diagnosticError ? '1 Lỗi' : 'Chuẩn đoán'})
          </button>

          <button
            id="tab-btn-config"
            onClick={() => setActiveTab('config')}
            className={`py-3 px-4 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Cấu hình Firebase SDK
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {activeTab === 'chooser' && (
            <div className="space-y-5">
              {/* Google Account List matching Image 2 */}
              {!customEmailMode ? (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <h4 className="text-lg font-bold text-white">Chọn tài khoản Google</h4>
                    <p className="text-stone-400 text-xs">
                      Tiếp tục tới <span className="text-amber-400 font-medium">localquest2-tourist-web.web.app</span>
                    </p>
                  </div>

                  <div className="bg-stone-950/70 border border-stone-800 rounded-xl divide-y divide-stone-800 overflow-hidden">
                    {/* Account 1 */}
                    <button
                      id="account-btn-1"
                      onClick={() => handleSelectAccount('Huy Phúc', 'phamhuyphuc20072000@gmail.com')}
                      disabled={loading}
                      className="w-full p-3.5 flex items-center gap-3.5 hover:bg-stone-800/60 transition-colors text-left group"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#e65100] text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                        H
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-stone-100 group-hover:text-amber-400 transition-colors">
                          Huy Phúc
                        </div>
                        <div className="text-xs text-stone-400 truncate">phamhuyphuc20072000@gmail.com</div>
                      </div>
                    </button>

                    {/* Account 2 */}
                    <button
                      id="account-btn-2"
                      onClick={() => handleSelectAccount('Huy Phuc Pham', 'phamhuyphuc322@gmail.com')}
                      disabled={loading}
                      className="w-full p-3.5 flex items-center gap-3.5 hover:bg-stone-800/60 transition-colors text-left group"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#1565c0] text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                        H
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-stone-100 group-hover:text-amber-400 transition-colors">
                          Huy Phuc Pham
                        </div>
                        <div className="text-xs text-stone-400 truncate">phamhuyphuc322@gmail.com</div>
                      </div>
                    </button>

                    {/* Account 3 */}
                    <button
                      id="account-btn-3"
                      onClick={() => handleSelectAccount('Phuc Pham', 'phamhuyphuc20062000@gmail.com')}
                      disabled={loading}
                      className="w-full p-3.5 flex items-center gap-3.5 hover:bg-stone-800/60 transition-colors text-left group"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#7b1fa2] text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                        P
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-stone-100 group-hover:text-amber-400 transition-colors">
                          Phuc Pham
                        </div>
                        <div className="text-xs text-stone-400 truncate">phamhuyphuc20062000@gmail.com</div>
                      </div>
                    </button>

                    {/* Use Another Account Button */}
                    <button
                      id="account-btn-custom"
                      onClick={() => setCustomEmailMode(true)}
                      className="w-full p-3.5 flex items-center gap-3.5 hover:bg-stone-800/60 transition-colors text-left group"
                    >
                      <div className="w-9 h-9 rounded-full border border-stone-700 bg-stone-900 text-stone-300 font-bold flex items-center justify-center text-sm flex-shrink-0 group-hover:border-amber-500/50">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-stone-300 group-hover:text-amber-400 transition-colors text-xs">
                          Sử dụng một tài khoản Gmail khác
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Actions Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {onOpenGoogleChooser && (
                      <button
                        onClick={onOpenGoogleChooser}
                        className="py-2 px-3 rounded-xl bg-white hover:bg-stone-100 text-stone-900 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                          <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                          <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                        </svg>
                        <span>Mở Cửa sổ Google (Hình 2)</span>
                      </button>
                    )}

                    {onOpenLoginScreen && (
                      <button
                        onClick={onOpenLoginScreen}
                        className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-stone-700"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                        <span>Màn hình Đăng nhập (Hình 1)</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Custom Email Input Mode */
                <form onSubmit={handleCustomEmailSubmit} className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-base">Nhập tài khoản Gmail</h4>
                    <button
                      type="button"
                      onClick={() => setCustomEmailMode(false)}
                      className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" /> Quay lại
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-stone-400 mb-1 font-medium">
                        Địa chỉ Gmail của bạn
                      </label>
                      <input
                        type="email"
                        id="custom-modal-gmail-input"
                        placeholder="yourname@gmail.com"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        required
                        autoFocus
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-stone-400 mb-1 font-medium">
                        Họ và tên hiển thị (Tuỳ chọn)
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Phạm Huy Phúc"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 focus:outline-none focus:border-amber-500 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setCustomEmailMode(false)}
                      className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-medium hover:bg-stone-700"
                    >
                      Huỷ
                    </button>
                    <button
                      type="submit"
                      id="submit-custom-gmail-btn"
                      disabled={loading}
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors"
                    >
                      {loading ? 'Đang kết nối...' : 'Đăng nhập với Gmail này'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'troubleshoot' && (
            <div className="space-y-5">
              {diagnosticError && (
                <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Mã lỗi: {diagnosticError.code}</span>
                  </div>
                  <p className="text-xs">{diagnosticError.message}</p>
                  {diagnosticError.technicalDetails && (
                    <p className="text-[11px] text-stone-400 font-mono bg-stone-950/80 p-2 rounded border border-stone-800 break-all">
                      {diagnosticError.technicalDetails}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Hướng dẫn sửa lỗi Google Login trên localquest2-tourist-web.web.app
                  </h4>
                  <a
                    href="https://console.firebase.google.com/project/localquest2-tourist-web/authentication/settings"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                  >
                    Mở Firebase Console <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Fix Item 1: Authorized Domains */}
                <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <h5 className="font-semibold text-stone-100 text-xs">Thêm miền vào Authorized Domains</h5>
                      <p className="text-stone-400 text-[11px] mt-0.5">
                        Firebase chặn đăng nhập từ các tên miền chưa được khai báo trước. Bạn cần thêm tên miền của web vào Firebase Console.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pl-7">
                    <div className="text-[11px] text-stone-300">Sao chép các domain bên dưới và dán vào <strong>Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains</strong>:</div>
                    
                    <div className="flex items-center justify-between bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800 font-mono text-[11px] text-stone-300">
                      <span>localquest2-tourist-web.web.app</span>
                      <button
                        onClick={() => handleCopy('localquest2-tourist-web.web.app', 'domain1')}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[10px]"
                      >
                        {copiedText === 'domain1' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        {copiedText === 'domain1' ? 'Đã chép' : 'Sao chép'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800 font-mono text-[11px] text-stone-300">
                      <span>localquest2-tourist-web.firebaseapp.com</span>
                      <button
                        onClick={() => handleCopy('localquest2-tourist-web.firebaseapp.com', 'domain2')}
                        className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[10px]"
                      >
                        {copiedText === 'domain2' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        {copiedText === 'domain2' ? 'Đã chép' : 'Sao chép'}
                      </button>
                    </div>

                    {currentHostname !== 'localquest2-tourist-web.web.app' && (
                      <div className="flex items-center justify-between bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-800 font-mono text-[11px] text-amber-300">
                        <span>{currentHostname} (Miền xem thử hiện tại)</span>
                        <button
                          onClick={() => handleCopy(currentHostname, 'domain3')}
                          className="text-amber-400 hover:text-amber-300 flex items-center gap-1 text-[10px]"
                        >
                          {copiedText === 'domain3' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                          {copiedText === 'domain3' ? 'Đã chép' : 'Sao chép'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fix Item 2: Enable Google Sign-In */}
                <div className="bg-stone-950/70 border border-stone-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <h5 className="font-semibold text-stone-100 text-xs">Bật Google Sign-in Provider</h5>
                      <p className="text-stone-400 text-[11px] mt-0.5">
                        Vào <strong>Authentication &gt; Sign-in method</strong> &gt; Chọn <strong>Google</strong> &gt; Gạt sang <strong>Enable (Bật)</strong> &gt; Chọn Email hỗ trợ dự án &gt; Nhấn <strong>Save (Lưu)</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleNativeGooglePopup}
                  disabled={loading}
                  className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Thử mở popup Google chính thức
                </button>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">Cấu hình Firebase Web App</h4>
                <p className="text-stone-400 text-xs">
                  Bạn có thể cập nhật trực tiếp Firebase API Key và Auth Domain từ Firebase Console của bạn.
                </p>
              </div>

              {configSaveSuccess && (
                <div className="p-3 rounded-lg bg-green-950/50 border border-green-800 text-green-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đã lưu và tái khởi tạo Firebase SDK thành công!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-stone-400 mb-1 font-medium">apiKey</label>
                  <input
                    type="text"
                    value={customConfig.apiKey}
                    onChange={(e) => setCustomConfig({ ...customConfig, apiKey: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 focus:outline-none focus:border-amber-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-medium">authDomain</label>
                  <input
                    type="text"
                    value={customConfig.authDomain}
                    onChange={(e) => setCustomConfig({ ...customConfig, authDomain: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 focus:outline-none focus:border-amber-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-medium">projectId</label>
                  <input
                    type="text"
                    value={customConfig.projectId}
                    onChange={(e) => setCustomConfig({ ...customConfig, projectId: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 focus:outline-none focus:border-amber-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-medium">appId</label>
                  <input
                    type="text"
                    value={customConfig.appId || ''}
                    onChange={(e) => setCustomConfig({ ...customConfig, appId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 focus:outline-none focus:border-amber-500 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-stone-800">
                <button
                  type="button"
                  onClick={handleResetDefaultConfig}
                  className="text-xs text-stone-400 hover:text-stone-200 underline"
                >
                  Khôi phục mặc định localquest2-tourist-web
                </button>

                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors"
                >
                  Lưu cấu hình
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
