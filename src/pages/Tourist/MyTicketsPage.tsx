import React, { useState, useEffect } from 'react';
import { 
  Ticket as TicketIcon, 
  QrCode, 
  Play, 
  MapPin, 
  Calendar, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Compass, 
  ArrowRight,
  Clock,
  PartyPopper
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useQuest } from '../../context/QuestContext';
import { useAuth } from '../../context/AuthContext';
import { Ticket } from '../../types';
import { formatPrice } from '../../data/quests';
import { QrCodeModal } from '../../components/common/QrCodeModal';
import { subscribeUserTickets } from '../../services/ticketService';

export function MyTicketsPage() {
  const { tickets, setTickets, startGameplay, setActivePage } = useQuest();
  const { userProfile, updatePoints } = useAuth();
  const [selectedTicketForQr, setSelectedTicketForQr] = useState<Ticket | null>(null);
  const [checkInBanner, setCheckInBanner] = useState<{ ticketCode: string; questName: string } | null>(null);

  // Subscribe to real-time tickets from Firestore
  useEffect(() => {
    if (!userProfile?.uid) return;

    const unsubscribe = subscribeUserTickets(userProfile.uid, (liveTickets, justCompletedId) => {
      if (liveTickets && liveTickets.length > 0) {
        setTickets(liveTickets);

        if (justCompletedId) {
          const completedTkt = liveTickets.find((t) => t.id === justCompletedId);
          if (completedTkt) {
            setCheckInBanner({
              ticketCode: completedTkt.ticketCode,
              questName: completedTkt.questName
            });
            updatePoints(100, 50);

            try {
              confetti({
                particleCount: 150,
                spread: 90,
                origin: { y: 0.5 }
              });
            } catch (e) {
              // ignore
            }
          }
        }
      }
    });

    return () => unsubscribe();
  }, [userProfile?.uid]);

  const activeTickets = tickets.filter((t) => t.status === 'valid' || t.status === 'playing');
  const pastTickets = tickets.filter((t) => t.status === 'used' || t.status === 'completed' || t.status === 'expired');

  return (
    <div className="min-h-screen pb-24 space-y-10">
      
      {/* Realtime Check-in Celebration Alert */}
      {checkInBanner && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-900 to-[#0F2D1E] border-2 border-amber-400 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400 flex items-center justify-center text-amber-300 flex-shrink-0">
                <PartyPopper size={24} />
              </div>
              <div>
                <h4 className="font-heritage text-base font-bold text-amber-300 m-0">
                  🎉 Check-in Di Sản Thành Công!
                </h4>
                <p className="text-xs text-stone-200 font-luxury-sans m-0 mt-0.5">
                  Vé <strong>#{checkInBanner.ticketCode}</strong> ({checkInBanner.questName}) đã được Hướng dẫn viên quét duyệt. Bạn được thưởng <strong>+100 LocalCoins</strong> & <strong>+50 EXP</strong>!
                </p>
              </div>
            </div>
            <button
              onClick={() => setCheckInBanner(null)}
              className="btn-gold-aura text-xs px-4 py-2 flex-shrink-0"
            >
              Đóng thông báo
            </button>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8 text-white overflow-hidden" style={{
        background: 'linear-gradient(180deg, #0F2D1E 0%, #153826 100%)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.3)'
      }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-300 font-bold uppercase tracking-wider mb-2">
              <TicketIcon size={14} className="text-amber-400" />
              <span>VÉ DI SẢN ĐIỆN TỬ & NHẬT KÝ THỰC ĐỊA</span>
            </div>
            <h1 className="font-heritage text-3xl sm:text-4xl font-bold gold-gradient-text m-0">
              Ví Vé Di Sản Của Bạn
            </h1>
            <p className="text-stone-300 font-luxury-sans text-sm mt-1 max-w-xl">
              Quản lý toàn bộ vé tham gia nhiệm vụ thực địa, quét mã QR check-in tại các trạm di sản và nhận điểm thưởng tức thì trong thời gian thực.
            </p>
          </div>

          {/* User Points Card */}
          {userProfile && (
            <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/30 backdrop-blur-md flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
                <Sparkles size={24} className="animate-spin [animation-duration:8s]" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-stone-400 uppercase">ĐIỂM THƯỞNG TÍCH LUỸ</span>
                <h3 className="font-heritage text-2xl font-bold text-amber-300 m-0">
                  {userProfile.points.toLocaleString()} <span className="text-xs font-mono">PTS</span>
                </h3>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Ticket Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Active Tickets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heritage text-2xl font-bold text-stone-900 m-0">
              Vé Sẵn Sàng Trải Nghiệm ({activeTickets.length})
            </h2>
            <button
              onClick={() => setActivePage('EXPLORE')}
              className="btn-outline-gold text-xs px-4 py-2"
            >
              <span>+ Khám Phá Thêm Quest</span>
            </button>
          </div>

          {activeTickets.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-[#FDFAF5] border border-dashed border-stone-300 p-8 space-y-4">
              <TicketIcon size={44} className="mx-auto text-amber-700 opacity-50" />
              <div>
                <h3 className="font-heritage text-xl font-bold text-stone-800">Bạn chưa có vé hoạt động nào</h3>
                <p className="text-xs text-stone-500 font-luxury-sans max-w-sm mx-auto mt-1">
                  Hãy chọn một nhiệm vụ yêu thích tại Hà Nội, Hội An, TP.HCM hay Huế để nhận vé và bắt đầu hành trình.
                </p>
              </div>
              <button
                onClick={() => setActivePage('EXPLORE')}
                className="btn-gold-aura text-xs px-6 py-3"
              >
                <span>XEM DANH MỤC NHIỆM VỤ</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-3xl p-6 shadow-xl border flex flex-col justify-between space-y-6 transition-all duration-300 hover:shadow-2xl"
                  style={{
                    background: '#FDFAF5',
                    borderColor: '#D4AF37'
                  }}
                >
                  <div className="space-y-4">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold border border-emerald-300">
                          {ticket.status === 'valid' ? 'HỢP LỆ • SẴN SÀNG' : 'ĐANG CHƠI'}
                        </span>
                        <h3 className="font-heritage text-xl font-bold text-[#0F2D1E] mt-1 m-0">
                          {ticket.questName}
                        </h3>
                        <p className="text-xs text-stone-500 font-mono m-0 mt-0.5">
                          MÃ VÉ: <strong className="text-stone-900">{ticket.ticketCode}</strong>
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedTicketForQr(ticket)}
                        className="p-3 rounded-2xl bg-white border border-amber-300 text-amber-800 hover:bg-amber-50 shadow-sm transition-colors flex-shrink-0"
                        title="Xem mã QR check-in"
                      >
                        <QrCode size={22} />
                      </button>
                    </div>

                    {/* Metadata details */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#F5F0E8] text-xs font-luxury-sans text-stone-700">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-amber-700" />
                        <span>{ticket.city}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={13} className="text-amber-700" />
                        <span>{ticket.touristsCount} Người tham gia</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2 bg-amber-50/70 p-2 rounded-xl border border-amber-200/80">
                        <Clock size={13} className="text-amber-700 shrink-0" />
                        <span className="font-mono text-[11px]">
                          Khởi hành: <strong className="text-amber-900">{ticket.departureTime || '08:30'}</strong> • <strong className="text-stone-900">{ticket.playDate ? ticket.playDate.split('-').reverse().join('/') : ticket.purchaseDate}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-amber-700" />
                        <span className="font-mono text-[11px]">Mua: {ticket.purchaseDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={13} className="text-amber-700" />
                        <span className="font-mono text-[#C97D1A] font-bold">{formatPrice(ticket.price)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-stone-200 flex items-center gap-3">
                    <button
                      onClick={() => setSelectedTicketForQr(ticket)}
                      className="flex-1 py-3 rounded-xl border border-stone-300 text-stone-800 hover:bg-white text-xs font-semibold font-mono flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <QrCode size={15} />
                      <span>XEM MÃ QR</span>
                    </button>

                    <button
                      onClick={() => startGameplay(ticket)}
                      className="flex-1 btn-gold-aura py-3 text-xs"
                    >
                      <Play size={15} className="fill-current" />
                      <span>VÀO CHƠI QUEST</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past / Completed Tickets */}
        {pastTickets.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-stone-200">
            <h2 className="font-heritage text-xl font-bold text-stone-700 m-0">
              Nhật Ký Vé Đã Hoàn Thành ({pastTickets.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 rounded-2xl bg-white border border-stone-200 opacity-80 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-mono text-[10px] font-bold">
                        ĐÃ HOÀN THÀNH
                      </span>
                      <strong className="text-stone-900 font-heritage text-sm">{ticket.questName}</strong>
                    </div>
                    <p className="text-xs text-stone-500 font-mono m-0">Mã vé: {ticket.ticketCode} • {ticket.city}</p>
                  </div>
                  <span className="text-emerald-700 font-mono font-bold text-xs">+100 PTS</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </section>

      {/* QR Code Modal popup */}
      {selectedTicketForQr && (
        <QrCodeModal
          ticket={selectedTicketForQr}
          onClose={() => setSelectedTicketForQr(null)}
          onStartPlay={() => {
            const t = selectedTicketForQr;
            setSelectedTicketForQr(null);
            startGameplay(t);
          }}
        />
      )}

    </div>
  );
}
