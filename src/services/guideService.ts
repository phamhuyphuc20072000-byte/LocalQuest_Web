import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from './firebase';
import { GuideProfile } from '../types';

const GUIDES_COLLECTION = 'guides';
const WALLETS_COLLECTION = 'wallets';

const INITIAL_DEMO_GUIDES: GuideProfile[] = [
  {
    id: 'guide-001',
    fullName: 'Hoàng Đức Thành',
    email: 'thanh.hoang@localquest.vn',
    phone: '0912 345 678',
    city: 'Hà Nội',
    bio: 'Nghệ nhân gốm sứ Bát Tràng và hướng dẫn viên văn hoá Phố Cổ 10 năm kinh nghiệm.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 4.95,
    totalQuests: 12,
    totalTourists: 480,
    balanceVnd: 4850000,
    pendingBalanceVnd: 650000,
    bankName: 'Vietcombank',
    bankAccount: '001100438999',
    bankHolder: 'HOANG DUC THANH',
    status: 'verified',
    submittedDate: '26/08/2026',
    specialties: ['Gốm Bát Tràng', 'Phố Cổ', 'Ẩm Thực Thăng Long']
  },
  {
    id: 'guide-002',
    fullName: 'Vũ Thị Mai Anh',
    email: 'maianh.vu@localquest.vn',
    phone: '0987 654 321',
    city: 'Đà Nẵng',
    bio: 'Thổ địa Sơn Trà, chuyên dẫn tour di sản ẩm thực và khảo cứu lịch sử Champa.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 4.88,
    totalQuests: 8,
    totalTourists: 290,
    balanceVnd: 3200000,
    pendingBalanceVnd: 0,
    bankName: 'Techcombank',
    bankAccount: '190345678912',
    bankHolder: 'VU THI MAI ANH',
    status: 'pending',
    submittedDate: '27/08/2026',
    specialties: ['Di Sản Champa', 'Ẩm Thực Miền Trung', 'Sinh Thái Sơn Trà']
  },
  {
    id: 'guide-003',
    fullName: 'Đinh Công Sơn',
    email: 'congson.dinh@localquest.vn',
    phone: '0901 234 567',
    city: 'TP. Hồ Chí Minh',
    bio: 'Nhiếp ảnh gia và chuyên gia khảo sát kiến trúc biệt thự Pháp cổ Sài Gòn & Chợ Lớn.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: 4.92,
    totalQuests: 15,
    totalTourists: 620,
    balanceVnd: 7400000,
    pendingBalanceVnd: 1200000,
    bankName: 'MBBank',
    bankAccount: '090123456789',
    bankHolder: 'DINH CONG SON',
    status: 'pending',
    submittedDate: '28/08/2026',
    specialties: ['Kiến Trúc Pháp Cổ', 'Văn Hoá Chợ Lớn', 'Nhiếp Ảnh Di Sản']
  }
];

/**
 * Registers a new Local Guide application with status = 'pending'
 */
