import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  Tag, 
  MapPin, 
  Clock, 
  Footprints,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useQuest } from '../../context/QuestContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, img } from '../../data/quests';
import { Ticket } from '../../types';
import { bookTicket } from '../../services/ticketService';

export function CheckoutPage() {
  const { selectedQuest, setActivePage, addTicket, startGameplay } = useQuest();
  const { userProfile, updatePoints } = useAuth();

  const [touristsCount, setTouristsCount] = useState(2);
  const [fullName, setFullName] = useState(userProfile?.displayName || 'Nhà Thám Hiểm Di Sản');
  const [email, setEmail] = useState(userProfile?.email || 'explorer@localquest.vn');
  const [phone, setPhone] = useState(userProfile?.phone || '0988 123 456');
  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'momo' | 'card'>('vietqr');
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);

  if (!selectedQuest) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <p className="text-stone-600 font-luxury-sans">Chưa chọn Quest để thanh toán.</p>
        <button onClick={() => setActivePage('EXPLORE')} className="btn-gold-aura text-xs mt-4">
          Quay lại Khám Phá
        </button>
      </div>
    );
  }

  const basePrice = selectedQuest.price;
  const totalPrice = Math.max(0, basePrice - appliedDiscount);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'HERITAGE2026' || promoCode.trim().toUpperCase() === 'LOCALQUEST') {
      setAppliedDiscount(30000);
      alert('Áp dụng mã ưu đãi thành công: Giảm 30.000₫');
    } else if (promoCode.trim()) {
      alert('Mã ưu đãi không hợp lệ hoặc đã hết lượt.');
    }
  };

  const handleCompletePayment = async () => {
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      alert('Vui lòng điền đầy đủ họ tên, số điện thoại và email nhận vé.');
      return;
    }

    setIsProcessing(true);

    try {
      const newTicket = await bookTicket({
        questId: selectedQuest.id,
        questName: selectedQuest.name,
        city: selectedQuest.city,
        theme: selectedQuest.theme,
        price: totalPrice,
        touristsCount,
        buyerName: fullName,
        buyerEmail: email,
        buyerPhone: phone,
        buyerId: userProfile?.uid || 'guest-tourist',
        guideId: (selectedQuest as any).guideId || 'guide-001'
      });

      addTicket(newTicket);
      setCreatedTicket(newTicket);
      updatePoints(100, 50); // Reward points & EXP
      setIsProcessing(false);
      setIsCompleted(true);

      // Trigger Celebration Confetti
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    } catch (err: any) {
      console.warn('Booking error fallback:', err);
      // Fallback local ticket
      const ticketCode = `LQ-${selectedQuest.city.slice(0, 2).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const fallbackTicket: Ticket = {
        id: 'tkt-' + Date.now(),
        ticketCode,
        questId: selectedQuest.id,
        questName: selectedQuest.name,
        city: selectedQuest.city,
        theme: selectedQuest.theme,
        price: totalPrice,
        purchaseDate: new Date().toLocaleDateString('vi-VN'),
        touristsCount,
        buyerName: fullName,
        buyerEmail: email,
        buyerPhone: phone,
        status: 'valid',
        currentWaypointIndex: 0,
        score: 0,
        qrPayload: `LQ-TICKET-tkt-${Date.now()}`
      };
      addTicket(fallbackTicket);
      setCreatedTicket(fallbackTicket);
      setIsProcessing(false);
      setIsCompleted(true);
    }
  };

  if (isCompleted && createdTicket) {
    return (
      <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8 animate-in zoom-in-95 duration-300">
        <div 
          className="rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-2xl border"
          style={{
            background: '#FDFAF5',
            borderColor: '#D4AF37',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-500 text-emerald-700 mx-auto flex items-center justify-center shadow-lg">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <span className="text-xs font-mono font-bold text-amber-700 uppercase tracking-widest">
              THANH TOÁN THÀNH CÔNG • VÉ ĐIỆN TỬ SẴN SÀNG
            </span>
            <h2 className="font-heritage text-3xl font-bold text-[#0F2D1E] mt-1">
              Chúc Mừng Bạn Đã Sở Hữu Vé Di Sản!
            </h2>
            <p className="text-sm text-stone-600 font-luxury-sans max-w-md mx-auto mt-2">
              Mã vé <strong>{createdTicket.ticketCode}</strong> đã được gửi tới email <strong>{email}</strong>. Bạn có thể bắt đầu hành trình thực địa ngay bây giờ.
            </p>
          </div>

          {/* Ticket Snapshot Card */}
          <div className="p-5 rounded-2xl bg-[#F5F0E8] border border-amber-300/80 max-w-md mx-auto text-left space-y-3 font-luxury-sans text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-stone-300">
              <span className="font-bold text-stone-900 font-heritage text-sm">{createdTicket.questName}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-800 text-amber-300 font-mono text-[10px]">HỢP LỆ</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Mã vé:</span>
              <strong className="font-mono text-stone-900">{createdTicket.ticketCode}</strong>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Người chơi:</span>
              <strong className="text-stone-900">{createdTicket.buyerName} ({createdTicket.touristsCount} người)</strong>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Điểm thưởng tích luỹ:</span>
              <strong className="text-amber-700 font-mono">+100 PTS</strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => startGameplay(createdTicket)}
              className="w-full sm:w-auto btn-gold-aura py-3.5 px-8 text-sm"
            >
              <span>VÀO CHƠI QUEST NGAY</span>
            </button>
            <button
              onClick={() => setActivePage('MY_TICKETS')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold font-mono"
            >
              Xem danh sách vé của tôi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 space-y-8">
      
      {/* Top navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => setActivePage('QUEST_DETAIL')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-300 text-xs font-semibold text-stone-800 hover:bg-[#FDFAF5] transition-colors shadow-xs font-mono"
        >
          <ArrowLeft size={14} />
          <span>QUAY LẠI CHI TIẾT QUEST</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <span className="text-xs font-mono text-amber-700 font-bold uppercase tracking-wider">
            BƯỚC THANH TOÁN AN TOÀN
          </span>
          <h1 className="font-heritage text-3xl font-bold text-[#0F2D1E] m-0 mt-1">
            Đặt Vé Trải Nghiệm Thực Địa
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form: Tourist details & Payment method selection */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Tourist Details */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#FDFAF5] border border-stone-300/80 shadow-md space-y-5">
              <h3 className="font-heritage text-xl font-bold text-stone-900 m-0">
                1. Thông Tin Người Đại Diện
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-stone-600 block">HỌ VÀ TÊN *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:border-[#1C4A32] font-luxury-sans"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-stone-600 block">SỐ ĐIỆN THOẠI NHẬN VÉ *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:border-[#1C4A32] font-mono"
                    placeholder="0912 345 678"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-mono text-stone-600 block">EMAIL NHẬN MÃ QR *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm focus:outline-none focus:border-[#1C4A32] font-mono"
                    placeholder="name@gmail.com"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-mono text-stone-600 block">SỐ LƯỢNG THÀNH VIÊN TRONG ĐOÀN</label>
                  <div className="flex items-center gap-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setTouristsCount(n)}
                        className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                          touristsCount === n
                            ? 'bg-[#0F2D1E] text-amber-300 border border-[#D4AF37] shadow-sm'
                            : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        {n} Người
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Payment Method */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#FDFAF5] border border-stone-300/80 shadow-md space-y-5">
              <h3 className="font-heritage text-xl font-bold text-stone-900 m-0">
                2. Phương Thức Thanh Toán Thượng Lưu
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* VietQR */}
                <div
                  onClick={() => setPaymentMethod('vietqr')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center space-y-2 ${
                    paymentMethod === 'vietqr'
                      ? 'border-[#D4AF37] bg-amber-500/10 shadow-md'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <QrCode size={28} className={paymentMethod === 'vietqr' ? 'text-amber-800' : 'text-stone-600'} />
                  <span className="font-bold text-xs text-stone-900 font-mono">VietQR Chuẩn 24/7</span>
                  <span className="text-[10px] text-stone-500">Quét mã ngân hàng tức thì</span>
                </div>

                {/* MoMo */}
                <div
                  onClick={() => setPaymentMethod('momo')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center space-y-2 ${
                    paymentMethod === 'momo'
                      ? 'border-[#D4AF37] bg-amber-500/10 shadow-md'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <Smartphone size={28} className={paymentMethod === 'momo' ? 'text-amber-800' : 'text-stone-600'} />
                  <span className="font-bold text-xs text-stone-900 font-mono">Ví Điện Tử MoMo</span>
                  <span className="text-[10px] text-stone-500">Thanh toán một chạm</span>
                </div>

                {/* Visa / Master */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center space-y-2 ${
                    paymentMethod === 'card'
                      ? 'border-[#D4AF37] bg-amber-500/10 shadow-md'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <CreditCard size={28} className={paymentMethod === 'card' ? 'text-amber-800' : 'text-stone-600'} />
                  <span className="font-bold text-xs text-stone-900 font-mono">Thẻ Visa / Master</span>
                  <span className="text-[10px] text-stone-500">Bảo mật chuẩn quốc tế</span>
                </div>

              </div>

              {/* VietQR Dynamic Preview Box */}
              {paymentMethod === 'vietqr' && (
                <div className="p-4 rounded-2xl bg-white border border-amber-300 flex flex-col sm:flex-row items-center gap-4 text-xs font-luxury-sans">
                  <div className="p-2 bg-stone-900 rounded-xl border border-[#D4AF37]">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=VIETQR%3A%2F%2FLOCALQUEST%2FAMT%3D${totalPrice}%26REF%3D${selectedQuest.id}&color=D4AF37&bgcolor=121412`}
                      alt="VietQR"
                      className="w-24 h-24 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-stone-900 m-0">Quét mã bằng app ngân hàng bất kỳ (Vietcombank, Techcombank, MB...)</p>
                    <p className="text-stone-500 font-mono m-0">Số tiền: <strong>{formatPrice(totalPrice)}</strong> • Nội dung: LQ {selectedQuest.id}</p>
                    <p className="text-emerald-700 font-bold m-0 flex items-center gap-1">
                      <Sparkles size={12} /> Hệ thống tự động kích hoạt vé ngay khi nhận chuyển khoản
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Summary Card */}
          <div className="space-y-6">
            <div 
              className="rounded-3xl p-6 sm:p-8 shadow-2xl border space-y-6"
              style={{
                background: '#FDFAF5',
                borderColor: '#D4AF37'
              }}
            >
              <h3 className="font-heritage text-lg font-bold text-[#0F2D1E] pb-3 border-b border-stone-300">
                Tóm Tắt Đơn Vé
              </h3>

              {/* Quest Item Details */}
              <div className="flex gap-3">
                <img
                  src={img(selectedQuest.imageId, 120, 120)}
                  alt={selectedQuest.name}
                  className="w-16 h-16 rounded-xl object-cover border border-amber-400 flex-shrink-0"
                />
                <div className="space-y-1">
                  <h4 className="font-heritage text-sm font-bold text-stone-900 leading-tight">
                    {selectedQuest.name}
                  </h4>
                  <p className="text-xs text-stone-500 font-mono m-0">
                    {selectedQuest.city} • {selectedQuest.waypoints.length} trạm dừng
                  </p>
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="pt-2 border-t border-stone-300">
                <label className="text-[11px] font-mono text-stone-600 block mb-1.5">MÃ ƯU ĐÃI DI SẢN</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Nhập HERITAGE2026"
                    className="flex-1 px-3 py-2 text-xs uppercase font-mono rounded-lg border border-stone-300 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="btn-outline-gold text-xs px-3 py-2"
                  >
                    Áp dụng
                  </button>
                </div>
                {appliedDiscount > 0 && (
                  <p className="text-xs text-emerald-700 font-mono mt-1">Đã áp dụng giảm -30.000₫</p>
                )}
              </div>

              {/* Price Calculation */}
              <div className="pt-3 border-t border-stone-300 space-y-2 text-xs font-luxury-sans">
                <div className="flex justify-between text-stone-600">
                  <span>Giá vé gốc:</span>
                  <span className="font-mono text-stone-800">{formatPrice(basePrice)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Mã ưu đãi:</span>
                    <span className="font-mono font-bold">-{formatPrice(appliedDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>Phí dịch vụ & AI Narration:</span>
                  <span className="font-mono text-emerald-700 font-semibold">MIỄN PHÍ</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-stone-300 text-sm">
                  <span className="font-bold text-stone-900">Tổng thanh toán:</span>
                  <span className="font-heritage text-2xl font-bold font-mono text-[#C97D1A]">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                disabled={isProcessing}
                onClick={handleCompletePayment}
                className="w-full btn-gold-aura py-4 text-sm font-bold tracking-wider"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="animate-spin" size={16} /> Đang Xác Thực Giao Dịch...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock size={16} /> XÁC NHẬN THANH TOÁN
                  </span>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-stone-500">
                <ShieldCheck size={14} className="text-emerald-700" />
                <span>Mã hoá bảo mật SSL 256-bit</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
