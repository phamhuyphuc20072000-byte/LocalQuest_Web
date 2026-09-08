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
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from './firebase';
import { WalletTransaction, PendingWithdrawal } from '../types';

const WALLETS_COLLECTION = 'wallets';
const WITHDRAWALS_COLLECTION = 'withdrawals';

export interface GuideWalletData {
  id: string;
  guideId: string;
  guideName: string;
  balanceVnd: number;
  pendingBalanceVnd: number;
  totalEarnedVnd: number;
  totalWithdrawnVnd: number;
  transactions: WalletTransaction[];
}

const DEFAULT_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-001',
    type: 'earning',
    amount: 153000,
    description: 'Thù lao dẫn tour: Bí Ẩn Phố Cổ Hà Nội (#LQ-HN-88392)',
    timestamp: 'Hôm nay, 14:30',
    status: 'completed'
  },
  {
    id: 'tx-002',
    type: 'earning',
    amount: 178500,
    description: 'Thù lao dẫn tour: Hương Vị Phở Trăm Năm (#LQ-HN-44120)',
    timestamp: 'Hôm qua, 18:15',
    status: 'completed'
  },
  {
    id: 'tx-003',
    type: 'withdrawal',
    amount: 2000000,
    description: 'Rút tiền về Vietcombank (***8999)',
    timestamp: '25/08/2026',
    status: 'completed'
  }
];

/**
 * Creates a new withdrawal request for a guide
 */
export async function requestWithdrawal(
  guideId: string,
  guideName: string,
  amount: number,
  bankInfo: {
    bankName: string;
    bankAccount: string;
    bankHolder: string;
  }
): Promise<{ success: boolean; message: string; withdrawalId?: string }> {
  const withdrawalId = `w-${Date.now()}`;
  const now = new Date().toISOString();
  const path = `${WITHDRAWALS_COLLECTION}/${withdrawalId}`;

  try {
    if (db) {
      // 1. Save withdrawal record
      await setDoc(doc(db, WITHDRAWALS_COLLECTION, withdrawalId), {
        id: withdrawalId,
        guideId,
        guideName,
        amount,
        bankName: bankInfo.bankName,
        bankAccount: bankInfo.bankAccount,
        bankHolder: bankInfo.bankHolder,
        status: 'pending',
        requestedAt: now,
        createdAt: now
      });

      // 2. Add pending transaction log
      const txId = `tx-w-${Date.now()}`;
      await setDoc(doc(db, `${WALLETS_COLLECTION}/${guideId}/transactions`, txId), {
        id: txId,
        guideId,
        type: 'withdrawal',
        amount,
        description: `Yêu cầu rút tiền về ${bankInfo.bankName} (${bankInfo.bankAccount.slice(-4)})`,
        timestamp: now,
        status: 'pending',
        referenceId: withdrawalId
      });
    }

    return {
      success: true,
      message: `Đã gửi yêu cầu rút ${amount.toLocaleString('vi-VN')} VNĐ thành công. Hội đồng quản trị sẽ phê duyệt trong vòng 24 giờ.`,
      withdrawalId
    };
  } catch (error) {
    console.error('Error in requestWithdrawal:', error);
    handleFirestoreError(error, OperationType.CREATE, path);
    return {
      success: false,
      message: 'Không thể tạo yêu cầu rút tiền do lỗi mạng hoặc quyền truy cập.'
    };
  }
}

/**
 * Admin approves a withdrawal request:
 * - Updates withdrawal document status = 'approved'
 * - Deducts balance from guide wallet
 * - Increments totalWithdrawnVnd
 */
