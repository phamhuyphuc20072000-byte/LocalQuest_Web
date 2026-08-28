import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db, doc, getDoc } from './firebase';
import { Quest, QUESTS, UserRole } from './data/quests';
import { ScreenA1 } from './components/ScreenHome';
import { ScreenA2, ScreenA3 } from './components/ScreenQuestDetail';
import { ScreenA4 } from './components/ScreenAuth';
import { ScreenA5, ScreenA6 } from './components/ScreenCheckout';
import { ScreenGuideStudio, ScreenAdminDashboard, ScreenGameplay } from './components/ScreenGuideAdminGameplay';

export type ScreenState = 
  | 'A1' // Home
  | 'A2' // Quest Detail
  | 'A4' // Auth (Google, Email/Password, 6-Hole OTP)
  | 'A5' // Checkout
  | 'A6_SUCCESS' // Payment Success
  | 'A6_FAIL' // Payment Failed
  | 'GUIDE_STUDIO' // Guide Creator Studio
  | 'ADMIN' // Admin Dashboard
  | 'GAMEPLAY'; // Realtime Quest Experience

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('A1');
  const [selectedQuest, setSelectedQuest] = useState<Quest>(QUESTS[0]);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState<{ guideType: 'human' | 'ai'; date: string; session: string; people: number; total: number } | null>(null);
  const [redirectAfterAuth, setRedirectAfterAuth] = useState<'A5' | 'A1' | 'GUIDE_STUDIO' | 'ADMIN'>('A1');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserEmail(user.email || '');
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) {
            const data = snap.data();
            setUserRole(data.role || 'tourist');
          } else {
            setUserRole('tourist');
          }
        } catch (e) {
          setUserRole('tourist');
        }
      } else {
        // Default guest
        setUserRole(null);
        setUserEmail('');
      }
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    setUserRole(null);
    setUserEmail('');
    setScreen('A1');
  };

  const handleQuestClick = (q: Quest) => {
    setSelectedQuest(q);
    setScreen('A2');
  };

  const handleProceedBooking = (data: { guideType: 'human' | 'ai'; date: string; session: string; people: number; total: number }) => {
    setBookingData(data);
    setShowBookingModal(false);
    if (!userRole) {
      setRedirectAfterAuth('A5');
      setScreen('A4');
    } else {
      setScreen('A5');
    }
  };

  const handleAuthSuccess = (role: UserRole, email?: string) => {
    if (role) {
      setUserRole(role);
      if (email) setUserEmail(email);
      if (redirectAfterAuth === 'A5') {
        setScreen('A5');
      } else if (redirectAfterAuth === 'GUIDE_STUDIO') {
        setScreen('GUIDE_STUDIO');
      } else if (redirectAfterAuth === 'ADMIN') {
        setScreen('ADMIN');
      } else {
        setScreen('A1');
      }
    } else {
      setScreen('A1');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F5F0E8' }}>
      {/* Screen Routing */}
      {screen === 'A1' && (
        <ScreenA1
          onQuestClick={handleQuestClick}
          onLogin={() => { setRedirectAfterAuth('A1'); setScreen('A4'); }}
          onLogout={handleLogout}
          onGuidePortal={() => {
            if (!userRole) {
              setRedirectAfterAuth('GUIDE_STUDIO');
              setScreen('A4');
            } else {
              setScreen('GUIDE_STUDIO');
            }
          }}
          user={userRole}
          userEmail={userEmail}
          onPlayGame={() => setScreen('GAMEPLAY')}
        />
      )}

      {screen === 'A2' && (
        <>
          <ScreenA2
            quest={selectedQuest}
            onBack={() => setScreen('A1')}
            onBook={() => setShowBookingModal(true)}
            user={userRole}
            userEmail={userEmail}
            onLogin={() => { setRedirectAfterAuth('A2' as any); setScreen('A4'); }}
            onLogout={handleLogout}
          />
          {showBookingModal && (
            <ScreenA3
              quest={selectedQuest}
              user={userRole}
              onClose={() => setShowBookingModal(false)}
              onProceed={handleProceedBooking}
            />
          )}
        </>
      )}

      {screen === 'A4' && (
        <ScreenA4
          onSuccess={handleAuthSuccess}
          redirectRole={redirectAfterAuth === 'A5' ? 'đặt vé' : undefined}
        />
      )}

      {screen === 'A5' && (
        <ScreenA5
          quest={selectedQuest}
          bookingData={bookingData}
          onBack={() => setScreen('A2')}
          onPay={() => setScreen('A6_SUCCESS')}
          onFail={() => setScreen('A6_FAIL')}
        />
      )}

      {screen === 'A6_SUCCESS' && (
        <ScreenA6
          success={true}
          quest={selectedQuest}
          onRetry={() => setScreen('A5')}
          onHome={() => setScreen('A1')}
          onPlayGame={() => setScreen('GAMEPLAY')}
        />
      )}

      {screen === 'A6_FAIL' && (
        <ScreenA6
          success={false}
          quest={selectedQuest}
          onRetry={() => setScreen('A5')}
          onHome={() => setScreen('A1')}
          onPlayGame={() => setScreen('GAMEPLAY')}
        />
      )}

      {screen === 'GUIDE_STUDIO' && (
        <ScreenGuideStudio
          onBack={() => setScreen('A1')}
          onCreateQuest={(newQ) => {
            console.log('Created new quest:', newQ);
          }}
        />
      )}

      {screen === 'ADMIN' && (
        <ScreenAdminDashboard onBack={() => setScreen('A1')} />
      )}

      {screen === 'GAMEPLAY' && (
        <ScreenGameplay
          quest={selectedQuest}
          onBack={() => setScreen('A1')}
        />
      )}
    </div>
  );
}
