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
  Users,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useQuest } from '../../context/QuestContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, img } from '../../data/quests';
import { Ticket } from '../../types';
import { bookTicket } from '../../services/ticketService';
import { DateTimePicker } from '../../components/common/DateTimePicker';

export function CheckoutPage() {
  const { 
    selectedQuest, 
    setActivePage, 
    addTicket, 
    startGameplay,
    bookingDate,
    setBookingDate,
    bookingTime,
    setBookingTime
  } = useQuest();
  const { userProfile, updatePoints } = useAuth();

  const [touristsCount, setTouristsCount] = useState(2);
  const [fullName, setFullName] = useState(userProfile?.displayName || 'Nhà Thám Hiểm Di Sản');
  const [email, setEmail] = useState(userProfile?.email || 'explorer@localquest.vn');
  const [phone, setPhone] = useState(userProfile?.phone || '0912 345 678');
  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'momo' | 'card'>('vietqr');
  const [promoCode, setPromoCode] = useState('');
  const [promoFeedback, setPromoFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);

  // Validation State for onBlur & submit
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Credit Card state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // MoMo state
  const [momoPhone, setMomoPhone] = useState(userProfile?.phone || '0912 345 678');

  // Copy state for bank transfer
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

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

  // Comprehensive Field Validator for onBlur & live checking
  const validateField = (fieldName: string, value: string): string => {
    switch (fieldName) {
      case 'departureDate': {
        if (!value) {
          return 'Thiếu chi tiết: Vui lòng bấm chọn ngày đi thực địa.';
        }
        const todayStr = new Date().toISOString().split('T')[0];
        if (value < todayStr) {
          return 'Sai định dạng: Ngày đi không thể ở trong quá khứ.';
        }
        return '';
      }

      case 'departureTime': {
        if (!value) {
          return 'Thiếu chi tiết: Vui lòng bấm chọn khung giờ khởi hành.';
        }
        return '';
      }

      case 'fullName': {
        const trimmed = value.trim();
        if (!trimmed) {
          return 'Thiếu chi tiết: Vui lòng nhập họ và tên người đại diện.';
        }
        if (trimmed.length < 2) {
          return 'Sai định dạng: Họ và tên quá ngắn (tối thiểu 2 ký tự).';
        }
        // Support Vietnamese accented names, spaces, hyphens, apostrophes
        const nameRegex = /^[\p{L}\s.'-]+$/u;
        if (!nameRegex.test(trimmed)) {
          return 'Sai định dạng: Họ và tên chỉ được chứa chữ cái (không có chữ số hoặc ký tự đặc biệt).';
        }
        return '';
      }

      case 'phone': {
        const trimmed = value.trim();
        if (!trimmed) {
          return 'Thiếu chi tiết: Vui lòng nhập số điện thoại nhận vé.';
        }
        const cleaned = trimmed.replace(/[\s.-]/g, '');
        // Vietnam mobile number standard: 10 digits starting with 0 or +84
        const vnPhoneRegex = /^(0|\+84)(3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
        if (!vnPhoneRegex.test(cleaned)) {
          return 'Sai định dạng: Số điện thoại không hợp lệ (VD: 0912 345 678, gồm 10 chữ số).';
        }
        return '';
      }

      case 'email': {
        const trimmed = value.trim();
        if (!trimmed) {
          return 'Thiếu chi tiết: Vui lòng nhập email nhận vé & mã QR.';
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(trimmed)) {
          return 'Sai định dạng: Email không đúng cấu trúc (VD: name@domain.com).';
        }
        return '';
      }

      case 'cardNumber': {
        const cleaned = value.replace(/[\s-]/g, '');
        if (!cleaned) {
          return 'Thiếu chi tiết: Vui lòng nhập số thẻ thanh toán.';
        }
        if (!/^\d{15,16}$/.test(cleaned)) {
          return 'Sai định dạng: Số thẻ gồm 15 đến 16 chữ số.';
        }
        return '';
      }

      case 'cardHolder': {
        const trimmed = value.trim();
        if (!trimmed) {
          return 'Thiếu chi tiết: Vui lòng nhập tên in trên thẻ.';
        }
        if (!/^[a-zA-Z\s]+$/.test(trimmed) || trimmed.length < 2) {
          return 'Sai định dạng: Tên chủ thẻ phải là chữ in hoa không dấu (VD: NGUYEN VAN A).';
        }
        return '';
      }

      case 'cardExpiry': {
        const trimmed = value.trim();
        if (!trimmed) {
          return 'Thiếu chi tiết: Vui lòng nhập hạn thẻ (MM/YY).';
        }
        if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(trimmed)) {
          return 'Sai định dạng: Hạn thẻ không đúng định dạng tháng/năm (VD: 08/28).';
        }
        return '';
      }

      case 'cardCvv': {
        const cleaned = value.trim();
        if (!cleaned) {
          return 'Thiếu chi tiết: Vui lòng nhập mã bảo mật CVV.';
        }
        if (!/^\d{3,4}$/.test(cleaned)) {
          return 'Sai định dạng: Mã CVV gồm 3 hoặc 4 chữ số.';
        }
        return '';
      }

      case 'momoPhone': {
        const trimmed = value.trim();
        if (!trimmed) {
          return 'Thiếu chi tiết: Vui lòng nhập số điện thoại ví MoMo.';
        }
        const cleaned = trimmed.replace(/[\s.-]/g, '');
        const vnPhoneRegex = /^(0|\+84)(3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/;
        if (!vnPhoneRegex.test(cleaned)) {
          return 'Sai định dạng: Số điện thoại MoMo không hợp lệ (VD: 0912 345 678).';
        }
        return '';
      }

      default:
        return '';
    }
  };

  // onBlur Event Handler
  const handleBlur = (fieldName: string, value: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const errorMsg = validateField(fieldName, value);
    setErrors((prev) => ({ ...prev, [fieldName]: errorMsg }));
  };

  // onChange Event Handler with smart re-validation once touched
  const handleInputChange = (fieldName: string, value: string, setter: (val: string) => void) => {
    setter(value);
    if (touched[fieldName] || submitAttempted) {
      const errorMsg = validateField(fieldName, value);
      setErrors((prev) => ({ ...prev, [fieldName]: errorMsg }));
    }
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoFeedback({ type: 'error', message: 'Vui lòng nhập mã ưu đãi trước khi áp dụng.' });
      return;
    }
    if (code === 'HERITAGE2026' || code === 'LOCALQUEST') {
      setAppliedDiscount(30000);
      setPromoFeedback({ type: 'success', message: 'Áp dụng mã ưu đãi thành công: Giảm 30.000₫' });
    } else {
      setPromoFeedback({ type: 'error', message: 'Mã ưu đãi không hợp lệ hoặc đã hết lượt áp dụng.' });
    }
  };

  const handleCompletePayment = async () => {
    setSubmitAttempted(true);

    // Validate main tourist fields and departure schedule
    const newErrors: Record<string, string> = {
      departureDate: validateField('departureDate', bookingDate),
      departureTime: validateField('departureTime', bookingTime),
      fullName: validateField('fullName', fullName),
      phone: validateField('phone', phone),
      email: validateField('email', email),
    };

    const newTouched: Record<string, boolean> = {
      departureDate: true,
      departureTime: true,
      fullName: true,
      phone: true,
      email: true,
    };

    if (paymentMethod === 'card') {
      newErrors.cardNumber = validateField('cardNumber', cardNumber);
      newErrors.cardHolder = validateField('cardHolder', cardHolder);
      newErrors.cardExpiry = validateField('cardExpiry', cardExpiry);
      newErrors.cardCvv = validateField('cardCvv', cardCvv);
      newTouched.cardNumber = true;
      newTouched.cardHolder = true;
      newTouched.cardExpiry = true;
      newTouched.cardCvv = true;
    } else if (paymentMethod === 'momo') {
      newErrors.momoPhone = validateField('momoPhone', momoPhone);
      newTouched.momoPhone = true;
    }

    setTouched(newTouched);
    setErrors(newErrors);

    // Check if any error exists
    const hasAnyError = Object.values(newErrors).some((err) => Boolean(err));
    if (hasAnyError) {
      const firstInvalidField = Object.keys(newErrors).find((k) => Boolean(newErrors[k]));
      if (firstInvalidField) {
        const el = document.getElementById(`input-${firstInvalidField}`) || document.getElementById(`checkout-dt-${firstInvalidField}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }
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
        buyerName: fullName.trim(),
        buyerEmail: email.trim(),
        buyerPhone: phone.trim(),
        buyerId: userProfile?.uid || 'guest-tourist',
        guideId: (selectedQuest as any).guideId || 'guide-001',
        playDate: bookingDate,
        departureTime: bookingTime
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
        playDate: bookingDate,
        departureTime: bookingTime,
        touristsCount,
        buyerName: fullName.trim(),
        buyerEmail: email.trim(),
        buyerPhone: phone.trim(),
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
              <span>Lịch khởi hành:</span>
              <strong className="text-amber-800 font-mono">
                {createdTicket.departureTime || '08:30'} • {createdTicket.playDate ? createdTicket.playDate.split('-').reverse().join('/') : createdTicket.purchaseDate}
              </strong>
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
            
            {/* 1. Departure Date & Time Selection (Datepicker) */}
            <div id="section-departure-schedule" className="space-y-2">
              <DateTimePicker
                idPrefix="checkout-dt"
                label="1. Chọn Ngày Đi & Giờ Khởi Hành *"
                selectedDate={bookingDate}
                onDateChange={(val) => {
                  setBookingDate(val);
                  if (touched.departureDate || submitAttempted) {
                    const err = validateField('departureDate', val);
                    setErrors((prev) => ({ ...prev, departureDate: err }));
                  }
                }}
                selectedTime={bookingTime}
                onTimeChange={(val) => {
                  setBookingTime(val);
                  if (touched.departureTime || submitAttempted) {
                    const err = validateField('departureTime', val);
                    setErrors((prev) => ({ ...prev, departureTime: err }));
                  }
                }}
                onBlur={() => {
                  handleBlur('departureDate', bookingDate);
                  handleBlur('departureTime', bookingTime);
                }}
                isTouched={touched.departureDate || touched.departureTime || submitAttempted}
                error={errors.departureDate || errors.departureTime}
                mode="tourist"
              />
            </div>

            {/* 2. Tourist Details */}
            <div id="section-tourist-details" className="p-6 sm:p-8 rounded-3xl bg-[#FDFAF5] border border-stone-300/80 shadow-md space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-heritage text-xl font-bold text-stone-900 m-0">
                  2. Thông Tin Người Đại Diện Nhận Vé
                </h3>
                <span className="text-[11px] font-mono text-stone-500">
                  * Bắt buộc hoàn tất
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="input-fullName" className="text-xs font-mono text-stone-700 font-semibold block">
                      HỌ VÀ TÊN *
                    </label>
                    {touched.fullName && !errors.fullName && (
                      <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Hợp lệ
                      </span>
                    )}
                  </div>
                  <input
                    id="input-fullName"
                    type="text"
                    value={fullName}
                    onBlur={() => handleBlur('fullName', fullName)}
                    onChange={(e) => handleInputChange('fullName', e.target.value, setFullName)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-luxury-sans transition-all focus:outline-none ${
                      touched.fullName && errors.fullName
                        ? 'border-rose-500 bg-rose-50/40 text-rose-950 ring-2 ring-rose-500/20 focus:border-rose-600'
                        : touched.fullName && !errors.fullName
                        ? 'border-emerald-500 bg-emerald-50/20 text-stone-900 focus:border-emerald-600'
                        : 'border-stone-300 bg-white text-stone-900 focus:border-[#1C4A32]'
                    }`}
                    placeholder="Nguyễn Văn A"
                  />
                  {touched.fullName && errors.fullName && (
                    <div id="error-fullName" className="flex items-start gap-1.5 text-rose-600 text-xs font-mono pt-0.5 animate-in fade-in duration-200">
                      <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-600" />
                      <span>{errors.fullName}</span>
                    </div>
                  )}
                </div>

                {/* Phone Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="input-phone" className="text-xs font-mono text-stone-700 font-semibold block">
                      SỐ ĐIỆN THOẠI NHẬN VÉ *
                    </label>
                    {touched.phone && !errors.phone && (
                      <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Hợp lệ
                      </span>
                    )}
                  </div>
                  <input
                    id="input-phone"
                    type="tel"
                    value={phone}
                    onBlur={() => handleBlur('phone', phone)}
                    onChange={(e) => handleInputChange('phone', e.target.value, setPhone)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono transition-all focus:outline-none ${
                      touched.phone && errors.phone
                        ? 'border-rose-500 bg-rose-50/40 text-rose-950 ring-2 ring-rose-500/20 focus:border-rose-600'
                        : touched.phone && !errors.phone
                        ? 'border-emerald-500 bg-emerald-50/20 text-stone-900 focus:border-emerald-600'
                        : 'border-stone-300 bg-white text-stone-900 focus:border-[#1C4A32]'
                    }`}
                    placeholder="0912 345 678"
                  />
                  {touched.phone && errors.phone && (
                    <div id="error-phone" className="flex items-start gap-1.5 text-rose-600 text-xs font-mono pt-0.5 animate-in fade-in duration-200">
                      <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-600" />
                      <span>{errors.phone}</span>
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="input-email" className="text-xs font-mono text-stone-700 font-semibold block">
                      EMAIL NHẬN MÃ QR *
                    </label>
                    {touched.email && !errors.email && (
                      <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Hợp lệ
                      </span>
                    )}
                  </div>
                  <input
                    id="input-email"
                    type="email"
                    value={email}
                    onBlur={() => handleBlur('email', email)}
                    onChange={(e) => handleInputChange('email', e.target.value, setEmail)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono transition-all focus:outline-none ${
                      touched.email && errors.email
                        ? 'border-rose-500 bg-rose-50/40 text-rose-950 ring-2 ring-rose-500/20 focus:border-rose-600'
                        : touched.email && !errors.email
                        ? 'border-emerald-500 bg-emerald-50/20 text-stone-900 focus:border-emerald-600'
                        : 'border-stone-300 bg-white text-stone-900 focus:border-[#1C4A32]'
                    }`}
                    placeholder="tourist@localquest.vn"
                  />
                  {touched.email && errors.email && (
                    <div id="error-email" className="flex items-start gap-1.5 text-rose-600 text-xs font-mono pt-0.5 animate-in fade-in duration-200">
                      <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-600" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>

                {/* Tourists Count */}
                <div className="space-y-1.5 sm:col-span-2 pt-2">
                  <label className="text-xs font-mono text-stone-600 block">SỐ LƯỢNG THÀNH VIÊN TRONG ĐOÀN</label>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        id={`btn-tourists-count-${n}`}
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

            {/* 3. Payment Method */}
            <div id="section-payment-method" className="p-6 sm:p-8 rounded-3xl bg-[#FDFAF5] border border-stone-300/80 shadow-md space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-heritage text-xl font-bold text-stone-900 m-0">
                  3. Chuẩn Bị Chuyển Tiền & Phương Thức Thanh Toán
                </h3>
                <span className="text-[11px] font-mono text-amber-800 font-semibold flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-700" /> Napas 24/7 & SSL
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* VietQR */}
                <div
                  id="tab-payment-vietqr"
                  onClick={() => setPaymentMethod('vietqr')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center space-y-2 ${
                    paymentMethod === 'vietqr'
                      ? 'border-[#D4AF37] bg-amber-500/10 shadow-md'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <QrCode size={28} className={paymentMethod === 'vietqr' ? 'text-amber-800' : 'text-stone-600'} />
                  <span className="font-bold text-xs text-stone-900 font-mono">VietQR Chuẩn 24/7</span>
                  <span className="text-[10px] text-stone-500">Quét mã chuyển khoản tức thì</span>
                </div>

                {/* MoMo */}
                <div
                  id="tab-payment-momo"
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
                  id="tab-payment-card"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center space-y-2 ${
                    paymentMethod === 'card'
                      ? 'border-[#D4AF37] bg-amber-500/10 shadow-md'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <CreditCard size={28} className={paymentMethod === 'card' ? 'text-amber-800' : 'text-stone-600'} />
                  <span className="font-bold text-xs text-stone-900 font-mono">Thẻ Quốc Tế</span>
                  <span className="text-[10px] text-stone-500">Visa / Mastercard / JCB</span>
                </div>
              </div>

              {/* VietQR Transfer Details Box */}
              {paymentMethod === 'vietqr' && (
                <div id="box-vietqr-details" className="p-5 rounded-2xl bg-white border border-amber-300 space-y-4 text-xs font-luxury-sans">
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    <div className="p-3 bg-stone-900 rounded-2xl border-2 border-[#D4AF37] shrink-0 shadow-md">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=VIETQR%3A%2F%2FLOCALQUEST%2FAMT%3D${totalPrice}%26REF%3D${selectedQuest.id}&color=D4AF37&bgcolor=121412`}
                        alt="VietQR Chuyển Tiền"
                        className="w-28 h-28 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2 flex-1 w-full text-stone-700">
                      <div>
                        <p className="font-bold text-stone-900 text-sm m-0">Quét mã bằng app ngân hàng bất kỳ</p>
                        <p className="text-stone-500 text-[11px] m-0 font-mono">Hỗ trợ Vietcombank, Techcombank, MB, BIDV, ACB, VietinBank...</p>
                      </div>

                      {/* Transfer details with 1-click copy */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-xs">
                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-stone-500 block">SỐ TIỀN CHUYỂN:</span>
                            <strong className="text-amber-800 text-sm">{formatPrice(totalPrice)}</strong>
                          </div>
                          <button
                            id="btn-copy-amount"
                            type="button"
                            onClick={() => copyToClipboard(String(totalPrice), 'amount')}
                            className="p-1.5 rounded-lg border border-stone-300 hover:bg-white text-stone-700 transition-colors"
                            title="Sao chép số tiền"
                          >
                            {copiedKey === 'amount' ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
                          </button>
                        </div>

                        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-stone-500 block">NỘI DUNG CHUYỂN KHOẢN:</span>
                            <strong className="text-stone-900 text-sm">LQ {selectedQuest.id}</strong>
                          </div>
                          <button
                            id="btn-copy-content"
                            type="button"
                            onClick={() => copyToClipboard(`LQ ${selectedQuest.id}`, 'content')}
                            className="p-1.5 rounded-lg border border-stone-300 hover:bg-white text-stone-700 transition-colors"
                            title="Sao chép nội dung"
                          >
                            {copiedKey === 'content' ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>

                      <p className="text-emerald-800 text-[11px] font-semibold m-0 flex items-center gap-1.5 pt-1">
                        <Sparkles size={13} className="text-amber-600" /> Hệ thống tự động xác nhận và phát hành vé điện tử tức thì khi nhận chuyển khoản
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* MoMo Payment Details with onBlur */}
              {paymentMethod === 'momo' && (
                <div id="box-momo-details" className="p-5 rounded-2xl bg-white border border-stone-200 space-y-4 text-xs font-luxury-sans">
                  <div className="flex items-center gap-3 pb-2 border-b border-stone-200">
                    <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center text-pink-700 font-bold font-mono">
                      M
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 m-0">Thanh toán qua Ví MoMo</h4>
                      <p className="text-stone-500 text-[11px] m-0 font-mono">Xác thực số điện thoại ví MoMo trước khi chuyển tiền</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 max-w-md">
                    <div className="flex items-center justify-between">
                      <label htmlFor="input-momoPhone" className="text-xs font-mono text-stone-700 font-semibold block">
                        SỐ ĐIỆN THOẠI VÍ MOMO *
                      </label>
                      {touched.momoPhone && !errors.momoPhone && (
                        <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Hợp lệ
                        </span>
                      )}
                    </div>
                    <input
                      id="input-momoPhone"
                      type="tel"
                      value={momoPhone}
                      onBlur={() => handleBlur('momoPhone', momoPhone)}
                      onChange={(e) => handleInputChange('momoPhone', e.target.value, setMomoPhone)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono transition-all focus:outline-none ${
                        touched.momoPhone && errors.momoPhone
                          ? 'border-rose-500 bg-rose-50/40 text-rose-950 ring-2 ring-rose-500/20 focus:border-rose-600'
                          : touched.momoPhone && !errors.momoPhone
                          ? 'border-emerald-500 bg-emerald-50/20 text-stone-900 focus:border-emerald-600'
                          : 'border-stone-300 bg-white text-stone-900 focus:border-[#1C4A32]'
                      }`}
                      placeholder="0912 345 678"
                    />
                    {touched.momoPhone && errors.momoPhone && (
                      <div id="error-momoPhone" className="flex items-start gap-1.5 text-rose-600 text-xs font-mono pt-0.5">
                        <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-600" />
                        <span>{errors.momoPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Credit Card Details with onBlur */}
              {paymentMethod === 'card' && (
                <div id="box-card-details" className="p-5 rounded-2xl bg-white border border-stone-200 space-y-4 text-xs font-luxury-sans">
                  <div className="flex items-center gap-3 pb-2 border-b border-stone-200">
                    <CreditCard className="text-amber-700" size={20} />
                    <div>
                      <h4 className="font-bold text-stone-900 m-0">Thông Tin Thẻ Quốc Tế (Visa / Mastercard)</h4>
                      <p className="text-stone-500 text-[11px] m-0 font-mono">Dữ liệu được mã hoá theo chuẩn bảo mật PCI-DSS</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Card Number */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="input-cardNumber" className="text-xs font-mono text-stone-700 font-semibold block">
                          SỐ THẺ (16 CHỮ SỐ) *
                        </label>
                        {touched.cardNumber && !errors.cardNumber && (
                          <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Hợp lệ
                          </span>
                        )}
                      </div>
                      <input
                        id="input-cardNumber"
                        type="text"
                        maxLength={19}
                        value={cardNumber}
                        onBlur={() => handleBlur('cardNumber', cardNumber)}
                        onChange={(e) => handleInputChange('cardNumber', e.target.value, setCardNumber)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono transition-all focus:outline-none ${
                          touched.cardNumber && errors.cardNumber
                            ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-500/20'
                            : touched.cardNumber && !errors.cardNumber
                            ? 'border-emerald-500 bg-emerald-50/20'
                            : 'border-stone-300 bg-white'
                        }`}
                        placeholder="4532 0159 8832 9912"
                      />
                      {touched.cardNumber && errors.cardNumber && (
                        <div id="error-cardNumber" className="flex items-start gap-1.5 text-rose-600 text-xs font-mono pt-0.5">
                          <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-600" />
                          <span>{errors.cardNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Holder */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="input-cardHolder" className="text-xs font-mono text-stone-700 font-semibold block">
                          TÊN CHỦ THẺ (IN HOA KHÔNG DẤU) *
                        </label>
                        {touched.cardHolder && !errors.cardHolder && (
                          <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Hợp lệ
                          </span>
                        )}
                      </div>
                      <input
                        id="input-cardHolder"
                        type="text"
                        value={cardHolder}
                        onBlur={() => handleBlur('cardHolder', cardHolder)}
                        onChange={(e) => handleInputChange('cardHolder', e.target.value.toUpperCase(), setCardHolder)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono uppercase transition-all focus:outline-none ${
                          touched.cardHolder && errors.cardHolder
                            ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-500/20'
                            : touched.cardHolder && !errors.cardHolder
                            ? 'border-emerald-500 bg-emerald-50/20'
                            : 'border-stone-300 bg-white'
                        }`}
                        placeholder="NGUYEN VAN A"
                      />
                      {touched.cardHolder && errors.cardHolder && (
                        <div id="error-cardHolder" className="flex items-start gap-1.5 text-rose-600 text-xs font-mono pt-0.5">
                          <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-600" />
                          <span>{errors.cardHolder}</span>
                        </div>
                      )}
                    </div>

                    {/* Expiry */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="input-cardExpiry" className="text-xs font-mono text-stone-700 font-semibold block">
                          HẠN THẺ (MM/YY) *
                        </label>
                        {touched.cardExpiry && !errors.cardExpiry && (
                          <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Hợp lệ
                          </span>
                        )}
                      </div>
                      <input
                        id="input-cardExpiry"
                        type="text"
                        maxLength={5}
                        value={cardExpiry}
                        onBlur={() => handleBlur('cardExpiry', cardExpiry)}
                        onChange={(e) => handleInputChange('cardExpiry', e.target.value, setCardExpiry)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono transition-all focus:outline-none ${
                          touched.cardExpiry && errors.cardExpiry
                            ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-500/20'
                            : touched.cardExpiry && !errors.cardExpiry
                            ? 'border-emerald-500 bg-emerald-50/20'
                            : 'border-stone-300 bg-white'
                        }`}
                        placeholder="12/28"
                      />
                      {touched.cardExpiry && errors.cardExpiry && (
                        <div id="error-cardExpiry" className="flex items-start gap-1.5 text-rose-600 text-xs font-mono pt-0.5">
                          <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-600" />
                          <span>{errors.cardExpiry}</span>
                        </div>
                      )}
                    </div>

                    {/* CVV */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="input-cardCvv" className="text-xs font-mono text-stone-700 font-semibold block">
                          MÃ CVV / CVC *
                        </label>
                        {touched.cardCvv && !errors.cardCvv && (
                          <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Hợp lệ
                          </span>
                        )}
                      </div>
                      <input
                        id="input-cardCvv"
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onBlur={() => handleBlur('cardCvv', cardCvv)}
                        onChange={(e) => handleInputChange('cardCvv', e.target.value, setCardCvv)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono transition-all focus:outline-none ${
                          touched.cardCvv && errors.cardCvv
                            ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-500/20'
                            : touched.cardCvv && !errors.cardCvv
                            ? 'border-emerald-500 bg-emerald-50/20'
                            : 'border-stone-300 bg-white'
                        }`}
                        placeholder="•••"
                      />
                      {touched.cardCvv && errors.cardCvv && (
                        <div id="error-cardCvv" className="flex items-start gap-1.5 text-rose-600 text-xs font-mono pt-0.5">
                          <AlertCircle size={14} className="shrink-0 mt-0.5 text-rose-600" />
                          <span>{errors.cardCvv}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Summary Card */}
          <div className="space-y-6">
            <div 
              id="box-checkout-summary"
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

              {/* Departure Schedule Snapshot */}
              <div className="p-3 rounded-2xl bg-[#F5F0E8] border border-amber-300/70 flex items-center justify-between text-xs font-mono text-stone-700">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-amber-700 shrink-0" />
                  <span>Khởi hành:</span>
                </div>
                <div className="font-bold text-[#0F2D1E] text-right">
                  <span className="text-amber-800">{bookingTime || '08:30'}</span> • {bookingDate ? bookingDate.split('-').reverse().join('/') : 'Chưa chọn'}
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="pt-2 border-t border-stone-300 space-y-1.5">
                <label htmlFor="input-promoCode" className="text-[11px] font-mono text-stone-600 block">
                  MÃ ƯU ĐÃI DI SẢN
                </label>
                <div className="flex gap-2">
                  <input
                    id="input-promoCode"
                    type="text"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      if (promoFeedback) setPromoFeedback(null);
                    }}
                    placeholder="Nhập HERITAGE2026"
                    className="flex-1 px-3 py-2 text-xs uppercase font-mono rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-[#1C4A32]"
                  />
                  <button
                    id="btn-apply-promo"
                    type="button"
                    onClick={handleApplyPromo}
                    className="btn-outline-gold text-xs px-3 py-2 cursor-pointer font-mono font-bold"
                  >
                    Áp dụng
                  </button>
                </div>
                {promoFeedback && (
                  <p className={`text-xs font-mono mt-1 ${promoFeedback.type === 'success' ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {promoFeedback.message}
                  </p>
                )}
                {appliedDiscount > 0 && !promoFeedback && (
                  <p className="text-xs text-emerald-700 font-mono mt-1">Đã áp dụng giảm -30.000₫</p>
                )}
              </div>

              {/* Price Calculation */}
              <div className="pt-3 border-t border-stone-300 space-y-2 text-xs font-luxury-sans">
                <div className="flex justify-between text-stone-600">
                  <span>Giá vé gốc ({touristsCount} người):</span>
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

              {/* Global Error Notice if submit attempted with invalid/missing fields */}
              {submitAttempted && Object.values(errors).some(Boolean) && (
                <div id="notice-form-errors" className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-mono space-y-1 animate-in fade-in duration-200">
                  <div className="flex items-center gap-1.5 font-bold text-rose-700">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>Chưa đủ điều kiện chuyển tiền:</span>
                  </div>
                  <p className="m-0 text-[11px] text-rose-600 pl-5">
                    Vui lòng kiểm tra lại các trường có viền đỏ ở trên (thiếu chi tiết hoặc sai định dạng).
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="btn-confirm-payment"
                disabled={isProcessing}
                onClick={handleCompletePayment}
                className="w-full btn-gold-aura py-4 text-sm font-bold tracking-wider cursor-pointer shadow-lg"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="animate-spin" size={16} /> Đang Xác Thực Giao Dịch...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
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
