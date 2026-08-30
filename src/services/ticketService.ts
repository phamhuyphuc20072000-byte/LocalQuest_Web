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
import { Ticket, UserProfile } from '../types';

const TICKETS_COLLECTION = 'tickets';
const USERS_COLLECTION = 'users';
const WALLETS_COLLECTION = 'wallets';

export interface QrCheckInResult {
  success: boolean;
  message: string;
  ticket?: Ticket;
  touristRewards?: {
    coins: number;
    exp: number;
    totalPoints?: number;
  };
  guideEarnings?: number;
}

/**
 * Books a new tour ticket and saves it to Firestore `/tickets/{ticketId}`
 */
export async function bookTicket(ticketPayload: {
  questId: number | string;
  questName: string;
  city: string;
  theme: string;
  price: number;
  touristsCount: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerId?: string;
  guideId?: string;
  playDate?: string;
}): Promise<Ticket> {
  const timestamp = Date.now();
  const ticketId = `tkt-${timestamp}`;
  const cityCode = (ticketPayload.city || 'LQ').slice(0, 2).toUpperCase();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const ticketCode = `LQ-${cityCode}-${randomSuffix}`;
  const qrPayload = `LQ-TICKET-${ticketId}`;
  const now = new Date().toISOString();

  const newTicket: Ticket = {
    id: ticketId,
    ticketCode,
    questId: ticketPayload.questId,
    questName: ticketPayload.questName,
    city: ticketPayload.city,
    theme: ticketPayload.theme,
    price: ticketPayload.price,
    purchaseDate: new Date().toLocaleDateString('vi-VN'),
    playDate: ticketPayload.playDate || new Date().toLocaleDateString('vi-VN'),
    touristsCount: ticketPayload.touristsCount || 1,
    buyerName: ticketPayload.buyerName,
    buyerEmail: ticketPayload.buyerEmail,
    buyerPhone: ticketPayload.buyerPhone,
    status: 'valid',
    currentWaypointIndex: 0,
    score: 0,
    qrPayload
  };

  const path = `${TICKETS_COLLECTION}/${ticketId}`;

  try {
    if (db) {
      await setDoc(doc(db, TICKETS_COLLECTION, ticketId), {
        ...newTicket,
        buyerId: ticketPayload.buyerId || 'guest-tourist',
        guideId: ticketPayload.guideId || 'guide-default',
        createdAt: now,
        updatedAt: now
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }

  return newTicket;
}

/**
 * Subscribes to user tickets in real-time.
 * Invokes callback whenever tickets change, and flags freshly checked-in tickets for celebrations.
 */
export function subscribeUserTickets(
  userId: string,
  callback: (tickets: Ticket[], lastCompletedTicketId?: string) => void
): () => void {
  if (!db || !userId) {
    return () => {};
  }

  const path = TICKETS_COLLECTION;

  try {
    const q = query(
      collection(db, TICKETS_COLLECTION),
      where('buyerId', '==', userId)
    );

    let previousTicketStatuses: Record<string, string> = {};

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tickets: Ticket[] = [];
        let justCompletedId: string | undefined = undefined;

        snapshot.forEach((docSnap) => {
          const t = docSnap.data() as Ticket;
          const currentStatus = t.status;
          const prevStatus = previousTicketStatuses[t.id];

          if (
            prevStatus &&
            prevStatus !== 'used' &&
            prevStatus !== 'completed' &&
            (currentStatus === 'used' || currentStatus === 'completed')
          ) {
            justCompletedId = t.id;
          }

          previousTicketStatuses[t.id] = currentStatus;
          tickets.push({ ...t, id: docSnap.id });
        });

        callback(tickets, justCompletedId);
      },
      (error) => {
        console.warn('Firestore subscribeUserTickets error:', error.message);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('subscribeUserTickets failed initialization:', err);
    return () => {};
  }
}

/**
 * Subscribes to all tickets in real-time for Admin Portal and Ticket Redemption Engine
 */
export function subscribeAllTicketsLive(
  callback: (tickets: Ticket[]) => void
): () => void {
  const fallbackTickets: Ticket[] = [
    {
      id: 'tkt-001',
      ticketCode: 'LQ-HN-88392',
      questId: 1,
      questName: 'Bí Ẩn Phố Cổ Hà Nội',
      city: 'Hà Nội',
      theme: 'Bí ẩn',
      price: 180000,
      purchaseDate: '28/08/2026',
      playDate: '29/08/2026',
      touristsCount: 2,
      buyerName: 'Nhà Thám Hiểm Di Sản',
      buyerEmail: 'explorer@localquest.vn',
      buyerPhone: '0988 123 456',
      status: 'valid',
      currentWaypointIndex: 0,
      score: 0,
      qrPayload: 'LQ-TICKET-tkt-001'
    },
    {
      id: 'tkt-002',
      ticketCode: 'LQ-SG-44120',
      questId: 2,
      questName: 'Hương Vị Phở Trăm Năm',
      city: 'Hà Nội',
      theme: 'Ẩm thực',
      price: 150000,
      purchaseDate: '27/08/2026',
      playDate: '28/08/2026',
      touristsCount: 1,
      buyerName: 'Nguyễn Văn An',
      buyerEmail: 'an.nguyen@gmail.com',
      buyerPhone: '0912 888 999',
      status: 'completed',
      currentWaypointIndex: 6,
      score: 120,
      qrPayload: 'LQ-TICKET-tkt-002'
    },
    {
      id: 'tkt-003',
      ticketCode: 'LQ-HA-19284',
      questId: 3,
      questName: 'Huyền Tích Phố Đèn Lồng',
      city: 'Hội An',
      theme: 'Đêm',
      price: 180000,
      purchaseDate: '29/08/2026',
      playDate: '29/08/2026',
      touristsCount: 3,
      buyerName: 'Trần Minh Tuấn',
      buyerEmail: 'tuan.tran@gmail.com',
      buyerPhone: '0933 456 789',
      status: 'valid',
      currentWaypointIndex: 0,
      score: 0,
      qrPayload: 'LQ-TICKET-tkt-003'
    }
  ];

  if (!db) {
    callback(fallbackTickets);
    return () => {};
  }

  const path = TICKETS_COLLECTION;

  try {
    const q = query(collection(db, TICKETS_COLLECTION));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          callback(fallbackTickets);
        } else {
          const tickets: Ticket[] = [];
          snapshot.forEach((docSnap) => {
            tickets.push({ ...(docSnap.data() as Ticket), id: docSnap.id });
          });
          callback(tickets.length > 0 ? tickets : fallbackTickets);
        }
      },
      (error) => {
        console.warn('Firestore subscribeAllTicketsLive error:', error.message);
        callback(fallbackTickets);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('subscribeAllTicketsLive failed initialization:', err);
    callback(fallbackTickets);
    return () => {};
  }
}

/**
 * Handles the QR code check-in process when a Local Guide scans a tourist's ticket pass:
 * 1. Validates and marks ticket status = 'completed' / 'used'
 * 2. Credits 85% of ticket price to the Guide's Wallet & creates a WalletTransaction
 * 3. Awards +100 LocalCoins/points and +50 EXP to the Tourist's Profile
 */
export async function processQrCheckIn(
  qrPayload: string,
  guideId = 'guide-001',
  guideName = 'Nghệ Nhân Hướng Dẫn'
): Promise<QrCheckInResult> {
  if (!qrPayload) {
    return { success: false, message: 'Mã QR không hợp lệ hoặc rỗng.' };
  }

  // Extract ticketId from formats like "LQ-TICKET-tkt-12345" or "LOCALQUEST://TICKET/..."
  let ticketId = '';
  if (qrPayload.startsWith('LQ-TICKET-')) {
    ticketId = qrPayload.replace('LQ-TICKET-', '');
  } else if (qrPayload.includes('/TICKET/')) {
    const parts = qrPayload.split('/TICKET/')[1]?.split('/');
    ticketId = parts?.[0] || '';
  } else {
    ticketId = qrPayload.trim();
  }

  if (!ticketId) {
    return { success: false, message: 'Không trích xuất được mã vé từ QR.' };
  }

  const now = new Date().toISOString();

  try {
    if (!db) {
      // Offline fallback response
      return {
        success: true,
        message: 'Check-in thành công (Chế độ ngoại tuyến). Đã ghi nhận điểm thưởng!',
        touristRewards: { coins: 100, exp: 50 },
        guideEarnings: 150000 * 0.85
      };
    }

    // 1. Fetch ticket doc
    const ticketDocRef = doc(db, TICKETS_COLLECTION, ticketId);
    const ticketSnap = await getDoc(ticketDocRef);

    let ticketData: Ticket;
    let buyerId = 'guest-tourist';
    let ticketGuideId = guideId;

    if (ticketSnap.exists()) {
      const data = ticketSnap.data() as any;
      ticketData = { ...data, id: ticketSnap.id };
      buyerId = data.buyerId || buyerId;
      ticketGuideId = data.guideId || guideId;

      if (ticketData.status === 'used' || ticketData.status === 'completed') {
        return {
          success: false,
          message: `Vé #${ticketData.ticketCode || ticketId} đã được check-in trước đó!`,
          ticket: ticketData
        };
      }
    } else {
      // Create fallback ticket representation if scanned by code
      ticketData = {
        id: ticketId,
        ticketCode: `LQ-CHECKIN-${ticketId.slice(-5)}`,
        questId: 'quest-default',
        questName: 'Hành Trình Di Sản Khám Phá',
        city: 'Hà Nội',
        theme: 'Di sản',
        price: 180000,
        purchaseDate: new Date().toLocaleDateString('vi-VN'),
        touristsCount: 1,
        buyerName: 'Du khách Di Sản',
        buyerEmail: 'tourist@localquest.vn',
        buyerPhone: '0988 123 456',
        status: 'valid',
        qrPayload
      };
    }

    // 2. Update Ticket Status
    await setDoc(
      ticketDocRef,
      {
        ...ticketData,
        status: 'completed',
        completedAt: now,
        updatedAt: now
      },
      { merge: true }
    );

    // 3. Credit 85% to Guide Wallet & Add Transaction Record
    const guideEarnings = Math.round(Number(ticketData.price || 150000) * 0.85);
    const walletDocRef = doc(db, WALLETS_COLLECTION, ticketGuideId);
    const walletSnap = await getDoc(walletDocRef);

    const currentBalance = walletSnap.exists() ? (walletSnap.data().balanceVnd || 0) : 0;
    const currentTotalEarned = walletSnap.exists() ? (walletSnap.data().totalEarnedVnd || 0) : 0;

    await setDoc(
      walletDocRef,
      {
        id: ticketGuideId,
        guideId: ticketGuideId,
        guideName,
        balanceVnd: currentBalance + guideEarnings,
        totalEarnedVnd: currentTotalEarned + guideEarnings,
        updatedAt: now
      },
      { merge: true }
    );

    // Write wallet transaction sub-collection record
    const txId = `tx-${Date.now()}`;
    const txDocRef = doc(db, `${WALLETS_COLLECTION}/${ticketGuideId}/transactions`, txId);
    await setDoc(txDocRef, {
      id: txId,
      guideId: ticketGuideId,
      type: 'earning',
      amount: guideEarnings,
      description: `Thù lao dẫn tour: ${ticketData.questName} (#${ticketData.ticketCode || ticketId})`,
      timestamp: now,
      status: 'completed',
      referenceId: ticketId
    });

    // 4. Reward Tourist: +100 Coins, +50 EXP
    const touristRewards = { coins: 100, exp: 50, totalPoints: 0 };
    if (buyerId && !buyerId.startsWith('guest-')) {
      const userDocRef = doc(db, USERS_COLLECTION, buyerId);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data() as UserProfile;
        const currentPoints = userData.points || 0;
        const currentExp = userData.exp || 0;
        const currentCoins = userData.localCoins || 0;
        const completed = userData.completedQuests || [];

        const updatedPoints = currentPoints + 100;
        touristRewards.totalPoints = updatedPoints;

        await setDoc(
          userDocRef,
          {
            points: updatedPoints,
            exp: currentExp + 50,
            localCoins: currentCoins + 100,
            completedQuests: Array.from(new Set([...completed, ticketData.questId])),
            updatedAt: now
          },
          { merge: true }
        );
      }
    }

    return {
      success: true,
      message: `Check-in vé thành công! Hướng dẫn viên nhận +${guideEarnings.toLocaleString('vi-VN')} VNĐ (85%), Du khách nhận +100 LocalCoins & +50 EXP!`,
      ticket: { ...ticketData, status: 'completed' },
      touristRewards,
      guideEarnings
    };
  } catch (error) {
    console.error('Error in processQrCheckIn:', error);
    handleFirestoreError(error, OperationType.WRITE, `tickets/${ticketId}`);
    return {
      success: false,
      message: 'Có lỗi xảy ra khi xác thực vé và cộng thưởng.'
    };
  }
}