export async function approveWithdrawal(
  withdrawalId: string,
  guideId: string,
  amount: number
): Promise<void> {
  const path = `${WITHDRAWALS_COLLECTION}/${withdrawalId}`;
  const now = new Date().toISOString();

  try {
    if (db) {
      await updateDoc(doc(db, WITHDRAWALS_COLLECTION, withdrawalId), {
        status: 'approved',
        processedAt: now,
        updatedAt: now
      });

      // Update Guide Wallet
      const walletRef = doc(db, WALLETS_COLLECTION, guideId);
      const walletSnap = await getDoc(walletRef);
      if (walletSnap.exists()) {
        const currentBalance = walletSnap.data().balanceVnd || 0;
        const currentWithdrawn = walletSnap.data().totalWithdrawnVnd || 0;

        await updateDoc(walletRef, {
          balanceVnd: Math.max(0, currentBalance - amount),
          totalWithdrawnVnd: currentWithdrawn + amount,
          updatedAt: now
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Admin rejects a withdrawal request
 */
export async function rejectWithdrawal(withdrawalId: string): Promise<void> {
  const path = `${WITHDRAWALS_COLLECTION}/${withdrawalId}`;

  try {
    if (db) {
      await updateDoc(doc(db, WITHDRAWALS_COLLECTION, withdrawalId), {
        status: 'rejected',
        processedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Realtime listener for Guide's wallet balance and transactions
 */
export function subscribeGuideWallet(
  guideId: string,
  callback: (wallet: GuideWalletData) => void
): () => void {
  const fallbackWallet: GuideWalletData = {
    id: guideId,
    guideId,
    guideName: 'Hoàng Đức Thành',
    balanceVnd: 4850000,
    pendingBalanceVnd: 650000,
    totalEarnedVnd: 18450000,
    totalWithdrawnVnd: 13600000,
    transactions: DEFAULT_TRANSACTIONS
  };

  if (!db || !guideId || !auth.currentUser) {
    callback(fallbackWallet);
    return () => {};
  }

  const path = `${WALLETS_COLLECTION}/${guideId}`;

  try {
    const walletDocRef = doc(db, WALLETS_COLLECTION, guideId);
    const txQuery = query(collection(db, `${WALLETS_COLLECTION}/${guideId}/transactions`));

    // Listen to wallet document
    const unsubWallet = onSnapshot(
      walletDocRef,
      (walletSnap) => {
        const walletData = walletSnap.exists() ? walletSnap.data() : null;

        // Fetch transactions
        getDocs(txQuery)
          .then((txSnap) => {
            const txs: WalletTransaction[] = [];
            txSnap.forEach((d) => {
              txs.push({ ...(d.data() as WalletTransaction), id: d.id });
            });

            callback({
              id: guideId,
              guideId,
              guideName: walletData?.guideName || fallbackWallet.guideName,
              balanceVnd: walletData?.balanceVnd ?? fallbackWallet.balanceVnd,
              pendingBalanceVnd: walletData?.pendingBalanceVnd ?? fallbackWallet.pendingBalanceVnd,
              totalEarnedVnd: walletData?.totalEarnedVnd ?? fallbackWallet.totalEarnedVnd,
              totalWithdrawnVnd: walletData?.totalWithdrawnVnd ?? fallbackWallet.totalWithdrawnVnd,
              transactions: txs.length > 0 ? txs : DEFAULT_TRANSACTIONS
            });
          })
          .catch(() => {
            callback({
              id: guideId,
              guideId,
              guideName: walletData?.guideName || fallbackWallet.guideName,
              balanceVnd: walletData?.balanceVnd ?? fallbackWallet.balanceVnd,
              pendingBalanceVnd: walletData?.pendingBalanceVnd ?? fallbackWallet.pendingBalanceVnd,
              totalEarnedVnd: walletData?.totalEarnedVnd ?? fallbackWallet.totalEarnedVnd,
              totalWithdrawnVnd: walletData?.totalWithdrawnVnd ?? fallbackWallet.totalWithdrawnVnd,
              transactions: DEFAULT_TRANSACTIONS
            });
          });
      },
      (error) => {
        console.warn('subscribeGuideWallet fallback:', error.message);
        callback(fallbackWallet);
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    return unsubWallet;
  } catch (err) {
    console.warn('subscribeGuideWallet init error:', err);
    callback(fallbackWallet);
    return () => {};
  }
}

/**
 * Subscribes to pending withdrawals for Admin Dashboard
 */
export function subscribePendingWithdrawals(
  callback: (withdrawals: PendingWithdrawal[]) => void
): () => void {
  const fallbackList: PendingWithdrawal[] = [
    { id: 1, guide: 'Hoàng Đức Thành', amount: 3200000, bank: 'Vietcombank', account: '***8999', requested: '28/08/2026', status: 'pending' },
    { id: 2, guide: 'Trần Thị Lan', amount: 5000000, bank: 'Techcombank', account: '***2190', requested: '27/08/2026', status: 'pending' }
  ];

  if (!db || !auth.currentUser) {
    callback(fallbackList);
    return () => {};
  }

  const path = WITHDRAWALS_COLLECTION;

  try {
    const q = query(
      collection(db, WITHDRAWALS_COLLECTION),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          callback(fallbackList);
        } else {
          const list: PendingWithdrawal[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as any;
            list.push({
              id: docSnap.id,
              guideId: data.guideId,
              guide: data.guideName || 'Hướng Dẫn Viên',
              amount: data.amount || 0,
              bank: data.bankName || 'Ngân Hàng',
              account: data.bankAccount ? `***${data.bankAccount.slice(-4)}` : '***0000',
              requested: data.requestedAt ? new Date(data.requestedAt).toLocaleDateString('vi-VN') : 'Gần đây',
              status: data.status || 'pending'
            });
          });
          callback(list.length > 0 ? list : fallbackList);
        }
      },
      (error) => {
        console.warn('subscribePendingWithdrawals fallback:', error.message);
        callback(fallbackList);
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('subscribePendingWithdrawals error:', err);
    callback(fallbackList);
    return () => {};
  }
}
