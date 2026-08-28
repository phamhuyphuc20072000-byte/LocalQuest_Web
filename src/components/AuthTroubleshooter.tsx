import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Terminal,
  FileCode,
  Globe,
  Lock,
  Sparkles,
  ArrowRight,
  Server
} from 'lucide-react';
import { signInWithGoogle, signInWithDemoTourist, DEFAULT_FIREBASE_CONFIG } from '../services/firebase';
import { UserProfile, AuthDiagnosticResult } from '../types';

interface AuthTroubleshooterProps {
  onLoginSuccess: (user: UserProfile) => void;
  onSwitchToQuests: () => void;
}

export const AuthTroubleshooter: React.FC<AuthTroubleshooterProps> = ({
  onLoginSuccess,
  onSwitchToQuests
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<AuthDiagnosticResult | null>(null);
  const [testLogs, setTestLogs] = useState<string[]>([]);

  const currentHost = window.location.hostname;
  const currentOrigin = window.location.origin;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const runLiveDiagnosticTest = async () => {
    setTesting(true);
    setTestLogs([
      `[${new Date().toLocaleTimeString()}] Bắt đầu kiểm tra kết nối Firebase Auth...`,
      `[${new Date().toLocaleTimeString()}] Đang phân tích Host: ${currentHost}`,
      `[${new Date().toLocaleTimeString()}] Đang kiểm tra Google Auth Provider popup...`
    ]);

    try {
      const res = await signInWithGoogle();
      if (res.user) {
        setTestLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ✅ Đăng nhập Google thành công! User UID: ${res.user?.uid}`,
          `[${new Date().toLocaleTimeString()}] Tên hiển thị: ${res.user?.displayName}`
        ]);
        setTestResult({
          code: 'AUTH_SUCCESS',
          message: 'Đăng nhập Google hoạt động hoàn hảo!',
          severity: 'success',
          solutionSteps: ['Tài khoản của bạn đã được xác thực thành công.']
        });
        onLoginSuccess(res.user);
      } else if (res.error) {
        setTestLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ❌ Lỗi phát hiện: ${res.error?.code}`,
          `[${new Date().toLocaleTimeString()}] Chi tiết: ${res.error?.message}`
        ]);
        setTestResult(res.error);
      }
    } catch (e: any) {
      setTestLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ❌ Lỗi ngoại lệ: ${e.message}`
      ]);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div id="auth-troubleshooter-view" className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-stone-200">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 p-6 sm:p-8 rounded-3xl border border-stone-800 relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            Trung tâm khắc phục sự cố Google Sign-In
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sửa Lỗi Đăng Nhập Google cho <span className="text-amber-400">localquest2-tourist-web</span>
          </h1>
          <p className="text-stone-300 text-sm leading-relaxed">
            Hệ thống phân tích tự động các nguyên nhân dẫn đến việc không thể đăng nhập Google trên Firebase Web App và cung cấp hướng dẫn giải quyết từng bước chính xác.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              id="run-live-test-btn"
              onClick={runLiveDiagnosticTest}
              disabled={testing}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Đang kiểm tra kết nối...' : 'Chạy thử nghiệm Đăng nhập Google ngay'}</span>
            </button>

            <button
              id="demo-login-quick-btn"
              onClick={() => {
                const user = signInWithDemoTourist();
                onLoginSuccess(user);
                onSwitchToQuests();
              }}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs border border-stone-700 transition-colors flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Đăng nhập Demo & Quay lại trang Quests
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Diagnostics Terminal & Result */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Diagnostics & Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Test Status Banner if available */}
          {testResult && (
            <div
              className={`p-5 rounded-2xl border ${
                testResult.severity === 'success'
                  ? 'bg-green-950/40 border-green-800 text-green-200'
                  : 'bg-red-950/40 border-red-800 text-red-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {testResult.severity === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
                <span>{testResult.message}</span>
              </div>
              {testResult.technicalDetails && (
                <p className="text-xs text-stone-300 mt-2 font-mono bg-stone-950/80 p-2.5 rounded-lg border border-stone-800 break-all">
                  {testResult.technicalDetails}
                </p>
              )}
              {testResult.solutionSteps && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-semibold text-stone-200">Các bước khắc phục:</p>
                  <ul className="text-xs text-stone-300 space-y-1 list-disc pl-5">
                    {testResult.solutionSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Interactive Step-by-Step Checklist */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-400" />
              4 Nguyên nhân chính khiến Google Login bị lỗi & Cách khắc phục
            </h3>

            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h4 className="font-bold text-white text-sm">
                    Lỗi `auth/unauthorized-domain` (Phổ biến nhất 90%)
                  </h4>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  Rất quan trọng
                </span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Google Firebase chỉ cho phép đăng nhập từ các tên miền đã được bạn khai báo trong mục <strong>Authorized domains</strong>. Mọi tên miền khác sẽ bị Google chặn ngay lập tức.
              </p>

              <div className="space-y-2 pt-1">
                <div className="text-xs text-amber-300 font-medium">Sao chép các miền sau và thêm vào Firebase Console:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center justify-between bg-stone-900 p-2.5 rounded-lg border border-stone-800 font-mono text-xs text-stone-300">
                    <span className="truncate">localquest2-tourist-web.web.app</span>
                    <button
                      onClick={() => handleCopy('localquest2-tourist-web.web.app', 'domain-prod')}
                      className="ml-2 text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1 font-sans"
                    >
                      {copiedKey === 'domain-prod' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-stone-900 p-2.5 rounded-lg border border-stone-800 font-mono text-xs text-stone-300">
                    <span className="truncate">localquest2-tourist-web.firebaseapp.com</span>
                    <button
                      onClick={() => handleCopy('localquest2-tourist-web.firebaseapp.com', 'domain-firebase')}
                      className="ml-2 text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1 font-sans"
                    >
                      {copiedKey === 'domain-firebase' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-stone-900 p-2.5 rounded-lg border border-stone-800 font-mono text-xs text-stone-300">
                    <span className="truncate">localhost</span>
                    <button
                      onClick={() => handleCopy('localhost', 'domain-local')}
                      className="ml-2 text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1 font-sans"
                    >
                      {copiedKey === 'domain-local' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-stone-900 p-2.5 rounded-lg border border-stone-800 font-mono text-xs text-amber-300">
                    <span className="truncate">{currentHost}</span>
                    <button
                      onClick={() => handleCopy(currentHost, 'domain-current')}
                      className="ml-2 text-amber-400 hover:text-amber-300 text-xs flex items-center gap-1 font-sans"
                    >
                      {copiedKey === 'domain-current' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="https://console.firebase.google.com/project/localquest2-tourist-web/authentication/settings"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    Đi đến Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h4 className="font-bold text-white text-sm">
                  Kích hoạt Google Sign-In Provider trong Firebase Console
                </h4>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Trong Firebase Console, mục <strong>Authentication &gt; Sign-in method</strong>, nhà cung cấp <strong>Google</strong> phải được chuyển sang trạng thái <strong>Enabled</strong> kèm email hỗ trợ dự án.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <h4 className="font-bold text-white text-sm">
                  Cấu hình OAuth 2.0 Web Client ID trong Google Cloud Console
                </h4>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Đảm bảo Web Client ID tự động tạo bởi Firebase có cấu hình <em>Authorized Javascript origins</em> và <em>Authorised redirect URIs</em> chứa <code className="text-amber-300">https://localquest2-tourist-web.firebaseapp.com/__/auth/handler</code>.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800/80 space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center">
                  4
                </span>
                <h4 className="font-bold text-white text-sm">
                  Cho phép cửa sổ Pop-up và CORS Header
                </h4>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed">
                Firebase Web Auth sử dụng hàm <code className="text-amber-300">signInWithPopup(auth, provider)</code>. Nếu trình duyệt bật tính năng chặn Pop-up, bạn cần cho phép mở cửa sổ đăng nhập Google cho tên miền này.
              </p>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Live Logs & Code Snippet */}
        <div className="space-y-6">
          {/* Live Terminal Logs */}
          <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800 text-stone-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-stone-300">Nhật ký Kiểm tra Trực tiếp</span>
              </div>
              <span className="text-[10px] text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Sẵn sàng
              </span>
            </div>

            <div className="h-48 overflow-y-auto space-y-1.5 text-[11px] text-stone-300 pr-1">
              {testLogs.length === 0 ? (
                <p className="text-stone-500 italic">Nhấn nút "Chạy thử nghiệm Đăng nhập Google" ở trên để ghi nhật ký chẩn đoán...</p>
              ) : (
                testLogs.map((log, index) => (
                  <div key={index} className="leading-tight">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Firebase Client Initializer Code Snippet */}
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-xs flex items-center gap-2">
                <FileCode className="w-4 h-4 text-amber-400" />
                Mã nguồn Đăng nhập Google chuẩn
              </h4>
              <button
                onClick={() => handleCopy(`import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const app = initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "localquest2-tourist-web.firebaseapp.com",
  projectId: "localquest2-tourist-web"
});

export const auth = getAuth(app);

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}`, 'code-snippet')}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                {copiedKey === 'code-snippet' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'code-snippet' ? 'Đã sao chép' : 'Sao chép mã'}
              </button>
            </div>

            <pre className="bg-stone-950 p-3 rounded-xl border border-stone-800 text-[11px] text-amber-200/90 overflow-x-auto font-mono">
{`const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account'
});
const cred = await signInWithPopup(auth, provider);`}
            </pre>
          </div>

          {/* Quick Support Card */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
            <p className="font-bold text-amber-400">💡 Lưu ý quan trọng:</p>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              Môi trường xem thử (Iframe / Cloud Run) có URL riêng dạng <code className="text-amber-300">*.run.app</code>. Khi triển khai lên <code className="text-amber-300">localquest2-tourist-web.web.app</code>, bạn chỉ cần cấu hình tên miền chính một lần duy nhất.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