export async function registerGuide(profile: Partial<GuideProfile>): Promise<GuideProfile> {
  const guideId = profile.id || `guide-${Date.now()}`;
  const now = new Date().toISOString();

  const completeProfile: GuideProfile = {
    id: guideId,
    uid: profile.uid,
    fullName: profile.fullName || 'Nghệ Nhân Địa Phương',
    email: profile.email || 'guide@localquest.vn',
    phone: profile.phone || '0900 000 000',
    city: profile.city || 'Hà Nội',
    bio: profile.bio || 'Người gìn giữ văn hoá và kể chuyện di sản bản địa.',
    avatarUrl: profile.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5.0,
    totalQuests: 0,
    totalTourists: 0,
    balanceVnd: 0,
    pendingBalanceVnd: 0,
    bankName: profile.bankName || 'Vietcombank',
    bankAccount: profile.bankAccount || '',
    bankHolder: profile.bankHolder || (profile.fullName || '').toUpperCase(),
    status: 'pending',
    submittedDate: new Date().toLocaleDateString('vi-VN'),
    specialties: profile.specialties || ['Di sản Bản địa']
  };

  const path = `${GUIDES_COLLECTION}/${guideId}`;

  try {
    if (db) {
      await setDoc(doc(db, GUIDES_COLLECTION, guideId), {
        ...completeProfile,
        createdAt: now,
        updatedAt: now
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }

  return completeProfile;
}

/**
 * Subscribes to pending guide applications for Admin Dashboard
 */
export function subscribePendingGuides(callback: (guides: GuideProfile[]) => void): () => void {
  if (!db) {
    callback(INITIAL_DEMO_GUIDES.filter((g) => g.status === 'pending'));
    return () => {};
  }

  const path = GUIDES_COLLECTION;

  try {
    const q = query(
      collection(db, GUIDES_COLLECTION),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          callback(INITIAL_DEMO_GUIDES.filter((g) => g.status === 'pending'));
        } else {
          const guides: GuideProfile[] = [];
          snapshot.forEach((docSnap) => {
            guides.push({ ...(docSnap.data() as GuideProfile), id: docSnap.id });
          });
          callback(guides);
        }
      },
      (error) => {
        console.warn('subscribePendingGuides fallback:', error.message);
        callback(INITIAL_DEMO_GUIDES.filter((g) => g.status === 'pending'));
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('subscribePendingGuides init error:', err);
    callback(INITIAL_DEMO_GUIDES.filter((g) => g.status === 'pending'));
    return () => {};
  }
}

/**
 * Subscribes to approved guides
 */
export function subscribeApprovedGuides(callback: (guides: GuideProfile[]) => void): () => void {
  if (!db) {
    callback(INITIAL_DEMO_GUIDES.filter((g) => g.status === 'verified' || g.status === 'approved'));
    return () => {};
  }

  const path = GUIDES_COLLECTION;

  try {
    const q = query(collection(db, GUIDES_COLLECTION));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          callback(INITIAL_DEMO_GUIDES);
        } else {
          const guides: GuideProfile[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as GuideProfile;
            if (data.status === 'verified' || (data.status as any) === 'approved') {
              guides.push({ ...data, id: docSnap.id });
            }
          });
          callback(guides.length > 0 ? guides : INITIAL_DEMO_GUIDES);
        }
      },
      (error) => {
        console.warn('subscribeApprovedGuides error:', error.message);
        callback(INITIAL_DEMO_GUIDES);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('subscribeApprovedGuides error:', err);
    callback(INITIAL_DEMO_GUIDES);
    return () => {};
  }
}

/**
 * Admin approves a guide application:
 * - Updates status = 'verified'
 * - Initializes guide wallet in `/wallets/{guideId}` if not exists
 */
export async function approveGuide(guideId: string): Promise<void> {
  const path = `${GUIDES_COLLECTION}/${guideId}`;
  const now = new Date().toISOString();

  try {
    if (db) {
      await updateDoc(doc(db, GUIDES_COLLECTION, guideId), {
        status: 'verified',
        updatedAt: now
      });

      // Ensure wallet document exists
      const walletRef = doc(db, WALLETS_COLLECTION, guideId);
      const walletSnap = await getDoc(walletRef);
      if (!walletSnap.exists()) {
        await setDoc(walletRef, {
          id: guideId,
          guideId,
          balanceVnd: 0,
          pendingBalanceVnd: 0,
          totalEarnedVnd: 0,
          totalWithdrawnVnd: 0,
          updatedAt: now
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Admin rejects a guide application
 */
export async function rejectGuide(guideId: string, reason?: string): Promise<void> {
  const path = `${GUIDES_COLLECTION}/${guideId}`;

  try {
    if (db) {
      await updateDoc(doc(db, GUIDES_COLLECTION, guideId), {
        status: 'rejected',
        rejectReason: reason || 'Hồ sơ chưa đạt tiêu chuẩn kiểm duyệt di sản',
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
