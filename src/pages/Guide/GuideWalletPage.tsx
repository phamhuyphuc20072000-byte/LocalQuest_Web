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
  Landmark,
  AlertCircle
} from 'lucide-react';
import { useQuest } from '../../context/QuestContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../data/quests';
import { subscribeGuideWallet, requestWithdrawal, GuideWalletData } from '../../services/walletService';
import { auth, onAuthStateChanged } from '../../firebase';

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

  const [withdrawAmount, setWithdrawAmount] = useState<number | string>(2000000);
  const [bankName, setBankName] = useState('Vietcombank');
  const [bankAccount, setBankAccount] = useState('001100438999');
  const [bankHolder, setBankHolder] = useState('HOANG DUC THANH');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // onBlur Validation State
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Validator function for withdrawal form
  const validateField = (fieldName: string, value: any): string => {
    switch (fieldName) {
      case 'withdrawAmount': {
        const num = Number(value);
        if (value === '' || isNaN(num) || num <= 0) {
          return 'Thiếu chi tiết: Vui lòng nhập số tiền muốn rút.';
        }
        if (num < 100000) {
          return 'Sai định dạng: Số tiền rút tối thiểu là 100.000₫.';
        }
        if (num > walletData.balanceVnd) {
          return `Số tiền vượt quá số dư khả dụng (${formatPrice(walletData.balanceVnd)}).`;
        }
        return '';
      }

      case 'bankAccount': {
        const str = String(value || '').trim();
        if (!str) {
          return 'Thiếu chi tiết: Vui lòng nhập số tài khoản ngân hàng thụ hưởng.';
        }
        const cleaned = str.replace(/[\s-]/g, '');
        if (!/^\d{6,22}$/.test(cleaned)) {
          return 'Sai định dạng: Số tài khoản chỉ gồm chữ số (từ 6 đến 22 số).';
        }
        return '';
      }

      case 'bankHolder': {
        const str = String(value || '').trim();
        if (!str) {
          return 'Thiếu chi tiết: Vui lòng nhập tên chủ tài khoản ngân hàng.';
        }
        if (!/^[a-zA-Z\s]+$/.test(str) || str.length < 3) {
          return 'Sai định dạng: Tên chủ tài khoản phải là chữ in hoa không dấu (VD: HOANG DUC THANH).';
        }
        return '';
      }

      default:
        return '';
    }
  };

  const handleBlur = (fieldName: string, value: any) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const errorMsg = validateField(fieldName, value);
    setErrors((prev) => ({ ...prev, [fieldName]: errorMsg }));
  };

  const handleInputChange = (fieldName: string, value: any, setter: (val: any) => void) => {
    setter(value);
    if (touched[fieldName] || submitAttempted) {
      const errorMsg = validateField(fieldName, value);
      setErrors((prev) => ({ ...prev, [fieldName]: errorMsg }));
    }
  };

  // Subscribe to real-time Guide Wallet
  useEffect(() => {
    let unsub = () => {};
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      unsub();
      if (user) {
        unsub = subscribeGuideWallet(guideId, (liveWallet) => {
          if (liveWallet) {
            setWalletData(liveWallet);
          }
        });
      }
    });

    return () => {
      unsub();
      unsubAuth();
    };
  }, [guideId]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const newErrors: Record<string, string> = {
      withdrawAmount: validateField('withdrawAmount', withdrawAmount),
      bankAccount: validateField('bankAccount', bankAccount),
      bankHolder: validateField('bankHolder', bankHolder),
    };

    const newTouched: Record<string, boolean> = {
      withdrawAmount: true,
      bankAccount: true,
      bankHolder: true,
    };

    setTouched(newTouched);
    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      setFeedbackMsg({
        type: 'error',
        text: 'Vui lòng kiểm tra lại các trường thông tin bị thiếu hoặc sai định dạng (viền đỏ) trước khi chuyển tiền.'
      });
      return;
    }

    setIsWithdrawing(true);
    setFeedbackMsg(null);

    try {
      const res = await requestWithdrawal(guideId, guideName, Number(withdrawAmount), {
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
        setTouched({});
        setErrors({});
        setSubmitAttempted(false);
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
              {/* Withdraw Amount Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="input-guide-withdrawAmount" className="text-xs font-mono text-stone-700 font-semibold block">
                    SỐ TIỀN MUỐN RÚT (VND) *
                  </label>
                  {touched.withdrawAmount && !errors.withdrawAmount && (
                    <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Hợp lệ
                    </span>
                  )}
                </div>
                <input
                  id="input-guide-withdrawAmount"
                  type="number"
                  step={100000}
                  value={withdrawAmount}
                  onBlur={() => handleBlur('withdrawAmount', withdrawAmount)}
                  onChange={(e) => handleInputChange('withdrawAmount', e.target.value, setWithdrawAmount)}
                  className={`w-full px-4 py-2.5 rounded-xl border font-mono text-base font-bold text-[#C97D1A] transition-all focus:outline-none ${
                    touched.withdrawAmount && errors.withdrawAmount
                      ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-500/20'
                      : touched.withdrawAmount && !errors.withdrawAmount
                      ? 'border-emerald-500 bg-emerald-50/20'
                      : 'border-stone-300 bg-white'
                  }`}
                />
                {touched.withdrawAmount && errors.withdrawAmount && (
                  <div id="error-guide-withdrawAmount" className="flex items-start gap-1.5 text-rose-600 text-xs font-mono pt-0.5 animate-in fade-in duration-200">
                    <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-600" />
                    <span>{errors.withdrawAmount}</span>
                  </div>
                )}
                <div className="flex gap-1.5 pt-1">
                  {[1000000, 2000000, 5000000, walletData.balanceVnd].map((val, idx) => (
                    <button
                      key={idx}
                      id={`btn-guide-quick-amount-${idx}`}
                      type="button"
                      onClick={() => handleInputChange('withdrawAmount', val, setWithdrawAmount)}
                      className="px-2 py-1 rounded bg-stone-200 hover:bg-stone-300 text-[10px] font-mono text-stone-800 transition-colors"
                    >
                      {val === walletData.balanceVnd ? 'Tất cả' : `${val / 1000000}M`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank Name Field */}
              <div className="space-y-1.5">
                <label htmlFor="select-guide-bankName" className="text-xs font-mono text-stone-700 font-semibold block">
                  NGÂN HÀNG THỤ HƯỞNG *
                </label>
                <select
                  id="select-guide-bankName"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-mono focus:outline-none focus:border-[#1C4A32]"
                >
                  <option value="Vietcombank">Vietcombank - Ngân hàng Ngoại thương</option>
                  <option value="Techcombank">Techcombank - Ngân hàng Kỹ thương</option>
                  <option value="MBBank">MBBank - Ngân hàng Quân Đội</option>
                  <option value="BIDV">BIDV - Ngân hàng Đầu tư & Phát triển</option>
                  <option value="Vietinbank">Vietinbank - Ngân hàng Công thương</option>
                  <option value="ACB">ACB - Ngân hàng Á Châu</option>
                </select>
              </div>

              {/* Bank Account Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="input-guide-bankAccount" className="text-xs font-mono text-stone-700 font-semibold block">
                    SỐ TÀI KHOẢN *
                  </label>
                  {touched.bankAccount && !errors.bankAccount && (
                    <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Hợp lệ
                    </span>
                  )}
                </div>
                <input
                  id="input-guide-bankAccount"
                  type="text"
                  value={bankAccount}
                  onBlur={() => handleBlur('bankAccount', bankAccount)}
                  onChange={(e) => handleInputChange('bankAccount', e.target.value, setBankAccount)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono transition-all focus:outline-none ${
                    touched.bankAccount && errors.bankAccount
                      ? 'border-rose-500 bg-rose-50/40 text-rose-950 ring-2 ring-rose-500/20'
                      : touched.bankAccount && !errors.bankAccount
                      ? 'border-emerald-500 bg-emerald-50/20 text-stone-900'
                      : 'border-stone-300 bg-white text-stone-900 focus:border-[#1C4A32]'
                  }`}
                  placeholder="001100438999"
                />
                {touched.bankAccount && errors.bankAccount && (
                  <div id="error-guide-bankAccount" className="flex items-start gap-1.5 text-rose-600 text-xs font-mono pt-0.5 animate-in fade-in duration-200">
                    <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-600" />
                    <span>{errors.bankAccount}</span>
                  </div>
                )}
              </div>

              {/* Bank Holder Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="input-guide-bankHolder" className="text-xs font-mono text-stone-700 font-semibold block">
                    TÊN CHỦ TÀI KHOẢN (KHÔNG DẤU) *
                  </label>
                  {touched.bankHolder && !errors.bankHolder && (
                    <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Hợp lệ
                    </span>
                  )}
                </div>
                <input
                  id="input-guide-bankHolder"
                  type="text"
                  value={bankHolder}
                  onBlur={() => handleBlur('bankHolder', bankHolder)}
                  onChange={(e) => handleInputChange('bankHolder', e.target.value.toUpperCase(), setBankHolder)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-mono uppercase transition-all focus:outline-none ${
                    touched.bankHolder && errors.bankHolder
                      ? 'border-rose-500 bg-rose-50/40 text-rose-950 ring-2 ring-rose-500/20'
                      : touched.bankHolder && !errors.bankHolder
                      ? 'border-emerald-500 bg-emerald-50/20 text-stone-900'
                      : 'border-stone-300 bg-white text-stone-900 focus:border-[#1C4A32]'
                  }`}
                  placeholder="HOANG DUC THANH"
                />
                {touched.bankHolder && errors.bankHolder && (
                  <div id="error-guide-bankHolder" className="flex items-start gap-1.5 text-rose-600 text-xs font-mono pt-0.5 animate-in fade-in duration-200">
                    <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-600" />
                    <span>{errors.bankHolder}</span>
                  </div>
                )}
              </div>

              <button
                id="btn-guide-submit-withdraw"
                type="submit"
                disabled={isWithdrawing || walletData.balanceVnd <= 0}
                className="w-full btn-gold-aura py-3.5 text-xs font-bold cursor-pointer"
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
