import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from './firebase';
import { Quest } from '../types';
import { QUESTS as INITIAL_QUESTS } from '../data/quests';

const QUESTS_COLLECTION = 'quests';

const INITIAL_DEMO_PENDING_QUESTS: Quest[] = [
  {
    id: 'quest-pending-001',
    name: 'Bóng Ma & Bí Mật Chợ Đông Ba',
    city: 'Huế',
    theme: 'Bí ẩn',
    price: 160000,
    originalPrice: 195000,
    rating: 5.0,
    reviews: 0,
    difficulty: 'Trung bình',
    walkTime: '1.5 giờ',
    distance: '1.8 km',
    imageId: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&auto=format&fit=crop&q=80',
    teaser: 'Lần theo dấu vết những thương thuyền cổ và truyền thuyết đêm trăng tròn tại chợ Đông Ba.',
    story: 'Trải qua hơn trăm năm thăng trầm bên bờ sông Hương, chợ Đông Ba không chỉ là trung tâm giao thương sầm uất mà còn lưu giữ những bí mật chưa từng tiết lộ về hội kín buôn bán thời phong kiến.',
    guideName: 'Phạm Thị Hường',
    guideRating: 4.95,
    guideImageId: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    status: 'pending',
    isApproved: false,
    waypoints: [
      {
        id: 1,
        lat: 16.4687,
        lng: 107.5925,
        name: 'Bến Thuyền Cổ Đông Ba',
        script: 'Chào mừng bạn đến với bến thuyền cổ Đông Ba. Nơi đây từng là cửa ngõ giao thương sầm uất nhất xứ kinh kỳ vào thế kỷ 19. Hãy quan sát cột mốc đá khắc chữ Hán đầu bến.',
        question: 'Dòng sông chảy ngang trước mặt chợ Đông Ba nối vào sông Hương có tên là gì?',
        answers: ['Sông Đông Ba', 'Sông An Cựu', 'Sông Như Ý', 'Sông Hương'],
        correct: 0,
        hint: 'Tên con sông trùng với tên ngôi chợ lịch sử này.',
        photoSpotPrompt: 'Chụp lại toàn cảnh bến thuyền với góc nhìn hướng về chợ cổ.'
      },
      {
        id: 2,
        lat: 16.4695,
        lng: 107.5932,
        name: 'Lầu Chuông Chợ Cũ',
        script: 'Bước vào cổng tam quan, bạn sẽ thấy lầu chuông đồng báo hiệu giờ mở cửa chợ từ thuở vua Thành Thái. Hãy lắng nghe giai thoại về tiếng chuông cứu nguy năm 1899.',
        question: 'Ngôi chợ được vua Thành Thái cho xây dựng lại vào năm nào?',
        answers: ['1899', '1885', '1905', '1920'],
        correct: 0,
        hint: 'Năm cuối cùng của thế kỷ 19.',
        photoSpotPrompt: 'Check-in dưới chân lầu chuông cổ với ánh hoàng hôn.'
      }
    ],
    tags: ['Di sản Huế', 'Bí ẩn', 'Chợ Cổ', 'Sông Hương'],
    rewardPoints: 120
  },
  {
    id: 'quest-pending-002',
    name: 'Ký Ức Hẻm Cũ Chợ Lớn 1975',
    city: 'TP. Hồ Chí Minh',
    theme: 'Ẩm thực',
    price: 210000,
    originalPrice: 250000,
    rating: 5.0,
    reviews: 0,
    difficulty: 'Dễ',
    walkTime: '2 giờ',
    distance: '2.2 km',
    imageId: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80',
    teaser: 'Hành trình lạc bước vào những con hẻm người Hoa đậm chất điện ảnh và thưởng thức điểm tâm gia truyền.',
    story: 'Khám phá văn hoá ẩm thực Trà - Điểm tâm trăm năm tuổi của cộng đồng người Hoa tại quận 5, nơi thời gian dường như ngưng đọng qua từng góc phố lát gạch bông.',
    guideName: 'Trần Thị Lan',
    guideRating: 4.9,
    guideImageId: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    status: 'pending',
    isApproved: false,
    waypoints: [
      {
        id: 1,
        lat: 10.7538,
        lng: 106.6601,
        name: 'Hội Quán Nghĩa An (Chùa Ông)',
        script: 'Chào mừng các bạn đến Hội quán Nghĩa An, nơi thờ Quan Thánh Đế Quân với nghệ thuật điêu khắc gỗ tinh xảo bậc nhất Sài Gòn - Chợ Lớn.',
        question: 'Linh vật nào được chạm khắc canh giữ trước sân hội quán?',
        answers: ['Kỳ Lân đá mạ đồng', 'Rồng vàng', 'Hổ đá ngũ sắc', 'Phượng Hoàng'],
        correct: 0,
        hint: 'Linh vật mang lại may mắn và thái bình trong văn hoá Á Đông.',
        photoSpotPrompt: 'Chụp lại mái ngói âm dương rêu phong cổ kính.'
      }
    ],
    tags: ['Ẩm thực Chợ Lớn', 'Người Hoa', 'Nhiếp Ảnh', 'Trà Quán'],
    rewardPoints: 150
  }
];

/**
 * Realtime listener for all active / approved quests
 * Compatible with Android Room Database sync & Web clients
 */
