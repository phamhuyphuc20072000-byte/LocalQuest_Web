import React, { useState } from 'react';
import { User, Plus, ArrowLeft, ShieldCheck, Check, Sparkles, X, Minus, Square, Globe } from 'lucide-react';
import { UserProfile } from '../types';
import { signInWithGoogleProfile, signInWithGoogle } from '../services/firebase';

interface GoogleAccountChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

interface SavedAccount {
  name: string;
  email: string;
  initial: string;
  bgColor: string;
  avatarUrl?: string;
}

const PRESET_ACCOUNTS: SavedAccount[] = [
  {
    name: 'Huy Phúc',
    email: 'phamhuyphuc20072000@gmail.com',
    initial: 'H',
    bgColor: 'bg-[#e65100] text-white',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  },
  {
    name: 'Huy Phuc Pham',
    email: 'phamhuyphuc322@gmail.com',
    initial: 'H',
    bgColor: 'bg-[#1565c0] text-white'
  },
  {
    name: 'Phuc Pham',
    email: 'phamhuyphuc20062000@gmail.com',
    initial: 'P',
    bgColor: 'bg-[#7b1fa2] text-white'
  }
];

export const GoogleAccountChooserModal: React.FC<GoogleAccountChooserModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [viewMode, setViewMode] = useState<'chooser' | 'custom_email' | 'password'>('chooser');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<SavedAccount | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSelectPresetAccount = async (account: SavedAccount) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      // Simulate quick secure token exchange
      await new Promise((r) => setTimeout(r, 600));
      const user = await signInWithGoogleProfile({
        name: account.name,
        email: account.email,
        photoURL: account.avatarUrl
      });
      onLoginSuccess(user);
      onClose();
    } catch (e: any) {
      setErrorMessage('Không thể đăng nhập với tài khoản này. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomEmailNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      setErrorMessage('Vui lòng nhập địa chỉ email hợp lệ (ví dụ: yourname@gmail.com)');
      return;
    }
    setErrorMessage('');
    // Auto derive a display name if not provided
    const derivedName = customName.trim() || customEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    setSelectedAccount({
      name: derivedName,
      email: customEmail,
      initial: derivedName.charAt(0).toUpperCase(),
      bgColor: 'bg-emerald-600 text-white'
    });
    setViewMode('password');
  };

  const handleCustomPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      const user = await signInWithGoogleProfile({
        name: selectedAccount.name,
        email: selectedAccount.email
      });
      onLoginSuccess(user);
      onClose();
    } catch (e: any) {
      setErrorMessage('Đã xảy ra sự cố xác thực. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNativeFirebasePopup = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const result = await signInWithGoogle();
      if (result.user) {
        onLoginSuccess(result.user);
        onClose();
      } else if (result.error) {
        setErrorMessage(result.error.message);
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Lỗi mở popup Google Auth');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Chrome Window Simulator Box matching Image 2 */}
      <div 
        id="google-account-chooser-window"
        className="w-full max-w-[480px] bg-white text-stone-900 rounded-lg shadow-2xl overflow-hidden border border-stone-300 flex flex-col font-sans relative"
        style={{ minHeight: '580px' }}
      >
        {/* Chrome Title Bar */}
        <div className="bg-[#f2f2f2] border-b border-stone-300 px-3 py-1.5 flex items-center justify-between text-xs text-stone-700 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-stone-400"></span>
            <span className="font-normal text-stone-800 text-[11px] truncate">
              Đăng nhập - Tài khoản Google - Google Chrome
            </span>
          </div>
          <div className="flex items-center gap-2 text-stone-500">
            <button className="p-0.5 hover:bg-stone-300 rounded text-stone-600">
              <Minus className="w-3 h-3" />
            </button>
            <button className="p-0.5 hover:bg-stone-300 rounded text-stone-600">
              <Square className="w-2.5 h-2.5" />
            </button>
            <button onClick={onClose} className="p-0.5 hover:bg-red-500 hover:text-white rounded text-stone-600">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Chrome Address Bar Simulator */}
        <div className="bg-[#f9f9f9] border-b border-stone-200 px-3 py-1.5 flex items-center gap-2 text-[11px] text-stone-600">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <div className="bg-white px-2.5 py-0.5 rounded border border-stone-200 flex-1 truncate font-mono text-[10px] text-stone-700">
            accounts.google.com/v3/signin/accountchooser?client_id=localquest-auth
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
          <div>
            {/* Header: Google Logo + Đăng nhập bằng Google */}
            <div className="flex items-center gap-2.5 mb-6">
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
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
              <span className="text-sm font-medium text-stone-700">Đăng nhập bằng Google</span>
            </div>

            {/* VIEW MODE 1: CHOOSER (Image 2) */}
            {viewMode === 'chooser' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-normal text-stone-900 tracking-tight">Chọn tài khoản</h2>
                  <p className="text-xs text-stone-600 mt-1">
                    Tiếp tục tới{' '}
                    <span className="text-[#1a73e8] font-medium hover:underline cursor-pointer">
                      localquest2-tourist-web.web.app
                    </span>
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs">
                    {errorMessage}
                  </div>
                )}

                {/* Account List */}
                <div className="divide-y divide-stone-200 border-t border-b border-stone-200 -mx-6 sm:-mx-8">
                  {PRESET_ACCOUNTS.map((acc, idx) => (
                    <button
                      key={acc.email}
                      id={`google-account-item-${idx}`}
                      onClick={() => handleSelectPresetAccount(acc)}
                      disabled={isLoading}
                      className="w-full px-6 sm:px-8 py-3.5 flex items-center gap-4 hover:bg-stone-50 transition-colors text-left group disabled:opacity-50"
                    >
                      <div
                        className={`w-9 h-9 rounded-full ${acc.bgColor} flex items-center justify-center font-medium text-sm flex-shrink-0 shadow-sm`}
                      >
                        {acc.initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-stone-900 truncate group-hover:text-[#1a73e8]">
                          {acc.name}
                        </div>
                        <div className="text-xs text-stone-500 truncate">{acc.email}</div>
                      </div>
                    </button>
                  ))}

                  {/* Option: Use another account */}
                  <button
                    id="google-use-another-account-btn"
                    onClick={() => {
                      setViewMode('custom_email');
                      setErrorMessage('');
                    }}
                    disabled={isLoading}
                    className="w-full px-6 sm:px-8 py-3.5 flex items-center gap-4 hover:bg-stone-50 transition-colors text-left group disabled:opacity-50"
                  >
                    <div className="w-9 h-9 rounded-full border border-stone-300 text-stone-600 flex items-center justify-center flex-shrink-0 group-hover:border-stone-400">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-stone-800 group-hover:text-[#1a73e8]">
                        Sử dụng một tài khoản khác
                      </div>
                    </div>
                  </button>
                </div>

                {isLoading && (
                  <div className="flex items-center justify-center gap-2 text-xs text-stone-600 py-2">
                    <div className="w-4 h-4 border-2 border-[#1a73e8] border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang kết nối tài khoản Google...</span>
                  </div>
                )}
              </div>
            )}

            {/* VIEW MODE 2: CUSTOM EMAIL INPUT (Image 2 - Subflow) */}
            {viewMode === 'custom_email' && (
              <form onSubmit={handleCustomEmailNext} className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-normal text-stone-900 tracking-tight">Đăng nhập</h2>
                    <p className="text-xs text-stone-600 mt-1">Sử dụng Tài khoản Google của bạn</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewMode('chooser')}
                    className="p-1.5 text-stone-500 hover:text-stone-800 rounded-full hover:bg-stone-100"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>

                {errorMessage && (
                  <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs">
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs text-stone-600 font-medium mb-1">
                      Email hoặc số điện thoại (Gmail)
                    </label>
                    <input
                      type="email"
                      id="custom-google-email-input"
                      placeholder="ví dụ: phamhuyphuc20072000@gmail.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      required
                      autoFocus
                      className="w-full px-3.5 py-2.5 rounded-md border border-stone-300 focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] outline-none text-sm text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-600 font-medium mb-1">
                      Tên hiển thị (Tuỳ chọn)
                    </label>
                    <input
                      type="text"
                      id="custom-google-name-input"
                      placeholder="Huy Phúc"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-md border border-stone-300 focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] outline-none text-sm text-stone-900"
                    />
                  </div>

                  <a
                    href="https://accounts.google.com/signin/recovery"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-xs text-[#1a73e8] font-medium hover:underline"
                  >
                    Bạn quên địa chỉ email?
                  </a>
                </div>

                <div className="text-xs text-stone-500 leading-relaxed">
                  Đây không phải máy tính của bạn? Hãy sử dụng cửa sổ Khách để đăng nhập riêng tư.
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setViewMode('chooser')}
                    className="text-xs text-[#1a73e8] font-medium hover:bg-blue-50 px-3 py-1.5 rounded"
                  >
                    Quay lại
                  </button>

                  <button
                    type="submit"
                    id="custom-email-next-btn"
                    className="px-6 py-2 rounded bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    Tiếp theo
                  </button>
                </div>
              </form>
            )}

            {/* VIEW MODE 3: PASSWORD CONFIRMATION */}
            {viewMode === 'password' && selectedAccount && (
              <form onSubmit={handleCustomPasswordSubmit} className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-normal text-stone-900 tracking-tight">Chào mừng</h2>
                    <div className="inline-flex items-center gap-2 mt-1 px-2.5 py-1 rounded-full border border-stone-200 text-xs text-stone-700 bg-stone-50">
                      <div className={`w-4 h-4 rounded-full ${selectedAccount.bgColor} flex items-center justify-center text-[9px]`}>
                        {selectedAccount.initial}
                      </div>
                      <span className="font-medium">{selectedAccount.email}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewMode('custom_email')}
                    className="p-1.5 text-stone-500 hover:text-stone-800 rounded-full hover:bg-stone-100"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>

                {errorMessage && (
                  <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs">
                    {errorMessage}
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs text-stone-600 font-medium mb-1">
                      Nhập mật khẩu của bạn
                    </label>
                    <input
                      type="password"
                      id="custom-google-password-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoFocus
                      className="w-full px-3.5 py-2.5 rounded-md border border-stone-300 focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] outline-none text-sm text-stone-900"
                    />
                  </div>

                  <p className="text-[11px] text-stone-500">
                    * Trong chế độ thử nghiệm nhanh, bạn có thể bấm Tiếp theo để hoàn tất xác thực ngay lập tức.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setViewMode('chooser')}
                    className="text-xs text-[#1a73e8] font-medium hover:bg-blue-50 px-3 py-1.5 rounded"
                  >
                    Đổi tài khoản
                  </button>

                  <button
                    type="submit"
                    id="password-submit-btn"
                    disabled={isLoading}
                    className="px-6 py-2 rounded bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang xác nhận...</span>
                      </>
                    ) : (
                      <span>Đăng nhập</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer Bar matching Image 2 */}
          <div className="pt-8 border-t border-stone-200 text-xs text-stone-600 flex flex-wrap items-center justify-between gap-3 select-none">
            <div className="flex items-center gap-1 cursor-pointer hover:text-stone-900">
              <Globe className="w-3.5 h-3.5" />
              <span>Tiếng Việt</span>
              <span className="text-[10px]">▼</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-stone-500">
              <span className="hover:text-stone-800 cursor-pointer">Trợ giúp</span>
              <span className="hover:text-stone-800 cursor-pointer">Quyền riêng tư</span>
              <span className="hover:text-stone-800 cursor-pointer">Điều khoản</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
