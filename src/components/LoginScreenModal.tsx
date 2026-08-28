import React, { useState } from 'react';
import { Compass, Sparkles, CheckCircle2, ArrowLeft, X, Shield, Phone, KeyRound } from 'lucide-react';
import { UserProfile } from '../types';
import { signInWithPhoneOTP } from '../services/firebase';

interface LoginScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenGoogleChooser: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginScreenModal: React.FC<LoginScreenModalProps> = ({
  isOpen,
  onClose,
  onOpenGoogleChooser,
  onLoginSuccess
}) => {
  const [phoneNumber, setPhoneNumber] = useState('0912 345 678');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = phoneNumber.replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      setErrorMsg('Vui lòng nhập số điện thoại hợp lệ (từ 10 số)');
      return;
    }
    setErrorMsg('');
    setIsOtpSent(true);
    setOtpCode('686868'); // default friendly demo OTP
    setCountdown(60);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      setErrorMsg('Vui lòng nhập mã OTP (ví dụ: 686868)');
      return;
    }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      const user = await signInWithPhoneOTP(phoneNumber);
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Mã OTP không chính xác');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#faf8f5] text-stone-900 flex flex-col items-center justify-center p-4 sm:p-6 select-none animate-fade-in">
      {/* Top Left: Return to home */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <button
          id="login-screen-back-home-btn"
          onClick={onClose}
          className="flex items-center gap-2 text-xs font-medium text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg hover:bg-stone-200/60 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang chủ</span>
        </button>
      </div>

      {/* Top Right: Close button */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <button
          onClick={onClose}
          className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Container exactly matching Image 1 */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center">
        {/* Brand Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-[#1b4332] text-amber-400 flex items-center justify-center shadow-sm">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-serif font-bold text-lg tracking-tight text-[#1b4332]">
            LocalQuest
          </span>
        </div>

        {/* Big Heading */}
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-8 tracking-tight">
          Đăng nhập
        </h1>

        {/* Main White Card matching Image 1 */}
        <div 
          id="login-card-container"
          className="w-full bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-6"
        >
          {/* Google Sign-in Button matching Image 1 */}
          <button
            id="login-screen-google-btn"
            onClick={() => {
              onOpenGoogleChooser();
            }}
            className="w-full py-3 px-4 rounded-md border border-stone-300 hover:border-stone-400 bg-white hover:bg-stone-50/80 text-stone-800 text-sm font-medium flex items-center justify-center gap-3 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.05)] active:scale-[0.99]"
          >
            {/* Google 4-color SVG Icon */}
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
            <span>Đăng nhập bằng Google</span>
          </button>

          {/* Divider: hoặc */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-stone-200 w-full"></div>
            <span className="bg-white px-3 text-xs text-stone-400 font-sans">
              hoặc
            </span>
            <div className="border-t border-stone-200 w-full"></div>
          </div>

          {/* Phone OTP Section matching Image 1 */}
          <div className="space-y-3">
            <label className="block text-[11px] font-mono tracking-widest text-stone-500 uppercase">
              SỐ ĐIỆN THOẠI
            </label>

            {!isOtpSent ? (
              <form onSubmit={handleSendOtp} className="flex gap-2">
                <input
                  type="tel"
                  id="login-screen-phone-input"
                  placeholder="0912 345 678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-md border border-stone-300 focus:border-stone-700 outline-none text-sm text-stone-800 font-mono"
                />
                <button
                  type="submit"
                  id="login-screen-send-otp-btn"
                  className="px-4 py-2.5 rounded-md border border-stone-700 bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold whitespace-nowrap transition-colors"
                >
                  Gửi OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded border border-emerald-200">
                  <span>Đã gửi mã xác thực tới <strong>{phoneNumber}</strong></span>
                  <button 
                    type="button" 
                    onClick={() => setIsOtpSent(false)} 
                    className="text-stone-500 underline text-[11px]"
                  >
                    Đổi số
                  </button>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    id="login-screen-otp-input"
                    placeholder="Nhập 6 số OTP (VD: 686868)"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    autoFocus
                    className="flex-1 px-3.5 py-2.5 rounded-md border border-stone-300 focus:border-stone-700 outline-none text-sm text-stone-800 font-mono tracking-wider"
                  />
                  <button
                    type="submit"
                    id="login-screen-verify-otp-btn"
                    disabled={loading}
                    className="px-4 py-2.5 rounded-md bg-[#1b4332] hover:bg-[#153427] text-white text-xs font-semibold whitespace-nowrap transition-colors"
                  >
                    {loading ? 'Xác thực...' : 'Xác nhận OTP'}
                  </button>
                </div>
              </form>
            )}

            {errorMsg && (
              <p className="text-xs text-red-600 font-medium">{errorMsg}</p>
            )}
          </div>
        </div>

        {/* Small Notice / Helper */}
        <p className="text-xs text-stone-400 text-center mt-6">
          Bằng việc đăng nhập, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của LocalQuest.
        </p>
      </div>
    </div>
  );
};