export function getQuestsLive(callback: (quests: Quest[]) => void): () => void {
  if (!db) {
    callback(INITIAL_QUESTS);
    return () => {};
  }

  const path = QUESTS_COLLECTION;

  try {
    const q = query(collection(db, QUESTS_COLLECTION));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // If Firestore collection is empty, deliver fallback and seed initial heritage quests
          callback(INITIAL_QUESTS);
          seedInitialQuestsIfEmpty().catch(console.warn);
        } else {
          const liveQuests: Quest[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Quest & { isApproved?: boolean };
            // Include quests that are active or explicitly approved
            if (data.status === 'active' || (data.status !== 'rejected' && data.isApproved !== false)) {
              liveQuests.push({
                ...data,
                id: docSnap.id
              });
            }
          });

          if (liveQuests.length > 0) {
            callback(liveQuests);
          } else {
            callback(INITIAL_QUESTS);
          }
        }
      },
      (error) => {
        console.warn('Firestore getQuestsLive fallback to local data:', error.message);
        callback(INITIAL_QUESTS);
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('getQuestsLive initialization error:', err);
    callback(INITIAL_QUESTS);
    return () => {};
  }
}

/**
 * Subscribes to pending quests requiring Admin Review
 */
export function subscribePendingQuests(callback: (pendingQuests: Quest[]) => void): () => void {
  if (!db) {
    callback(INITIAL_DEMO_PENDING_QUESTS);
    return () => {};
  }

  const path = QUESTS_COLLECTION;

  try {
    const q = query(
      collection(db, QUESTS_COLLECTION),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          callback(INITIAL_DEMO_PENDING_QUESTS);
        } else {
          const pQuests: Quest[] = [];
          snapshot.forEach((docSnap) => {
            pQuests.push({ ...(docSnap.data() as Quest), id: docSnap.id });
          });
          callback(pQuests.length > 0 ? pQuests : INITIAL_DEMO_PENDING_QUESTS);
        }
      },
      (error) => {
        console.warn('subscribePendingQuests fallback:', error.message);
        callback(INITIAL_DEMO_PENDING_QUESTS);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('subscribePendingQuests init error:', err);
    callback(INITIAL_DEMO_PENDING_QUESTS);
    return () => {};
  }
}

/**
 * Creates a new Quest submitted by a Local Guide
 * Default status: 'pending' (isApproved = false)
 */
export async function createQuest(questData: Partial<Quest>): Promise<Quest> {
  const questId = questData.id ? String(questData.id) : `quest-${Date.now()}`;
  const now = new Date().toISOString();

  const completeQuest: Quest = {
    id: questId,
    name: questData.name || 'Hành Trình Di Sản Mới',
    city: questData.city || 'Hà Nội',
    theme: (questData.theme as any) || 'Di sản',
    price: Number(questData.price) || 150000,
    originalPrice: Number(questData.originalPrice) || (Number(questData.price) ? Number(questData.price) * 1.2 : 180000),
    rating: questData.rating || 5.0,
    reviews: questData.reviews || 0,
    difficulty: questData.difficulty || 'Trung bình',
    walkTime: questData.walkTime || '1.5 - 2 giờ',
    distance: questData.distance || '2.0 km',
    imageId: questData.imageId || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80',
    teaser: questData.teaser || 'Khám phá những câu chuyện văn hoá chưa từng kể.',
    story: questData.story || 'Hành trình đặc sắc dẫn dắt bạn qua những ngóc ngách di sản nghìn năm tuổi.',
    guideName: questData.guideName || 'Nghệ Nhân Địa Phương',
    guideRating: questData.guideRating || 4.9,
    guideImageId: questData.guideImageId || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    waypoints: questData.waypoints || [],
    tags: questData.tags || ['Di sản', 'Bản địa', 'Khám phá'],
    featured: questData.featured || false,
    rewardPoints: questData.rewardPoints || 100,
    status: 'pending'
  };

  const path = `${QUESTS_COLLECTION}/${questId}`;

  try {
    if (db) {
      await setDoc(doc(db, QUESTS_COLLECTION, questId), {
        ...completeQuest,
        isApproved: false,
        createdAt: now,
        updatedAt: now
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }

  return completeQuest;
}

/**
 * Approves a pending quest (Admin role)
 */
export async function approveQuest(questId: string | number): Promise<void> {
  const qId = String(questId);
  const path = `${QUESTS_COLLECTION}/${qId}`;

  try {
    if (db) {
      await updateDoc(doc(db, QUESTS_COLLECTION, qId), {
        status: 'active',
        isApproved: true,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Rejects a pending quest (Admin role)
 */
export async function rejectQuest(questId: string | number): Promise<void> {
  const qId = String(questId);
  const path = `${QUESTS_COLLECTION}/${qId}`;

  try {
    if (db) {
      await updateDoc(doc(db, QUESTS_COLLECTION, qId), {
        status: 'rejected',
        isApproved: false,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Seeds default heritage quests to Firestore if collection is empty
 */
export async function seedInitialQuestsIfEmpty(): Promise<void> {
  if (!db) return;
  try {
    const snap = await getDocs(collection(db, QUESTS_COLLECTION));
    if (snap.empty) {
      for (const quest of INITIAL_QUESTS) {
        const questId = String(quest.id);
        await setDoc(doc(db, QUESTS_COLLECTION, questId), {
          ...quest,
          id: questId,
          isApproved: true,
          status: 'active',
          createdAt: new Date().toISOString()
        });
      }
    }
  } catch (e) {
    console.warn('Seed initial quests skipped or failed:', e);
  }
}
