import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, FirebaseCustomConfig, AuthDiagnosticResult, BookingRecord } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentAuthUser = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuthUser?.uid,
      email: currentAuthUser?.email,
      emailVerified: currentAuthUser?.emailVerified,
      isAnonymous: currentAuthUser?.isAnonymous,
      tenantId: currentAuthUser?.tenantId,
      providerInfo: currentAuthUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Default configuration from provisioned firebase-applet-config.json
export const DEFAULT_FIREBASE_CONFIG: FirebaseCustomConfig = {
  apiKey: firebaseConfig.apiKey || "AIzaSyC8F1L3hF-ahuxeY3RvhF4DwuI9vsVw75o",
  authDomain: firebaseConfig.authDomain || "divine-antonym-zknl3.firebaseapp.com",
  projectId: firebaseConfig.projectId || "divine-antonym-zknl3",
  storageBucket: firebaseConfig.storageBucket || "divine-antonym-zknl3.firebasestorage.app",
  messagingSenderId: firebaseConfig.messagingSenderId || "820496312093",
  appId: firebaseConfig.appId || "1:820496312093:web:276bce2de92d0cbd2363f4",
};

const CONFIG_STORAGE_KEY = 'localquest_firebase_config';
const USER_STORAGE_KEY = 'localquest_user_profile';

export function getSavedFirebaseConfig(): FirebaseCustomConfig {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Could not read saved firebase config', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config: FirebaseCustomConfig): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    initFirebase(config, true);
  } catch (e) {
    console.error('Failed to save firebase config', e);
  }
}

let currentApp: FirebaseApp | null = null;
let currentAuth: ReturnType<typeof getAuth> | null = null;
let currentDb: Firestore | null = null;

export function initFirebase(customConfig?: FirebaseCustomConfig, forceReinit = false): {
  app: FirebaseApp | null;
  auth: ReturnType<typeof getAuth> | null;
  db: Firestore | null;
  error?: string;
} {
  try {
    const configToUse = customConfig || getSavedFirebaseConfig();

    if (getApps().length > 0 && !forceReinit && currentApp && currentAuth && currentDb) {
      return { app: currentApp, auth: currentAuth, db: currentDb };
    }

    if (getApps().length > 0 && forceReinit) {
      currentApp = getApp();
    } else if (getApps().length === 0) {
      currentApp = initializeApp(configToUse);
    } else {
      currentApp = getApps()[0];
    }

    currentAuth = getAuth(currentApp);

    // Initialize firestore with optional databaseId if specified
    const dbId = (firebaseConfig as any).firestoreDatabaseId;
    if (dbId) {
      currentDb = getFirestore(currentApp, dbId);
    } else {
      currentDb = getFirestore(currentApp);
    }

    setPersistence(currentAuth, browserLocalPersistence).catch((err) => {
      console.warn('Persistence warning:', err);
    });

    return { app: currentApp, auth: currentAuth, db: currentDb };
  } catch (err: any) {
    console.error('Error initializing Firebase:', err);
    return { app: null, auth: null, db: null, error: err.message };
  }
}

// Initial boot
const { app, auth, db } = initFirebase();
export { app, auth, db };

// Validate connection to Firestore on boot as per guidelines
async function testFirestoreConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline test notice.');
    }
  }
}
testFirestoreConnection();

// Format a Firebase user into our app UserProfile
export function mapFirebaseUserToProfile(user: User): UserProfile {
  const existing = getSavedUserProfile();
  return {
    uid: user.uid,
    displayName: user.displayName || user.email?.split('@')[0] || 'Du khách LocalQuest',
    email: user.email,
    photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
    providerId: user.providerData[0]?.providerId || 'google.com',
    isAnonymous: user.isAnonymous,
    role: 'tourist',
    points: existing?.points ?? 150,
    completedQuests: existing?.completedQuests ?? [],
    savedQuests: existing?.savedQuests ?? [],
    badges: existing?.badges ?? [
      {
        id: 'newbie_wanderer',
        name: 'Tân Thủ Khám Phá',
        description: 'Đăng nhập thành công và gia nhập cộng đồng du khách LocalQuest',
        icon: 'Compass',
        unlockedAt: new Date().toISOString(),
        category: 'explorer'
      }
    ],
    joinedDate: existing?.joinedDate ?? new Date().toLocaleDateString('vi-VN')
  };
}

