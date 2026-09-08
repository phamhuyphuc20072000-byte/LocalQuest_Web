import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { QuestProvider, useQuest } from './context/QuestContext';
import { ThemeProvider } from './context/ThemeContext';

// Common Luxury Layout Components
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { FloatingAudioPlayer } from './components/common/FloatingAudioPlayer';
import { AiChatWidget } from './components/common/AiChatWidget';

// Tourist Pages
import { ExplorePage } from './pages/Tourist/ExplorePage';
import { QuestDetailPage } from './pages/Tourist/QuestDetailPage';
import { CheckoutPage } from './pages/Tourist/CheckoutPage';
import { MyTicketsPage } from './pages/Tourist/MyTicketsPage';
import { GameplayPage } from './pages/Tourist/GameplayPage';

// Guide Pages
import { GuideLandingPage } from './pages/Guide/GuideLandingPage';
import { GuideRegisterPage } from './pages/Guide/GuideRegisterPage';
import { GuideStudioPage } from './pages/Guide/GuideStudioPage';
import { QuestCreatorPage } from './pages/Guide/QuestCreatorPage';
import { GuideWalletPage } from './pages/Guide/GuideWalletPage';

// Admin Pages
import { AdminLoginPage } from './pages/Admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/Admin/AdminDashboardPage';

function AppContent() {
  const { activePage } = useQuest();
  const { isLoginModalOpen, closeLoginModal, loginWithGoogle, loginAsDemo } = useAuth();

  // Page Routing Router
  const renderCurrentPage = () => {
    switch (activePage) {
      case 'EXPLORE':
        return <ExplorePage />;
      case 'QUEST_DETAIL':
        return <QuestDetailPage />;
      case 'CHECKOUT':
        return <CheckoutPage />;
      case 'MY_TICKETS':
        return <MyTicketsPage />;
      case 'GAMEPLAY':
        return <GameplayPage />;

      case 'GUIDE_LANDING':
        return <GuideLandingPage />;
      case 'GUIDE_REGISTER':
        return <GuideRegisterPage />;
      case 'GUIDE_STUDIO':
        return <GuideStudioPage />;
      case 'QUEST_CREATOR':
        return <QuestCreatorPage />;
      case 'GUIDE_WALLET':
        return <GuideWalletPage />;

      case 'ADMIN_LOGIN':
        return <AdminLoginPage />;
      case 'ADMIN_DASHBOARD':
        return <AdminDashboardPage />;

      default:
        return <ExplorePage />;
    }
  };

  const isFullscreenGameplay = activePage === 'GAMEPLAY';

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F4EE] text-stone-900 font-luxury-sans antialiased selection:bg-amber-400 selection:text-stone-950">
      
      {/* Header is rendered everywhere except full-screen Gameplay */}
      {!isFullscreenGameplay && <Header />}

      {/* Main Page Body */}
      <main className="flex-1">
        {renderCurrentPage()}
      </main>

      {/* Footer is rendered everywhere except full-screen Gameplay */}
      {!isFullscreenGameplay && <Footer />}

      {/* Global Floating Audio Player for AI Voice Narration */}
      <FloatingAudioPlayer />

      {/* Global Floating AI Heritage Concierge Assistant */}
      {!isFullscreenGameplay && <AiChatWidget />}

      {/* Google Auth Modal (if triggered) */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm rounded-3xl p-6 sm:p-8 bg-[#FDFAF5] border shadow-2xl text-center space-y-5"
            style={{ borderColor: '#D4AF37' }}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center mx-auto text-amber-800 font-heritage font-bold text-xl">
              LQ
            </div>
            <div>
              <h3 className="font-heritage text-xl font-bold text-[#0F2D1E]">
                Đăng Nhập LocalQuest
              </h3>
              <p className="text-xs text-stone-500 font-luxury-sans mt-1">
                Đăng nhập để đồng bộ vé di sản, điểm thưởng và tiến trình chơi của bạn trên mọi thiết bị.
              </p>
            </div>

            <button
              onClick={() => {
                loginWithGoogle();
                closeLoginModal();
              }}
              className="w-full py-3 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-800 shadow-sm flex items-center justify-center gap-2 transition-colors font-mono cursor-pointer"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-4 h-4"
              />
              <span>Đăng nhập với Google</span>
            </button>

            {/* Quick preview demo accounts */}
            <div className="pt-2 border-t border-stone-200">
              <p className="text-[10px] font-mono text-stone-400 uppercase mb-2">Hoặc đăng nhập nhanh (Preview Demo)</p>
              <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    loginAsDemo('tourist');
                    closeLoginModal();
                  }}
                  className="px-2 py-2 rounded-xl bg-stone-100 hover:bg-amber-100 hover:border-amber-300 text-stone-700 font-medium border border-stone-200 transition-colors cursor-pointer"
                >
                  Du Khách
                </button>
                <button
                  type="button"
                  onClick={() => {
                    loginAsDemo('guide');
                    closeLoginModal();
                  }}
                  className="px-2 py-2 rounded-xl bg-stone-100 hover:bg-amber-100 hover:border-amber-300 text-stone-700 font-medium border border-stone-200 transition-colors cursor-pointer"
                >
                  HDV Guide
                </button>
                <button
                  type="button"
                  onClick={() => {
                    loginAsDemo('admin');
                    closeLoginModal();
                  }}
                  className="px-2 py-2 rounded-xl bg-stone-100 hover:bg-amber-100 hover:border-amber-300 text-stone-700 font-medium border border-stone-200 transition-colors cursor-pointer"
                >
                  Quản Trị
                </button>
              </div>
            </div>

            <button
              onClick={closeLoginModal}
              className="text-xs text-stone-400 hover:text-stone-600 font-mono cursor-pointer"
            >
              Để sau (Chế độ khách)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QuestProvider>
          <AppContent />
        </QuestProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
