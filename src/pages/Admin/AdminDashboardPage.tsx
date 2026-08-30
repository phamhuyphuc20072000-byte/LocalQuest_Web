import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Award, 
  MapPin, 
  DollarSign, 
  Eye, 
  Trash2, 
  Sparkles, 
  Users, 
  Activity,
  Layers,
  ArrowRight,
  Landmark,
  UserCheck,
  UserX,
  Volume2,
  VolumeX,
  Play,
  Pause,
  QrCode,
  Search,
  Check,
  AlertCircle,
  FileText,
  Compass,
  CreditCard,
  Building2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Camera,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useQuest } from '../../context/QuestContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../data/quests';
import { Quest, Waypoint, Ticket } from '../../types';
import { subscribeAllTicketsLive, processQrCheckIn, QrCheckInResult } from '../../services/ticketService';

export function AdminDashboardPage() {
  const { 
    quests, 
    pendingReviews, 
    approvePendingReview, 
    rejectPendingReview, 
    removeQuest,
    pendingGuides,
    approveGuide,
    rejectGuide,
    pendingWithdrawals,
    approveWithdrawal,
    rejectWithdrawal,
    setActivePage,
    navigateToQuestDetail,
    playAudio
  } = useQuest();

  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'guides' | 'quests' | 'withdrawals' | 'tickets' | 'catalog'>('guides');

  // Selected Quest for Deep Inspection Modal / Accordion
  const [inspectedQuest, setInspectedQuest] = useState<Quest | null>(null);
  
  // Realtime Live Tickets Subscription for Redemption Engine
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [ticketSearchQuery, setTicketSearchQuery] = useState('');
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [isProcessingCheckIn, setIsProcessingCheckIn] = useState(false);
  const [checkInResult, setCheckInResult] = useState<QrCheckInResult | null>(null);

  // Audio Testing in Admin Console
  const [playingAudioWaypointId, setPlayingAudioWaypointId] = useState<number | null>(null);

  // Transfer Slip Modal
  const [selectedWithdrawalForSlip, setSelectedWithdrawalForSlip] = useState<any | null>(null);

  // Feedback Toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    const unsubTickets = subscribeAllTicketsLive((tList) => {
      if (tList) {
        setAllTickets(tList);
      }
    });

    return () => {
      unsubTickets();
    };
  }, []);

  // Handle Guide Approval
  const handleApproveGuide = async (guideId: number | string, name: string) => {
    await approveGuide(guideId);
    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch (e) {
      // ignore
    }
    showToast(`Đã phê duyệt nghệ nhân "${name}" thành công! Quyền Guide Studio đã được kích hoạt.`);
  };

  // Handle Guide Rejection
  const handleRejectGuide = async (guideId: number | string, name: string) => {
    await rejectGuide(guideId);
    showToast(`Đã từ chối hồ sơ "${name}".`);
  };

  // Handle Quest Approval (Publish to Tourist Explore)
  const handleApproveQuest = async (questId: number | string, title: string) => {
    await approvePendingReview(questId);
    if (inspectedQuest?.id === questId) {
      setInspectedQuest(null);
    }
    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
    } catch (e) {
      // ignore
    }
    showToast(`Đã xuất bản tour di sản "${title}" lên trang chủ và bản đồ số!`);
  };

  // Handle Quest Rejection
  const handleRejectQuest = async (questId: number | string, title: string) => {
    await rejectPendingReview(questId);
    if (inspectedQuest?.id === questId) {
      setInspectedQuest(null);
    }
    showToast(`Đã từ chối tour "${title}".`);
  };

  // Handle Withdrawal Approval
  const handleApproveWithdrawal = async (w: any) => {
    await approveWithdrawal(w.id);
    setSelectedWithdrawalForSlip({
      ...w,
      transId: `NAPAS247-${Date.now().toString().slice(-8)}`,
      processedTime: new Date().toLocaleString('vi-VN')
    });
    try {
      confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 } });
    } catch (e) {
      // ignore
    }
    showToast(`Đã duyệt lệnh rút ${formatPrice(w.amount)} cho ${w.guide}. Lịch sử giao dịch đã được ghi vào sổ cái Firestore.`);
  };

  // Handle Withdrawal Rejection
  const handleRejectWithdrawal = async (w: any) => {
    await rejectWithdrawal(w.id);
    showToast(`Đã từ chối lệnh rút tiền #${w.id}.`);
  };

  // Live Audio TTS Preview for Waypoint Script
  const handleTestAudio = (wp: Waypoint, questTitle: string) => {
    if (playingAudioWaypointId === wp.id) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setPlayingAudioWaypointId(null);
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const clean = wp.script.replace(/[*#_`]/g, '');
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = 'vi-VN';
        utterance.rate = 1.0;
        utterance.onend = () => setPlayingAudioWaypointId(null);
        utterance.onerror = () => setPlayingAudioWaypointId(null);
        window.speechSynthesis.speak(utterance);
      }
      setPlayingAudioWaypointId(wp.id);
    }
  };

  // Admin Ticket Redemption / QR Check-in
  const handleAdminTicketCheckIn = async (codeToVerify: string) => {
    if (!codeToVerify.trim()) return;

    setIsProcessingCheckIn(true);
    setCheckInResult(null);

    try {
      const result = await processQrCheckIn(codeToVerify.trim(), 'admin-console', 'Hội Đồng Quản Trị LocalQuest');
      setCheckInResult(result);
      setIsProcessingCheckIn(false);

      if (result.success) {
        try {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        } catch (e) {
          // ignore
        }
        showToast(result.message);
        setQrCodeInput('');
      }
    } catch (err: any) {
      setIsProcessingCheckIn(false);
      setCheckInResult({
        success: false,
        message: 'Lỗi xác thực vé: ' + (err?.message || 'Không thể kết nối máy chủ.')
      });
    }
  };

  // Filtered Tickets
  const filteredTickets = allTickets.filter((t) => {
    if (!ticketSearchQuery.trim()) return true;
    const q = ticketSearchQuery.toLowerCase();
    return (
      t.ticketCode.toLowerCase().includes(q) ||
      t.questName.toLowerCase().includes(q) ||
      t.buyerName.toLowerCase().includes(q) ||
      t.buyerEmail?.toLowerCase().includes(q) ||
      t.buyerPhone?.toLowerCase().includes(q)
    );
  });

  const pendingGuidesCount = pendingGuides.filter((g) => g.status === 'pending').length;
  const pendingQuestsCount = pendingReviews.length;
  const pendingWithdrawalsCount = pendingWithdrawals.filter((w) => w.status === 'pending').length;

  return (
    <div className="min-h-screen pb-24 space-y-8 bg-[#FAF8F5]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="px-5 py-3.5 rounded-2xl bg-[#0F2D1E] border border-amber-400 text-amber-200 text-xs font-mono font-bold shadow-2xl flex items-center gap-3">
            <CheckCircle2 size={18} className="text-amber-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Admin Hero Command Header */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8 text-white" style={{
        background: 'linear-gradient(180deg, #0A2015 0%, #0F2D1E 60%, #153826 100%)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.4)'
      }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">
              <Shield size={16} className="text-amber-400" />
              <span>COMMAND CENTER • BAN QUẢN TRỊ & THẨM ĐỊNH DI SẢN</span>
            </div>
            <h1 className="font-heritage text-3xl sm:text-4xl font-bold gold-gradient-text m-0">
              Cổng Quản Trị Hệ Thống Realtime
            </h1>
            <p className="text-stone-300 font-luxury-sans text-xs sm:text-sm m-0 max-w-3xl">
              Đồng bộ dữ liệu thời gian thực với Cloud Firestore. Quản lý kiểm duyệt Local Guide, thẩm định lộ trình Tour di sản, duyệt giải ngân Napas247 và cứu hộ soát vé du khách.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActivePage('EXPLORE')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-stone-200 text-xs font-mono font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Compass size={15} className="text-amber-400" />
              <span>Cổng Du Khách</span>
            </button>
            <button
              onClick={() => setActivePage('GUIDE_STUDIO')}
              className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-300 text-xs font-mono font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Award size={15} />
              <span>Guide Studio</span>
            </button>
          </div>
        </div>
      </section>

      {/* KPI Stats Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div 
            onClick={() => setActiveTab('guides')}
            className={`p-5 rounded-2xl bg-[#FDFAF5] border transition-all cursor-pointer shadow-sm hover:shadow-md space-y-1 ${
              activeTab === 'guides' ? 'border-amber-500 ring-2 ring-amber-400/20' : 'border-stone-300/80'
            }`}
          >
            <div className="flex items-center justify-between text-stone-500 font-mono text-xs">
              <span>HỒ SƠ GUIDE CHỜ DUYỆT</span>
              <Users size={16} className="text-amber-600" />
            </div>
            <h3 className="font-heritage text-2xl font-bold text-stone-900 m-0">
              {pendingGuidesCount} Nghệ Nhân
            </h3>
            <span className="text-[10px] text-amber-700 font-mono font-bold flex items-center gap-1">
              <Activity size={10} /> {pendingGuides.length} tổng nghệ nhân nộp
            </span>
          </div>

          <div 
            onClick={() => setActiveTab('quests')}
            className={`p-5 rounded-2xl bg-[#FDFAF5] border transition-all cursor-pointer shadow-sm hover:shadow-md space-y-1 ${
              activeTab === 'quests' ? 'border-amber-500 ring-2 ring-amber-400/20' : 'border-stone-300/80'
            }`}
          >
            <div className="flex items-center justify-between text-stone-500 font-mono text-xs">
              <span>QUEST CHỜ THẨM ĐỊNH</span>
              <Clock size={16} className="text-amber-600" />
            </div>
            <h3 className="font-heritage text-2xl font-bold text-amber-700 m-0">
              {pendingQuestsCount} Tour
            </h3>
            <span className="text-[10px] text-stone-500 font-mono">Lộ trình & Audio AI</span>
          </div>

          <div 
            onClick={() => setActiveTab('withdrawals')}
            className={`p-5 rounded-2xl bg-[#FDFAF5] border transition-all cursor-pointer shadow-sm hover:shadow-md space-y-1 ${
              activeTab === 'withdrawals' ? 'border-amber-500 ring-2 ring-amber-400/20' : 'border-stone-300/80'
            }`}
          >
            <div className="flex items-center justify-between text-stone-500 font-mono text-xs">
              <span>LỆNH RÚT TIỀN CHỜ DUYỆT</span>
              <Landmark size={16} className="text-amber-600" />
            </div>
            <h3 className="font-heritage text-2xl font-bold text-[#C97D1A] m-0">
              {pendingWithdrawalsCount} Lệnh
            </h3>
            <span className="text-[10px] text-emerald-700 font-mono font-bold">Napas247 tự động</span>
          </div>

          <div 
            onClick={() => setActiveTab('tickets')}
            className={`p-5 rounded-2xl bg-[#FDFAF5] border transition-all cursor-pointer shadow-sm hover:shadow-md space-y-1 ${
              activeTab === 'tickets' ? 'border-amber-500 ring-2 ring-amber-400/20' : 'border-stone-300/80'
            }`}
          >
            <div className="flex items-center justify-between text-stone-500 font-mono text-xs">
              <span>SOÁT VÉ & CHECK-IN QR</span>
              <QrCode size={16} className="text-emerald-700" />
            </div>
            <h3 className="font-heritage text-2xl font-bold text-stone-900 m-0">
              {allTickets.length} Vé Phát Hành
            </h3>
            <span className="text-[10px] text-emerald-700 font-mono font-bold">Tra cứu cứu hộ trực tiếp</span>
          </div>

        </div>
      </section>

      {/* Main Tabs Navigation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation Bar */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-stone-300">
          
          <button
            onClick={() => setActiveTab('guides')}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'guides'
                ? 'bg-[#0F2D1E] text-amber-300 shadow-md border border-[#D4AF37]'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
            }`}
          >
            <Users size={15} />
            <span>Tab 1: Phê Duyệt Local Guides</span>
            {pendingGuidesCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-500 text-black text-[10px] rounded-full font-bold">
                {pendingGuidesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('quests')}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'quests'
                ? 'bg-[#0F2D1E] text-amber-300 shadow-md border border-[#D4AF37]'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
            }`}
          >
            <Clock size={15} />
            <span>Tab 2: Kiểm Duyệt Quest Mới</span>
            {pendingQuestsCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-500 text-black text-[10px] rounded-full font-bold">
                {pendingQuestsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'withdrawals'
                ? 'bg-[#0F2D1E] text-amber-300 shadow-md border border-[#D4AF37]'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
            }`}
          >
            <Landmark size={15} />
            <span>Tab 3: Quản Lý Rút Tiền</span>
            {pendingWithdrawalsCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-500 text-black text-[10px] rounded-full font-bold">
                {pendingWithdrawalsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'tickets'
                ? 'bg-[#0F2D1E] text-amber-300 shadow-md border border-[#D4AF37]'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
            }`}
          >
            <QrCode size={15} />
            <span>Soát Vé Realtime ({allTickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-[#0F2D1E] text-amber-300 shadow-md border border-[#D4AF37]'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-300'
            }`}
          >
            <Layers size={15} />
            <span>Toàn Bộ Quests ({quests.length})</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: LOCAL GUIDES APPROVAL (PHÊ DUYỆT NGHỆ NHÂN BẢN ĐỊA)                 */}
        {/* ========================================================================= */}
        {activeTab === 'guides' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heritage text-xl font-bold text-stone-900 m-0">
                  Hồ Sơ Đăng Ký Local Guide Chờ Phê Duyệt
                </h2>
                <p className="text-xs text-stone-500 font-luxury-sans mt-0.5">
                  Phê duyệt hồ sơ sẽ đổi status thành APPROVED trên Firestore và kích hoạt ngay lập tức quyền sử dụng Guide Studio cho nghệ nhân.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full">
                {pendingGuidesCount} hồ sơ chờ duyệt
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pendingGuides.map((guide) => {
                const isPending = guide.status === 'pending';
                return (
                  <div
                    key={guide.id}
                    className="p-6 rounded-3xl bg-[#FDFAF5] border border-amber-400/50 shadow-md space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                          isPending ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          {isPending ? 'CHỜ XÁC MINH' : 'ĐÃ PHÊ DUYỆT (VERIFIED)'}
                        </span>
                        <span className="text-xs font-mono text-stone-500 flex items-center gap-1">
                          <MapPin size={13} className="text-amber-600" />
                          {guide.city}
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center font-heritage font-bold text-amber-900 text-lg flex-shrink-0">
                          {guide.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-heritage text-lg font-bold text-stone-900 m-0">
                            {guide.name}
                          </h3>
                          <span className="text-xs text-stone-500 font-mono">
                            Ngày gửi: {guide.submitted || 'Gần đây'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-700 font-luxury-sans bg-white/60 p-3 rounded-xl border border-stone-200">
                        {guide.bio || 'Chuyên gia di sản văn hoá, nghiên cứu lịch sử phố cổ và ẩm thực truyền thống.'}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono text-stone-600">
                        <div className="p-2 rounded-lg bg-stone-100">
                          <span className="text-[10px] text-stone-400 block">SỐ ĐIỆN THOẠI</span>
                          <strong className="text-stone-800">{guide.phone || '0988 123 456'}</strong>
                        </div>
                        <div className="p-2 rounded-lg bg-stone-100">
                          <span className="text-[10px] text-stone-400 block">EMAIL LIÊN HỆ</span>
                          <strong className="text-stone-800 truncate block">{guide.email || 'guide@localquest.vn'}</strong>
                        </div>
                      </div>
                    </div>

                    {isPending ? (
                      <div className="pt-3 border-t border-stone-200 flex items-center gap-2">
                        <button
                          onClick={() => handleRejectGuide(guide.id, guide.name)}
                          className="flex-1 py-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 text-xs font-mono font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        >
                          <UserX size={14} />
                          <span>Từ chối</span>
                        </button>
                        <button
                          onClick={() => handleApproveGuide(guide.id, guide.name)}
                          className="flex-1 btn-gold-aura py-2.5 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <UserCheck size={14} />
                          <span>Phê Duyệt Nghệ Nhân</span>
                        </button>
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs font-mono text-emerald-700 font-bold">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={15} /> Đã kích hoạt Guide Studio
                        </span>
                        <span className="text-stone-400 text-[10px]">Tài khoản hợp lệ</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: QUEST MODERATION (KIỂM DUYỆT QUEST MỚI & THẨM ĐỊNH TRẠM DỪNG)      */}
        {/* ========================================================================= */}
        {activeTab === 'quests' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heritage text-xl font-bold text-stone-900 m-0">
                  Kiểm Duyệt Hành Trình Khám Phá Mới
                </h2>
                <p className="text-xs text-stone-500 font-luxury-sans mt-0.5">
                  Thẩm định kịch bản thuyết minh lịch sử, tọa độ trạm dừng thực tế và thử giọng đọc AI TTS trước khi xuất bản ra trang chủ.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full">
                {pendingReviews.length} quest chờ duyệt
              </span>
            </div>

            {pendingReviews.length === 0 ? (
              <div className="text-center py-16 rounded-3xl bg-[#FDFAF5] border border-dashed border-stone-300 p-8 space-y-3">
                <CheckCircle2 size={44} className="mx-auto text-emerald-600 opacity-60" />
                <h3 className="font-heritage text-lg font-bold text-stone-800 m-0">
                  Hàng đợi kiểm duyệt Quest đang trống!
                </h3>
                <p className="text-xs text-stone-500 font-luxury-sans m-0 max-w-md mx-auto">
                  Tất cả các tour do nghệ nhân gửi lên đã được thẩm định và phê duyệt lên hệ thống Firestore.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {pendingReviews.map((quest) => (
                  <div
                    key={quest.id}
                    className="p-6 rounded-3xl bg-[#FDFAF5] border border-amber-400/60 shadow-lg space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                      
                      <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <img 
                          src={quest.imageId} 
                          alt={quest.name}
                          className="w-full sm:w-36 h-36 rounded-2xl object-cover border border-amber-400/40 shadow-sm flex-shrink-0"
                        />
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-mono text-[10px] font-bold border border-amber-300">
                              CHỜ PHÊ DUYỆT
                            </span>
                            <span className="text-xs font-mono text-stone-500 font-semibold">{quest.city}</span>
                            <span className="text-xs font-mono text-amber-700">• {quest.theme}</span>
                          </div>

                          <h3 className="font-heritage text-xl font-bold text-[#0F2D1E] m-0">
                            {quest.name}
                          </h3>

                          <p className="text-xs text-stone-600 font-luxury-sans line-clamp-2 m-0">
                            {quest.teaser}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-stone-600 pt-1">
                            <span>Tác giả: <strong className="text-stone-800">{quest.guideName}</strong></span>
                            <span>Trạm dừng: <strong className="text-stone-800">{quest.waypoints ? quest.waypoints.length : 0} trạm</strong></span>
                            <span>Giá: <strong className="text-[#C97D1A] font-bold">{formatPrice(quest.price)}</strong></span>
                            <span>Thời lượng: <strong>{quest.walkTime}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center justify-end gap-2 flex-shrink-0">
                        <button
                          onClick={() => setInspectedQuest(inspectedQuest?.id === quest.id ? null : quest)}
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-mono font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                        >
                          <FileText size={14} className="text-amber-600" />
                          <span>{inspectedQuest?.id === quest.id ? 'Thu gọn' : 'Thẩm định trạm dừng'}</span>
                        </button>

                        <div className="flex items-center gap-2 w-full">
                          <button
                            onClick={() => handleRejectQuest(quest.id, quest.name)}
                            className="flex-1 px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 text-xs font-mono font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <XCircle size={14} />
                            <span>Từ chối</span>
                          </button>

                          <button
                            onClick={() => handleApproveQuest(quest.id, quest.name)}
                            className="flex-1 btn-gold-aura py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <CheckCircle2 size={14} />
                            <span>Xuất Bản Tour</span>
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* DEEP WAYPOINTS INSPECTOR */}
                    {inspectedQuest?.id === quest.id && (
                      <div className="mt-4 pt-4 border-t border-stone-300/80 space-y-4 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <h4 className="font-heritage text-sm font-bold text-stone-900 flex items-center gap-2 m-0">
                            <Compass size={16} className="text-amber-600" />
                            <span>Chi Tiết Lộ Trình {quest.waypoints?.length || 0} Trạm Dừng Thực Địa</span>
                          </h4>
                          <span className="text-[11px] font-mono text-stone-500">
                            Thử nghiệm trực tiếp kịch bản & Audio TTS
                          </span>
                        </div>

                        <div className="space-y-3">
                          {quest.waypoints?.map((wp, idx) => (
                            <div 
                              key={wp.id || idx}
                              className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-3"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-[#0F2D1E] text-amber-300 font-mono text-xs font-bold flex items-center justify-center">
                                    {idx + 1}
                                  </span>
                                  <h5 className="font-heritage text-sm font-bold text-stone-900 m-0">
                                    {wp.name}
                                  </h5>
                                  <span className="text-[11px] font-mono text-stone-400">
                                    ({wp.lat.toFixed(4)}, {wp.lng.toFixed(4)})
                                  </span>
                                </div>

                                <button
                                  onClick={() => handleTestAudio(wp, quest.name)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                    playingAudioWaypointId === wp.id
                                      ? 'bg-amber-500 text-black border border-amber-600'
                                      : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
                                  }`}
                                >
                                  {playingAudioWaypointId === wp.id ? (
                                    <>
                                      <Pause size={13} />
                                      <span>Đang phát thử...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Volume2 size={13} />
                                      <span>Nghe thử Audio AI</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              <p className="text-xs text-stone-700 font-luxury-sans bg-stone-50 p-3 rounded-xl border border-stone-200 m-0">
                                <strong>Lời dẫn thuyết minh:</strong> {wp.script}
                              </p>

                              {wp.question && (
                                <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-xs font-mono space-y-1.5">
                                  <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">
                                    CÂU ĐỐ TƯƠNG TÁC THỰC ĐỊA
                                  </span>
                                  <p className="text-stone-900 font-semibold m-0">{wp.question}</p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                                    {wp.answers?.map((ans, aIdx) => (
                                      <div 
                                        key={aIdx}
                                        className={`p-1.5 px-2.5 rounded-lg text-[11px] border ${
                                          aIdx === wp.correct 
                                            ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold' 
                                            : 'bg-white text-stone-600 border-stone-200'
                                        }`}
                                      >
                                        {String.fromCharCode(65 + aIdx)}. {ans} {aIdx === wp.correct && '✓ (Đáp án đúng)'}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {wp.photoSpotPrompt && (
                                <div className="flex items-center gap-2 text-xs font-mono text-stone-600 bg-stone-100 p-2 rounded-lg">
                                  <Camera size={14} className="text-amber-700 flex-shrink-0" />
                                  <span>Thử thách chụp ảnh: <strong>{wp.photoSpotPrompt}</strong></span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: WITHDRAWAL MANAGEMENT (QUẢN LÝ LỆNH RÚT TIỀN NAPAS247)             */}
        {/* ========================================================================= */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heritage text-xl font-bold text-stone-900 m-0">
                  Quản Lý Yêu Cầu Rút Doanh Thu Nghệ Nhân
                </h2>
                <p className="text-xs text-stone-500 font-luxury-sans mt-0.5">
                  Duyệt chuyển khoản tự động qua cổng Napas247, tự động trừ số dư ví và lưu chứng từ kế toán vào Firestore.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full">
                {pendingWithdrawalsCount} lệnh chờ duyệt
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pendingWithdrawals.map((w) => {
                const isPending = w.status === 'pending';
                return (
                  <div
                    key={w.id}
                    className="p-6 rounded-3xl bg-[#FDFAF5] border border-amber-400/50 shadow-md space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                          isPending ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          {isPending ? 'CHỜ XÁC NHẬN NAPAS247' : 'ĐÃ CHUYỂN KHOẢN (COMPLETED)'}
                        </span>
                        <span className="text-xs font-mono text-stone-500">{w.requested}</span>
                      </div>

                      <div className="flex items-baseline justify-between">
                        <h3 className="font-heritage text-lg font-bold text-stone-900 m-0">
                          {w.guide}
                        </h3>
                        <span className="font-heritage text-2xl font-bold font-mono text-[#C97D1A]">
                          {formatPrice(w.amount)}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-white border border-stone-200 text-xs font-mono text-stone-700 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-400">NGÂN HÀNG NHẬN:</span>
                          <strong className="text-stone-900">{w.bank}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-stone-400">SỐ TÀI KHOẢN:</span>
                          <strong className="text-stone-900">{w.account}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-stone-400">CHỦ TÀI KHOẢN:</span>
                          <strong className="text-stone-900">{w.guide}</strong>
                        </div>
                      </div>
                    </div>

                    {isPending ? (
                      <div className="pt-3 border-t border-stone-200 flex items-center gap-2">
                        <button
                          onClick={() => handleRejectWithdrawal(w)}
                          className="flex-1 py-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 text-xs font-mono font-semibold transition-colors cursor-pointer"
                        >
                          Từ chối
                        </button>
                        <button
                          onClick={() => handleApproveWithdrawal(w)}
                          className="flex-2 btn-gold-aura py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CreditCard size={15} />
                          <span>Duyệt Chuyển Tiền Napas247</span>
                        </button>
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-xs font-mono text-emerald-700 font-bold">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={15} /> Giao dịch thành công
                        </span>
                        <button
                          onClick={() => setSelectedWithdrawalForSlip({
                            ...w,
                            transId: `NAPAS247-${w.id}`,
                            processedTime: 'Gần đây'
                          })}
                          className="text-amber-800 hover:underline cursor-pointer"
                        >
                          Xem chứng từ →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: REALTIME TICKET REDEMPTION & QR CHECK-IN (SOÁT VÉ & CỨU HỘ DU KHÁCH) */}
        {/* ========================================================================= */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-heritage text-xl font-bold text-stone-900 m-0">
                  Cổng Soát Vé & Tra Cứu Cứu Hộ Du Khách
                </h2>
                <p className="text-xs text-stone-500 font-luxury-sans mt-0.5">
                  Xác thực mã vé QR thực địa, kích hoạt trả lời trạm dừng, trao thưởng +100 LocalCoins và giải ngân 85% cho Guide.
                </p>
              </div>

              {/* Direct QR / Code Scanner Input */}
              <div className="flex items-center gap-2 max-w-md w-full">
                <div className="relative flex-1">
                  <QrCode size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-600" />
                  <input
                    type="text"
                    value={qrCodeInput}
                    onChange={(e) => setQrCodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAdminTicketCheckIn(qrCodeInput);
                    }}
                    placeholder="Quét mã QR hoặc nhập mã vé..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-amber-500/50 bg-white text-xs font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <button
                  onClick={() => handleAdminTicketCheckIn(qrCodeInput)}
                  disabled={isProcessingCheckIn || !qrCodeInput.trim()}
                  className="btn-gold-aura py-2.5 px-4 text-xs font-bold cursor-pointer whitespace-nowrap"
                >
                  {isProcessingCheckIn ? 'Đang duyệt...' : 'Soát Vé'}
                </button>
              </div>
            </div>

            {/* Check-in Outcome Alert Banner */}
            {checkInResult && (
              <div className={`p-4 rounded-2xl border text-xs font-mono flex items-start gap-3 animate-in fade-in duration-200 ${
                checkInResult.success 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}>
                {checkInResult.success ? (
                  <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-1">
                  <p className="font-bold m-0">{checkInResult.message}</p>
                  {checkInResult.success && checkInResult.guideEarnings && (
                    <p className="text-emerald-700 m-0">
                      Đã ghi nhận +{formatPrice(checkInResult.guideEarnings)} vào ví Guide & cộng 100 LocalCoins vào hộ chiếu du khách.
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setCheckInResult(null)}
                  className="text-stone-400 hover:text-stone-700"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Search Filter for Tickets */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={ticketSearchQuery}
                  onChange={(e) => setTicketSearchQuery(e.target.value)}
                  placeholder="Lọc theo mã vé, tên du khách, email, SĐT..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-200 text-xs font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
              <span className="text-xs font-mono text-stone-500">
                Hiển thị <strong>{filteredTickets.length}</strong> / {allTickets.length} vé
              </span>
            </div>

            {/* Tickets Table */}
            <div className="rounded-3xl bg-[#FDFAF5] border border-stone-300/80 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-luxury-sans">
                  <thead className="bg-[#0F2D1E] text-amber-300 font-mono text-[11px] uppercase border-b border-amber-500/30">
                    <tr>
                      <th className="p-4">Mã Vé & QR</th>
                      <th className="p-4">Hành Trình</th>
                      <th className="p-4">Du Khách</th>
                      <th className="p-4">Giá Vé</th>
                      <th className="p-4">Trạng Thái</th>
                      <th className="p-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-stone-800">
                    {filteredTickets.map((t) => {
                      const isCompleted = t.status === 'completed' || t.status === 'used';
                      return (
                        <tr key={t.id} className="hover:bg-amber-50/50 transition-colors">
                          <td className="p-4 font-mono font-bold text-amber-900">
                            <div>{t.ticketCode}</div>
                            <span className="text-[10px] text-stone-500 font-normal">{t.purchaseDate}</span>
                          </td>
                          <td className="p-4">
                            <div className="font-heritage font-bold text-stone-900">{t.questName}</div>
                            <span className="text-[10px] text-stone-500 font-mono">{t.city} • {t.touristsCount} người</span>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-stone-900">{t.buyerName}</div>
                            <span className="text-[10px] text-stone-500 font-mono">{t.buyerPhone || t.buyerEmail}</span>
                          </td>
                          <td className="p-4 font-mono font-bold text-[#C97D1A]">
                            {formatPrice(t.price)}
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-blue-100 text-blue-800 border-blue-300'
                            }`}>
                              {isCompleted ? 'ĐÃ CHECK-IN' : 'HỢP LỆ (CHƯA ĐI)'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {!isCompleted ? (
                              <button
                                onClick={() => handleAdminTicketCheckIn(t.qrPayload || t.id)}
                                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-900 font-mono text-xs font-bold transition-colors cursor-pointer"
                              >
                                Soát Vé Ngay
                              </button>
                            ) : (
                              <span className="text-xs font-mono text-emerald-700 font-bold">
                                ✓ Hoàn tất
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: CATALOG MASTER (QUẢN LÝ TOÀN BỘ DANH MỤC QUESTS)                     */}
        {/* ========================================================================= */}
        {activeTab === 'catalog' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heritage text-xl font-bold text-stone-900 m-0">
                  Danh Mục Quests Đang Hoạt Động Trên Hệ Thống
                </h2>
                <p className="text-xs text-stone-500 font-luxury-sans mt-0.5">
                  Tổng cộng {quests.length} nhiệm vụ di sản đang được mở bán trên toàn quốc.
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-[#FDFAF5] border border-stone-300/80 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-luxury-sans">
                  <thead className="bg-[#0F2D1E] text-amber-300 font-mono text-[11px] uppercase border-b border-amber-500/30">
                    <tr>
                      <th className="p-4">Nhiệm Vụ (Quest)</th>
                      <th className="p-4">Thành Phố</th>
                      <th className="p-4">Tác Giả</th>
                      <th className="p-4">Giá Vé</th>
                      <th className="p-4">Đánh Giá</th>
                      <th className="p-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-stone-800">
                    {quests.map((q) => (
                      <tr key={q.id} className="hover:bg-amber-50/50 transition-colors">
                        <td className="p-4">
                          <div className="font-heritage font-bold text-stone-900 text-sm">{q.name}</div>
                          <span className="text-[10px] text-stone-500 font-mono">{q.waypoints ? q.waypoints.length : 0} trạm dừng • {q.theme}</span>
                        </td>
                        <td className="p-4 font-mono font-semibold">{q.city}</td>
                        <td className="p-4 font-semibold">{q.guideName}</td>
                        <td className="p-4 font-mono font-bold text-[#C97D1A]">{formatPrice(q.price)}</td>
                        <td className="p-4 font-mono">⭐ {q.rating} ({q.reviews})</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigateToQuestDetail(q)}
                              className="p-1.5 rounded-lg text-stone-600 hover:text-amber-800 hover:bg-white cursor-pointer"
                              title="Xem chi tiết"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Bạn có chắc chắn muốn xoá nhiệm vụ "${q.name}"?`)) {
                                  removeQuest(q.id);
                                  showToast(`Đã gỡ tour "${q.name}".`);
                                }
                              }}
                              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-white cursor-pointer"
                              title="Gỡ nhiệm vụ"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </section>

      {/* Napas247 Transfer Receipt Modal */}
      {selectedWithdrawalForSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-[#FDFAF5] border border-amber-400 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2 text-emerald-800 font-mono text-xs font-bold">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span>CHỨNG TỪ CHUYỂN KHOẢN NAPAS247</span>
              </div>
              <button
                onClick={() => setSelectedWithdrawalForSlip(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-stone-200 text-xs font-mono space-y-2 text-stone-800">
              <div className="flex justify-between">
                <span className="text-stone-400">MÃ GIAO DỊCH:</span>
                <strong>{selectedWithdrawalForSlip.transId}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">NGƯỜI THỤ HƯỞNG:</span>
                <strong>{selectedWithdrawalForSlip.guide}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">NGÂN HÀNG:</span>
                <strong>{selectedWithdrawalForSlip.bank}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">SỐ TÀI KHOẢN:</span>
                <strong>{selectedWithdrawalForSlip.account}</strong>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-stone-100">
                <span className="text-stone-400">SỐ TIỀN:</span>
                <strong className="text-[#C97D1A] font-bold">{formatPrice(selectedWithdrawalForSlip.amount)}</strong>
              </div>
              <div className="flex justify-between text-[11px] text-emerald-700 font-bold">
                <span>TRẠNG THÁI:</span>
                <span>HOÀN TẤT THÀNH CÔNG (24/7)</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedWithdrawalForSlip(null)}
              className="w-full btn-gold-aura py-2.5 text-xs font-bold cursor-pointer"
            >
              Đóng Chứng Từ
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