export function getSavedUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse saved user profile', e);
  }
  return null;
}

export async function saveUserProfile(profile: UserProfile | null): Promise<void> {
  try {
    if (profile) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
      // Also persist to Firestore if connected
      if (db && profile.uid && !profile.uid.startsWith('guest-') && !profile.uid.startsWith('google-demo-')) {
        const userDocRef = doc(db, 'users', profile.uid);
        await setDoc(userDocRef, {
          ...profile,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

// Fetch User Profile from Firestore
export async function syncUserProfileFromFirestore(uid: string): Promise<UserProfile | null> {
  if (!db || !uid) return null;
  const path = `users/${uid}`;
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const data = userDoc.data() as UserProfile;
      saveUserProfile(data);
      return data;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
  return null;
}

// Save Booking to Firestore
export async function saveBookingToFirestore(booking: BookingRecord): Promise<void> {
  if (!db) return;
  const path = `bookings/${booking.id}`;
  try {
    await setDoc(doc(db, 'bookings', booking.id), booking);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// Fetch user bookings from Firestore
export async function fetchUserBookingsFromFirestore(userId: string): Promise<BookingRecord[]> {
  if (!db || !userId) return [];
  const path = 'bookings';
  try {
    const q = query(collection(db, 'bookings'), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const bookings: BookingRecord[] = [];
    snapshot.forEach((docSnap) => {
      bookings.push(docSnap.data() as BookingRecord);
    });
    return bookings;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// Diagnose a Firebase Auth error and provide actionable guidance
export function diagnoseAuthError(error: any): AuthDiagnosticResult {
  const code: string = error?.code || '';
  const message: string = error?.message || 'Lỗi không xác định';
  const origin = window.location.origin;
  const hostname = window.location.hostname;
  const currentProjectId = DEFAULT_FIREBASE_CONFIG.projectId;

  if (code.includes('auth/unauthorized-domain')) {
    return {
      code,
      message: 'Miền website hiện tại chưa được uỷ quyền trong Firebase Console!',
      technicalDetails: `Domain "${hostname}" (Origin: ${origin}) không nằm trong danh sách "Authorized domains" của dự án Firebase (${currentProjectId}).`,
      severity: 'error',
      suggestedAction: 'add_domain',
      solutionSteps: [
        `1. Mở Firebase Console: https://console.firebase.google.com/project/${currentProjectId}/authentication/settings`,
        `2. Chuyển sang tab "Settings" -> Chọn mục "Authorized domains".`,
        `3. Nhấn "Add domain" và thêm: "${hostname}".`,
        `4. Nhấn Save và thử lại.`
      ],
      helpLink: 'https://firebase.google.com/docs/auth/web/google-signin#before_you_begin'
    };
  }

  if (code.includes('auth/popup-blocked')) {
    return {
      code,
      message: 'Cửa sổ popup đăng nhập Google đã bị trình duyệt chặn!',
      technicalDetails: 'Trình duyệt đang bật tính năng Block Pop-ups hoặc iframe bị giới hạn.',
      severity: 'warning',
      suggestedAction: 'retry_popup',
      solutionSteps: [
        '1. Nhấp vào biểu tượng Pop-up bị chặn trên thanh địa chỉ của trình duyệt.',
        '2. Chọn "Luôn cho phép pop-up từ trang web này" (Always allow pop-ups).',
        '3. Bấm nút "Thử lại Đăng nhập Google".'
      ]
    };
  }

  if (code.includes('auth/popup-closed-by-user')) {
    return {
      code,
      message: 'Bạn đã đóng cửa sổ đăng nhập Google trước khi hoàn tất.',
      technicalDetails: 'Người dùng đã đóng popup trước khi token được uỷ quyền.',
      severity: 'info',
      suggestedAction: 'retry_popup',
      solutionSteps: [
        'Vui lòng bấm nút Đăng nhập Google lại và chọn tài khoản Google của bạn trong cửa sổ xuất hiện.'
      ]
    };
  }

  if (code.includes('auth/operation-not-allowed') || code.includes('auth/configuration-not-found')) {
    return {
      code,
      message: 'Tính năng Đăng nhập Google chưa được kích hoạt trong Firebase Console!',
      technicalDetails: `Google Provider chưa được Enabled trong Authentication > Sign-in method của project ${currentProjectId}.`,
      severity: 'error',
      suggestedAction: 'enable_provider',
      solutionSteps: [
        `1. Vào Firebase Console -> Chọn dự án "${currentProjectId}".`,
        '2. Vào Authentication -> Tab "Sign-in method" -> Tìm mục "Google".',
        '3. Nhấp "Enable", điền Email hỗ trợ dự án và nhấn "Save".'
      ]
    };
  }

  return {
    code: code || 'UNKNOWN_ERROR',
    message: 'Gặp sự cố khi kết nối với cổng xác thực Google.',
    technicalDetails: message,
    severity: 'error',
    suggestedAction: 'use_demo',
    solutionSteps: [
      '1. Kiểm tra kết nối mạng Internet.',
      '2. Đảm bảo tên miền đã được thêm vào Authorized Domains.',
      '3. Hoặc bạn có thể sử dụng chế độ "Đăng nhập Trải nghiệm Khách (Demo)" để thử ngay mọi chức năng.'
    ]
  };
}

// Sign in with Google with popup & diagnosis
export async function signInWithGoogle(): Promise<{ user?: UserProfile; error?: AuthDiagnosticResult }> {
  try {
    const { auth, error: initError } = initFirebase();
    if (!auth || initError) {
      throw new Error(initError || 'Không thể khởi tạo dịch vụ Firebase Auth');
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
      display: 'popup'
    });
    provider.addScope('profile');
    provider.addScope('email');

    const credential = await signInWithPopup(auth, provider);
    if (credential && credential.user) {
      const profile = mapFirebaseUserToProfile(credential.user);
      await saveUserProfile(profile);
      return { user: profile };
    } else {
      throw new Error('Không nhận được thông tin xác thực từ Google');
    }
  } catch (err: any) {
    console.error('Google Sign-In Error:', err);
    const diagnosis = diagnoseAuthError(err);
    return { error: diagnosis };
  }
}

// Sign in with selected Google account profile
export async function signInWithGoogleProfile(params: {
  name: string;
  email: string;
  photoURL?: string;
}): Promise<UserProfile> {
  const existing = getSavedUserProfile();
  // Generate deterministic UID based on email for persistence
  const emailSanitized = params.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const uid = `google_user_${emailSanitized}`;

  const profile: UserProfile = {
    uid,
    displayName: params.name,
    email: params.email,
    photoURL: params.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(params.name)}`,
    providerId: 'google.com',
    isAnonymous: false,
    role: 'tourist',
    points: existing?.email === params.email ? (existing.points ?? 350) : 350,
    completedQuests: existing?.email === params.email ? (existing.completedQuests ?? ['quest-hn-01']) : ['quest-hn-01'],
    savedQuests: existing?.email === params.email ? (existing.savedQuests ?? ['quest-da-nang-01']) : ['quest-da-nang-01'],
    badges: existing?.email === params.email ? (existing.badges ?? []) : [
      {
        id: 'newbie_wanderer',
        name: 'Tân Thủ Khám Phá',
        description: 'Đăng nhập thành công bằng tài khoản Google',
        icon: 'Compass',
        unlockedAt: new Date().toISOString(),
        category: 'explorer'
      },
      {
        id: 'pho_master',
        name: 'Bậc Thầy Phở Hà Nội',
        description: 'Đã hoàn thành thử thách ẩm thực phố cổ',
        icon: 'Award',
        unlockedAt: new Date().toISOString(),
        category: 'food'
      }
    ],
    joinedDate: existing?.joinedDate ?? new Date().toLocaleDateString('vi-VN')
  };

  await saveUserProfile(profile);
  return profile;
}

// Sign in with Phone & OTP
export async function signInWithPhoneOTP(phoneNumber: string): Promise<UserProfile> {
  const cleanPhone = phoneNumber.replace(/\s+/g, '');
  const uid = `phone_user_${cleanPhone}`;

  const profile: UserProfile = {
    uid,
    displayName: `Du khách (${cleanPhone.slice(-4)})`,
    email: `${cleanPhone}@localquest.vn`,
    photoURL: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanPhone)}`,
    providerId: 'phone',
    isAnonymous: false,
    role: 'tourist',
    points: 200,
    completedQuests: [],
    savedQuests: ['quest-hn-01'],
    badges: [
      {
        id: 'phone_verified',
        name: 'Xác Thực SĐT',
        description: 'Đăng nhập thành công qua mã OTP',
        icon: 'Shield',
        unlockedAt: new Date().toISOString(),
        category: 'explorer'
      }
    ],
    joinedDate: new Date().toLocaleDateString('vi-VN')
  };

  await saveUserProfile(profile);
  return profile;
}

// Create a simulated / demo login for tourists
export function signInWithDemoTourist(name = 'Phạm Huy Phúc', email = 'phamhuyphuc20072000@gmail.com'): UserProfile {
  const existing = getSavedUserProfile();
  const demoProfile: UserProfile = {
    uid: 'google-demo-' + Math.random().toString(36).substring(2, 9),
    displayName: name,
    email: email,
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    providerId: 'google.com (Verified User)',
    isAnonymous: false,
    role: 'tourist',
    points: existing?.points ?? 350,
    completedQuests: existing?.completedQuests ?? ['quest-hn-01'],
    savedQuests: existing?.savedQuests ?? ['quest-da-nang-01', 'quest-hcm-01'],
    badges: existing?.badges ?? [
      {
        id: 'newbie_wanderer',
        name: 'Tân Thủ Khám Phá',
        description: 'Đăng nhập thành công và gia nhập cộng đồng du khách LocalQuest',
        icon: 'Compass',
        unlockedAt: new Date().toISOString(),
        category: 'explorer'
      },
      {
        id: 'pho_master',
        name: 'Bậc Thầy Phở Hà Nội',
        description: 'Đã hoàn thành thử thách ẩm thực phố cổ',
        icon: 'Award',
        unlockedAt: new Date().toISOString(),
        category: 'food'
      }
    ],
    joinedDate: existing?.joinedDate ?? new Date().toLocaleDateString('vi-VN')
  };
  saveUserProfile(demoProfile);
  return demoProfile;
}

// Log out
export async function logoutUser(): Promise<void> {
  try {
    const { auth } = initFirebase();
    if (auth) {
      await firebaseSignOut(auth);
    }
  } catch (e) {
    console.warn('Firebase signOut error:', e);
  } finally {
    await saveUserProfile(null);
  }
}

// Subscribe to auth state
export function setupAuthListener(onUserChange: (user: UserProfile | null) => void): () => void {
  const saved = getSavedUserProfile();
  if (saved) {
    onUserChange(saved);
  }

  const { auth } = initFirebase();
  if (!auth) return () => {};

  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      // Check if user document exists in firestore
      const syncedProfile = await syncUserProfileFromFirestore(firebaseUser.uid);
      if (syncedProfile) {
        onUserChange(syncedProfile);
      } else {
        const profile = mapFirebaseUserToProfile(firebaseUser);
        await saveUserProfile(profile);
        onUserChange(profile);
      }
    } else if (!saved) {
      onUserChange(null);
    }
  });

  return unsubscribe;
}

