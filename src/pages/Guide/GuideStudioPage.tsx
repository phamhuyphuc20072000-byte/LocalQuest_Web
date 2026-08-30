import React, { useState } from 'react';
import { 
  PlusCircle, 
  Wallet, 
  Sparkles, 
  MapPin, 
  Clock, 
  Award, 
  Users, 
  Eye, 
  DollarSign, 
  ArrowRight,
  Edit,
  TrendingUp,
  QrCode,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useQuest } from '../../context/QuestContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, img } from '../../data/quests';
import { ThemeBadge, DifficultyBadge } from '../../components/common/Badges';
import { processQrCheckIn, QrCheckInResult } from '../../services/ticketService';

export function GuideStudioPage() {
  const { quests, setActivePage, navigateToQuestDetail } = useQuest();
  const { userProfile } = useAuth();

  // QR Scanner Modal State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInResult, setCheckInResult] = useState<QrCheckInResult | null>(null);

  // Filter quests published or matching guide
  const myQuests = quests;

  const handleScanOrSubmitQr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInput.trim()) return;

    setIsCheckingIn(true);
    setCheckInResult(null);

    const guideId = userProfile?.uid || 'guide-001';
    const guideName = userProfile?.displayName || 'Hoàng Đức Thành';

    try {
      const result = await processQrCheckIn(qrInput.trim(), guideId, guideName);
      setCheckInResult(result);
      setIsCheckingIn(false);

      if (result.success) {
        try {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore
        }
      }
    } catch (err: any) {
      setIsCheckingIn(false);
      setCheckInResult({
        success: false,
        message: 'Lỗi kiểm tra vé: ' + (err?.message || 'Không thể kết nối máy chủ.')
      });
    }
  };

  return (
    <div className="min-h-screen pb-24 space-y-10">
      
      {/* Studio Header */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8 text-white" style={{
        background: 'linear-gradient(180deg, #0F2D1E 0%, #153826 100%)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.3)'
      }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-300 font-bold uppercase tracking-wider">
              <Award size={16} className="text-amber-400" />
              <span>LOCAL GUIDE CREATOR STUDIO</span>
            </div>
            <h1 className="font-heritage text-3xl sm:text-4xl font-bold gold-gradient-text m-0">
              Không Gian Sáng Tạo Nghệ Nhân
            </h1>
            <p className="text-stone-300 font-luxury-sans text-xs sm:text-sm m-0">
              Xin chào <strong>{userProfile?.displayName || 'Nghệ Nhân Di Sản'}</strong>! Quản lý các nhiệm vụ thực địa và theo dõi doanh thu của bạn.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="px-5 py-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-300 text-xs font-mono font-bold flex items-center gap-2 transition-colors shadow-md"
            >
              <QrCode size={16} />
              <span>Soát Vé QR Thực Địa</span>
            </button>

            <button
              onClick={() => setActivePage('GUIDE_WALLET')}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-stone-400/40 text-stone-200 text-xs font-mono font-bold flex items-center gap-2 transition-colors shadow-md"
            >
              <Wallet size={16} />
              <span>Ví Doanh Thu</span>
            </button>

            <button
              onClick={() => setActivePage('QUEST_CREATOR')}
              className="btn-gold-aura py-3 px-6 text-xs"
            >
              <PlusCircle size={16} />
              <span>TẠO QUEST MỚI NGAY</span>
            </button>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-[#FDFAF5] border border-stone-300/80 shadow-md space-y-1">
            <div className="flex items-center justify-between text-stone-500 font-mono text-xs">
              <span>TỔNG DOANH THU</span>
              <DollarSign size={16} className="text-amber-600" />
            </div>
            <h3 className="font-heritage text-2xl font-bold text-[#C97D1A] m-0">
              18.450.000₫
            </h3>
            <span className="text-[10px] text-emerald-700 font-mono flex items-center gap-1 font-bold">
              <TrendingUp size={12} /> Hưởng 85% doanh thu vé
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-[#FDFAF5] border border-stone-300/80 shadow-md space-y-1">
            <div className="flex items-center justify-between text-stone-500 font-mono text-xs">
              <span>SỐ QUEST ĐÃ XUẤT BẢN</span>
              <Award size={16} className="text-amber-600" />
            </div>
            <h3 className="font-heritage text-2xl font-bold text-stone-900 m-0">
              {myQuests.length} Quest
            </h3>
            <span className="text-[10px] text-stone-500 font-mono">Đã đồng bộ realtime</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#FDFAF5] border border-stone-300/80 shadow-md space-y-1">
            <div className="flex items-center justify-between text-stone-500 font-mono text-xs">
              <span>LƯỢT DU KHÁCH ĐÃ CHƠI</span>
              <Users size={16} className="text-amber-600" />
            </div>
            <h3 className="font-heritage text-2xl font-bold text-stone-900 m-0">
              480 Người
            </h3>
            <span className="text-[10px] text-stone-500 font-mono">Đã check-in thực tế</span>
          </div>

          <div className="p-5 rounded-2xl bg-[#FDFAF5] border border-stone-300/80 shadow-md space-y-1">
            <div className="flex items-center justify-between text-stone-500 font-mono text-xs">
              <span>ĐÁNH GIÁ TRUNG BÌNH</span>
              <Sparkles size={16} className="text-amber-600" />
            </div>
            <h3 className="font-heritage text-2xl font-bold text-stone-900 m-0">
              4.95 / 5.0 ⭐
            </h3>
            <span className="text-[10px] text-stone-500 font-mono">Xếp hạng Local Guide Kim Cương</span>
          </div>

        </div>
      </section>

      {/* Quest Management Catalog */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heritage text-2xl font-bold text-stone-900 m-0">
            Danh Sách Nhiệm Vụ Của Bạn ({myQuests.length})
          </h2>
          <button
            onClick={() => setActivePage('QUEST_CREATOR')}
            className="btn-emerald-luxury text-xs px-4 py-2"
          >
            <PlusCircle size={14} />
            <span>Thêm Nhiệm Vụ Mới</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myQuests.map((quest) => (
            <div
              key={quest.id}
              className="rounded-3xl overflow-hidden bg-[#FDFAF5] border border-[#D4AF37]/40 shadow-lg flex flex-col justify-between"
            >
              <div className="relative h-48">
                <img
                  src={img(quest.imageId, 600, 400)}
                  alt={quest.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-900 text-amber-300 font-mono text-[10px] font-bold border border-amber-400">
                    ĐÃ PHÊ DUYỆT • ĐANG MỞ BÁN
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/70 text-amber-300 font-mono text-xs font-bold">
                  {formatPrice(quest.price)}
                </div>
              </div>

              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-stone-500 mb-1">
                    <span>{quest.city}</span>
                    <span>{quest.waypoints.length} trạm dừng</span>
                  </div>
                  <h3 className="font-heritage text-lg font-bold text-stone-900 leading-snug">
                    {quest.name}
                  </h3>
                  <p className="text-xs text-stone-600 font-luxury-sans line-clamp-2 mt-1">
                    {quest.teaser}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-2">
                  <button
                    onClick={() => navigateToQuestDetail(quest)}
                    className="flex-1 py-2 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold font-mono flex items-center justify-center gap-1"
                  >
                    <Eye size={13} /> Xem trước
                  </button>

                  <button
                    onClick={() => {
                      alert('Chức năng chỉnh sửa thông tin Quest trực tiếp!');
                    }}
                    className="p-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100"
                    title="Chỉnh sửa"
                  >
                    <Edit size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* QR Code Check-In Modal for Guides */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-[#FDFAF5] border border-amber-400 shadow-2xl space-y-6 relative"
          >
            <button
              onClick={() => {
                setIsScannerOpen(false);
                setCheckInResult(null);
                setQrInput('');
              }}
              className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/50 flex items-center justify-center text-amber-800">
                <QrCode size={24} />
              </div>
              <div>
                <span className="text-[10px] font-mono text-amber-700 font-bold uppercase tracking-wider">
                  SOÁT VÉ THỰC ĐỊA • NHẬN THÙ LAO 85%
                </span>
                <h3 className="font-heritage text-2xl font-bold text-[#0F2D1E] m-0">
                  Quét Mã Vé Du Khách
                </h3>
              </div>
            </div>

            <p className="text-xs text-stone-600 font-luxury-sans m-0">
              Nhập mã QR hoặc chuỗi mã vé từ điện thoại du khách để xác nhận tham quan, cộng điểm thưởng cho du khách và ghi nhận thù lao vào ví của bạn.
            </p>

            <form onSubmit={handleScanOrSubmitQr} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-stone-600 block">
                  CHUỖI MÃ VÉ QR (VÍ DỤ: LQ-TICKET-tkt-001 HOẶC MÃ VÉ) *
                </label>
                <input
                  type="text"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="LQ-TICKET-tkt-001"
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-sm font-mono focus:border-amber-500 focus:outline-none"
                  autoFocus
                />
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setQrInput('LQ-TICKET-tkt-001')}
                    className="text-[10px] font-mono text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded"
                  >
                    Mã mẫu 1: tkt-001
                  </button>
                  <button
                    type="button"
                    onClick={() => setQrInput('LQ-HN-88392')}
                    className="text-[10px] font-mono text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded"
                  >
                    Mã mẫu 2: LQ-HN-88392
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isCheckingIn || !qrInput.trim()}
                className="w-full btn-gold-aura py-3.5 text-xs font-bold"
              >
                {isCheckingIn ? (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles size={14} className="animate-spin" /> Đang Xác Thực & Cộng Thưởng...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} /> XÁC THỰC CHECK-IN VÉ
                  </span>
                )}
              </button>
            </form>

            {/* Check-In Response Card */}
            {checkInResult && (
              <div 
                className={`p-4 rounded-2xl border text-xs font-luxury-sans space-y-2 animate-in zoom-in-95 duration-200 ${
                  checkInResult.success 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
                    : 'bg-red-50 border-red-300 text-red-950'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {checkInResult.success ? (
                    <CheckCircle2 size={18} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={18} className="text-red-700 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold m-0">{checkInResult.message}</p>
                    {checkInResult.success && checkInResult.guideEarnings && (
                      <div className="mt-2 pt-2 border-t border-emerald-200 grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <div>
                          <span className="text-stone-500 block">Thù lao HDV nhận (85%):</span>
                          <strong className="text-emerald-800 text-sm">
                            +{formatPrice(checkInResult.guideEarnings)}
                          </strong>
                        </div>
                        <div>
                          <span className="text-stone-500 block">Thưởng cho Du khách:</span>
                          <strong className="text-amber-700 text-sm">+100 LocalCoins & +50 EXP</strong>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
