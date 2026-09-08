import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, Badge } from '../types';
import { auth, googleProvider, signInWithPopup, signOut, db, doc, getDoc, setDoc } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsDemo: (demoRole: UserRole) => void;
  logout: () => Promise<void>;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  updatePoints: (delta: number, expDelta?: number) => void;
  toggleSaveQuest: (questId: number | string) => void;
  isQuestSaved: (questId: number | string) => boolean;
  awardBadge: (badge: Badge) => void;
}

const DEFAULT_BADGES: Badge[] = [
  {
    id: 'newbie_wanderer',
    name: 'Tân Thủ Khám Phá',
    description: 'Đã gia nhập mạng lưới di sản LocalQuest',
    icon: 'Compass',
    unlockedAt: '2026-08-28T00:00:00Z',
    category: 'explorer'
  },
  {
    id: 'heritage_keeper',
    name: 'Người Gìn Giữ Di Sản',
    description: 'Đã hoàn thành chuyến hành trình đầu tiên',
    icon: 'Award',
    unlockedAt: '2026-08-28T00:00:00Z',
    category: 'heritage'
  }
];

const DEFAULT_PROFILE: UserProfile = {
  uid: 'guest-tourist',
  displayName: 'Nhà Thám Hiểm Di Sản',
  email: 'explorer@localquest.vn',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  role: 'tourist',
  points: 450,
  exp: 280,
  localCoins: 450,
  completedQuests: [1],
  savedQuests: [2, 3],
  joinedDate: 'Tháng 8, 2026',
  phone: '0988 123 456',
  badges: DEFAULT_BADGES
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('localquest_logged_out') === 'true') {
        return null;
      }
      const saved = typeof window !== 'undefined' ? localStorage.getItem('localquest_user_profile') : null;
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_PROFILE;
  });
  const [role, setRoleState] = useState<UserRole>(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem('localquest_logged_out') === 'true') {
        return 'tourist';
      }
      const saved = typeof window !== 'undefined' ? localStorage.getItem('localquest_user_profile') : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role) return parsed.role;
      }
    } catch (e) {}
    return 'tourist';
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  // Sync user profile to Firestore `/users/{uid}`
  const syncToFirestore = async (profile: UserProfile) => {
    if (!db || !profile.uid || profile.uid.startsWith('demo-') || profile.uid.startsWith('guest-')) {
      return;
    }
    try {
      await setDoc(
        doc(db, 'users', profile.uid),
        {
          ...profile,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Could not sync user document to Firestore:', e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('localquest_logged_out');
          }
        } catch (e) {}

        setCurrentUser(user);
        
        let loadedProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Nhà Thám Hiểm Di Sản',
          email: user.email,
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          role: 'tourist',
          points: 500,
          exp: 250,
          localCoins: 500,
          completedQuests: [],
          savedQuests: [],
          joinedDate: new Date().toLocaleDateString('vi-VN'),
          phone: user.phoneNumber || '0901 888 999',
          badges: DEFAULT_BADGES
        };

        // Try reading existing Firestore user document
        if (db) {
          try {
            const userSnap = await getDoc(doc(db, 'users', user.uid));
            if (userSnap.exists()) {
              const data = userSnap.data() as UserProfile;
              loadedProfile = {
                ...loadedProfile,
                ...data,
                uid: user.uid
              };
            } else {
              // Create initial document in Firestore
              await setDoc(doc(db, 'users', user.uid), {
                ...loadedProfile,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }
          } catch (err) {
            console.warn('Firestore user fetch notice:', err);
          }
        }

        setUserProfile(loadedProfile);
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem('localquest_user_profile', JSON.stringify(loadedProfile));
          }
        } catch (e) {}
        setRoleState(loadedProfile.role || 'tourist');
      } else {
        setCurrentUser(null);
        if (typeof window !== 'undefined' && localStorage.getItem('localquest_logged_out') === 'true') {
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (userProfile) {
      const updated = { ...userProfile, role: newRole };
      setUserProfile(updated);
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('localquest_user_profile', JSON.stringify(updated));
        }
      } catch (e) {}
      syncToFirestore(updated);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('localquest_logged_out');
          }
        } catch (e) {}
        setCurrentUser(res.user);
        setIsLoginModalOpen(false);
      }
    } catch (err: any) {
      console.warn('Firebase Popup Sign-in Notice:', err.message);
      // Fallback demo account seamlessly
      loginAsDemo('tourist');
      setIsLoginModalOpen(false);
    }
  };

  const loginAsDemo = (demoRole: UserRole) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('localquest_logged_out');
      }
    } catch (e) {}

    const names = {
      tourist: 'Nhà Thám Hiểm Di Sản',
      guide: 'Hoàng Đức Thành (Nghệ Nhân Bát Tràng)',
      admin: 'Hội Đồng Quản Trị Di Sản (Admin)'
    };
    const avatars = {
      tourist: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      guide: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      admin: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
    };

    setRoleState(demoRole);
    const demoProfile: UserProfile = {
      uid: demoRole === 'guide' ? 'guide-001' : `demo-${demoRole}-${Date.now()}`,
      displayName: names[demoRole],
      email: `${demoRole}@localquest.vn`,
      photoURL: avatars[demoRole],
      role: demoRole,
      points: demoRole === 'admin' ? 9999 : 680,
      exp: demoRole === 'admin' ? 9999 : 450,
      localCoins: demoRole === 'admin' ? 9999 : 680,
      completedQuests: [1, 2],
      savedQuests: [3, 4],
      joinedDate: 'Tháng 8, 2026',
      phone: '0912 345 678',
      badges: DEFAULT_BADGES
    };

    setUserProfile(demoProfile);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('localquest_user_profile', JSON.stringify(demoProfile));
      }
    } catch (e) {}
    setIsLoginModalOpen(false);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    setCurrentUser(null);
    setUserProfile(null);
    setRoleState('tourist');
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('localquest_logged_out', 'true');
        localStorage.removeItem('localquest_user_profile');
      }
    } catch (e) {}
  };

  const updatePoints = (delta: number, expDelta = 0) => {
    if (!userProfile) return;
    const updated: UserProfile = {
      ...userProfile,
      points: Math.max(0, userProfile.points + delta),
      localCoins: Math.max(0, (userProfile.localCoins ?? userProfile.points) + delta),
      exp: Math.max(0, (userProfile.exp ?? 0) + expDelta)
    };
    setUserProfile(updated);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('localquest_user_profile', JSON.stringify(updated));
      }
    } catch (e) {}
    syncToFirestore(updated);
  };

  const toggleSaveQuest = (questId: number | string) => {
    if (!userProfile) {
      openLoginModal();
      return;
    }
    const isSaved = userProfile.savedQuests.includes(questId);
    const updatedList = isSaved
      ? userProfile.savedQuests.filter((id) => id !== questId)
      : [...userProfile.savedQuests, questId];

    const updated: UserProfile = {
      ...userProfile,
      savedQuests: updatedList
    };
    setUserProfile(updated);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('localquest_user_profile', JSON.stringify(updated));
      }
    } catch (e) {}
    syncToFirestore(updated);
  };

  const isQuestSaved = (questId: number | string) => {
    return userProfile?.savedQuests.includes(questId) || false;
  };

  const awardBadge = (badge: Badge) => {
    if (!userProfile) return;
    const existing = userProfile.badges || [];
    if (existing.some((b) => b.id === badge.id)) return;

    const updated: UserProfile = {
      ...userProfile,
      badges: [...existing, { ...badge, unlockedAt: new Date().toISOString() }]
    };
    setUserProfile(updated);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('localquest_user_profile', JSON.stringify(updated));
      }
    } catch (e) {}
    syncToFirestore(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        role,
        setRole,
        loading,
        loginWithGoogle,
        loginAsDemo,
        logout,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        updatePoints,
        toggleSaveQuest,
        isQuestSaved,
        awardBadge
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
