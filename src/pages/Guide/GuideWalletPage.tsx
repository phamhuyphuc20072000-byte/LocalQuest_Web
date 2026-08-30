import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Wallet, 
  DollarSign, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  CreditCard,
  Sparkles,
  TrendingUp,
  Landmark
} from 'lucide-react';
import { useQuest } from '../../context/QuestContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../data/quests';
import { subscribeGuideWallet, requestWithdrawal, GuideWalletData } from '../../services/walletService';

export function GuideWalletPage() {
  const { setActivePage } = useQuest();
  const { userProfile } = useAuth();

  const guideId = userProfile?.uid || 'guide-001';
  const guideName = userProfile?.displayName || 'Hoàng Đức Thành';

  const [walletData, setWalletData] = useState<GuideWalletData>({
    id: guideId,
    guideId,
    guideName,
    balanceVnd: 4850000,
    pendingBalanceVnd: 650000,
    totalEarnedVnd: 18450000,
    totalWithdrawnVnd: 13600000,
    transactions: [
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
    ]
  });

  const [withdrawAmount, setWithdrawAmount] = useState(2000000);
  const [bankName, setBankName] = useState('Vietcombank');
  const [bankAccount, setBankAccount] = useState('001100438999');
  const [bankHolder, setBankHolder] = useState('HOANG DUC THANH');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Subscribe to real-time Guide Wallet
  useEffect(() => {
    const unsubscribe = subscribeGuideWallet(guideId, (liveWallet) => {
      if (liveWallet) {
        setWalletData(liveWallet);
      }
    });

    return () => unsubscribe();
  }, [guideId]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawAmount <= 0 || withdrawAmount > walletData.balanceVnd) {
      setFeedbackMsg({
        type: 'error',
        text: 'Số tiền rút không hợp lệ hoặc vượt quá số dư khả dụng.'
      });
      return;
    }

    if (!bankAccount.trim() || !bankHolder.trim()) {
      setFeedbackMsg({
        type: 'error',
        text: 'Vui lòng cung cấp đầy đủ số tài khoản và tên chủ thẻ.'
      });
      return;
    }

    setIsWithdrawing(true);
    setFeedbackMsg(null);

    try {
      const res = await requestWithdrawal(guideId, guideName, withdrawAmount, {
        bankName,
        bankAccount,
        bankHolder
      });

      setIsWithdrawing(false);
      if (res.success) {
        setFeedbackMsg({
          type: 'success',
          text: res.message
        });
      } else {
        setFeedbackMsg({
          type: 'error',
          text: res.message
        });
      }
    } catch (err: any) {
      setIsWithdrawing(false);
      setFeedbackMsg({
        type: 'error',
        text: 'Đã xảy ra sự cố khi gửi yêu cầu. Vui lòng thử lại sau.'
      });
    }
  };

  return (
    <div className="min-h-screen pb-24 space-y-8">
      
      {/* Top Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => setActivePage('GUIDE_STUDIO')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-800 hover:bg-[#FDFAF5] transition-colors shadow-xs font-mono"
        >
          <ArrowLeft size={14} />
          <span>QUAY LẠI GUIDE STUDIO</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Wallet Overview Hero */}
        <div 
          className="rounded-3xl p-8 sm:p-10 text-white shadow-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6"
          style={{
            background: 'linear-gradient(135deg, #0F2D1E 0%, #1C4A32 100%)',
            borderColor: '#D4AF37'
          }}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">
              <Wallet size={16} className="text-amber-400" />
              <span>VÍ THU NHẬP NGHỆ NHÂN BẢN ĐỊA (FIREBASE REALTIME)</span>
            </div>
            <p className="text-stone-300 text-xs font-mono m-0">SỐ DƯ KHẢ DỤNG HIỆN TẠI</p>
            <h1 className="font-heritage text-4xl sm:text-5xl font-bold gold-gradient-text m-0">
              {formatPrice(walletData.balanceVnd)}
            </h1>
            <p className="text-xs text-stone-400 font-luxury-sans m-0">
              * Chia sẻ 85% từ mỗi vé được check-in thực tế. Rút tiền tức thì 24/7.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/30 text-xs font-mono space-y-2">
            <div className="flex justify-between gap-6 text-stone-400">
              <span>Tổng thu nhập luỹ kế:</span>
              <strong className="text-amber-300">{formatPrice(walletData.totalEarnedVnd)}</strong>
            </div>
            <div className="flex justify-between gap-6 text-stone-400">
              <span>Đã rút thành công:</span>
              <strong className="text-stone-200">{formatPrice(walletData.totalWithdrawnVnd)}</strong>
            </div>
            <div className="flex justify-between gap-6 text-stone-400">
              <span>Phí giao dịch LocalQuest:</span>
              <strong className="text-emerald-400">0₫ (MIỄN PHÍ)</strong>
            </div>
          </div>
        </div>

        {/* Withdrawal Form & Transaction History */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Withdrawal Form */}
          <div 
            className="rounded-3xl p-6 sm:p-8 bg-[#FDFAF5] border shadow-lg space-y-5"
            style={{ borderColor: 'rgba(212, 175, 55, 0.4)' }}
          >
            <div className="flex items-center gap-2">
              <Landmark className="text-amber-700" size={20} />
              <h3 className="font-heritage text-xl font-bold text-[#0F2D1E] m-0">
                Yêu Cầu Rút Tiền
              </h3>
            </div>

            {feedbackMsg && (
              <div className={`p-3 rounded-xl text-xs font-mono ${
                feedbackMsg.type === 'success' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {feedbackMsg.text}
              </div>
            )}

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-600 block">SỐ TIỀN MUỐN RÚT (VND) *</label>
                <input
                  type="number"
                  step={100000}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white font-mono text-base font-bold text-[#C97D1A]"
                />
                <div className="flex gap-1.5 pt-1">
                  {[1000000, 2000000, 5000000, walletData.balanceVnd].map((val, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setWithdrawAmount(val)}
                      className="px-2 py-1 rounded bg-stone-200 hover:bg-stone-300 text-[10px] font-mono text-stone-800"
                    >
                      {val === walletData.balanceVnd ? 'Tất cả' : `${val / 1000000}M`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-600 block">NGÂN HÀNG THỤ HƯỞNG *</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-mono"
                >
                  <option value="Vietcombank">Vietcombank - Ngân hàng Ngoại thương</option>
                  <option value="Techcombank">Techcombank - Ngân hàng Kỹ thương</option>
                  <option value="MBBank">MBBank - Ngân hàng Quân Đội</option>
                  <option value="BIDV">BIDV - Ngân hàng Đầu tư & Phát triển</option>
                  <option value="Vietinbank">Vietinbank - Ngân hàng Công thương</option>
                  <option value="ACB">ACB - Ngân hàng Á Châu</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-600 block">SỐ TÀI KHOẢN *</label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-mono"
                  placeholder="001100438999"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-600 block">TÊN CHỦ TÀI KHOẢN (KHÔNG DẤU) *</label>
                <input
                  type="text"
                  value={bankHolder}
                  onChange={(e) => setBankHolder(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-mono uppercase"
                  placeholder="HOANG DUC THANH"
                />
              </div>

              <button
                type="submit"
                disabled={isWithdrawing || walletData.balanceVnd <= 0}
                className="w-full btn-gold-aura py-3.5 text-xs font-bold"
              >
                {isWithdrawing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles size={14} className="animate-spin" /> Đang Xử Lý Giao Dịch...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <ArrowUpRight size={14} /> GỬI YÊU CẦU RÚT TIỀN
                  </span>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-stone-500 pt-2">
                <ShieldCheck size={13} className="text-emerald-700" />
                <span>Liên kết Napas247 chuyển tiền tự động 24/7</span>
              </div>
            </form>
          </div>

          {/* Transaction History */}
          <div 
            className="lg:col-span-2 rounded-3xl p-6 sm:p-8 bg-[#FDFAF5] border shadow-lg space-y-4"
            style={{ borderColor: 'rgba(212, 175, 55, 0.4)' }}
          >
            <div className="flex items-center justify-between pb-2 border-b border-stone-300">
              <h3 className="font-heritage text-xl font-bold text-[#0F2D1E] m-0">
                Lịch Sử Biến Động Số Dư ({walletData.transactions.length})
              </h3>
              <span className="text-xs font-mono text-stone-500">MỚI NHẤT</span>
            </div>

            <div className="space-y-3">
              {walletData.transactions.map((tx) => {
                const isPositive = tx.type === 'earning';
                return (
                  <div
                    key={tx.id}
                    className="p-4 rounded-2xl bg-white border border-stone-200 flex items-center justify-between gap-4 font-luxury-sans text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                        isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isPositive ? '+' : '-'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-stone-900 m-0">
                          {tx.description}
                        </h4>
                        <span className="text-[11px] text-stone-400 font-mono">
                          {tx.timestamp} • {tx.status === 'completed' ? 'Đã hoàn thành' : 'Đang xử lý'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono font-bold text-sm">
                      <span className={isPositive ? 'text-emerald-700' : 'text-stone-800'}>
                        {isPositive ? `+${formatPrice(tx.amount)}` : `-${formatPrice(tx.amount)}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
