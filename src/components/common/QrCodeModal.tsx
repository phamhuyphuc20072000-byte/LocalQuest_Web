import React, { useEffect } from 'react';
import { X, CheckCircle2, QrCode, Play, Calendar, User, MapPin, Sparkles, Download, ArrowLeft } from 'lucide-react';
import { Ticket } from '../../types';
import { formatPrice } from '../../data/quests';
import { useQuest } from '../../context/QuestContext';

interface QrCodeModalProps {
  ticket: Ticket;
  onClose: () => void;
  onStartPlay?: () => void;
}

export function QrCodeModal({ ticket, onClose, onStartPlay }: QrCodeModalProps) {
  const { startGameplay } = useQuest();

  // Support ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleStart = () => {
    onClose();
    if (onStartPlay) {
      onStartPlay();
    } else {
      startGameplay(ticket);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="w-full max-w-md max-h-[92vh] rounded-3xl overflow-hidden shadow-2xl border flex flex-col relative animate-in zoom-in-95 duration-200"
        style={{
          background: '#FDFAF5',
          borderColor: '#D4AF37',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(212, 175, 55, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div 
          className="px-5 py-4 flex items-center justify-between sticky top-0 z-10"
          style={{
            background: 'linear-gradient(135deg, #0F2D1E 0%, #1C4A32 100%)',
            borderBottom: '1px solid rgba(212, 175, 55, 0.4)'
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
              <QrCode size={18} />
            </div>
            <div>
              <h3 className="font-heritage text-base sm:text-lg font-bold text-amber-300 m-0 leading-tight">
                Vé Di Sản Điện Tử
              </h3>
              <p className="text-[11px] font-mono text-stone-300 m-0">
                MÃ VÉ: <strong className="text-amber-200">{ticket.ticketCode}</strong>
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-rose-500/20 border border-white/20 hover:border-rose-400 text-stone-200 hover:text-rose-300 transition-all flex items-center gap-1 text-xs font-mono font-bold cursor-pointer"
            title="Đóng vé (Phím ESC hoặc click bên ngoài)"
          >
            <span>Đóng</span>
            <X size={16} />
          </button>
        </div>

        {/* Modal Body with Scroll support */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-amber-200 shadow-inner relative">
            {/* SVG QR Code Simulation with Imperial Gold Aesthetic */}
            <div className="p-3 bg-stone-900 rounded-2xl border-2 border-[#D4AF37] shadow-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(ticket.qrPayload || ticket.ticketCode)}&color=D4AF37&bgcolor=121412`}
                alt="Ticket QR Code"
                className="w-40 h-40 sm:w-44 sm:h-44 rounded-xl object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>HỢP LỆ — SẴN SÀNG QUÉT CHECK-IN</span>
            </div>
          </div>

          {/* Ticket Information Breakdown */}
          <div className="p-4 rounded-2xl bg-[#F5F0E8] border border-stone-300/80 space-y-2 text-xs font-luxury-sans">
            <div className="flex justify-between items-center pb-2 border-b border-stone-300">
              <span className="text-stone-500 font-mono">Nhiệm Vụ (Quest)</span>
              <span className="font-bold text-stone-900 text-sm font-heritage text-right">{ticket.questName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-stone-500 flex items-center gap-1">
                <MapPin size={13} className="text-amber-600" /> Địa điểm:
              </span>
              <span className="font-semibold text-stone-800">{ticket.city}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-stone-500 flex items-center gap-1">
                <User size={13} className="text-amber-600" /> Người sở hữu:
              </span>
              <span className="font-semibold text-stone-800">{ticket.buyerName} ({ticket.touristsCount} người)</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-stone-500 flex items-center gap-1">
                <Calendar size={13} className="text-amber-600" /> Ngày mua:
              </span>
              <span className="font-mono text-stone-700">{ticket.purchaseDate}</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-stone-300 text-sm font-bold">
              <span className="text-stone-700">Tổng thanh toán:</span>
              <span className="text-[#C97D1A] font-mono">{formatPrice(ticket.price)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleStart}
              className="w-full btn-gold-aura py-3.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Play size={16} className="fill-current" />
              <span>BẮT ĐẦU VÀO CHƠI QUEST NGAY</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => alert('Đã lưu mã QR vé về thiết bị của bạn thành công!')}
                className="w-full py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors font-mono cursor-pointer"
              >
                <Download size={13} /> Lưu ảnh vé
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-stone-200/80 hover:bg-stone-300 border border-stone-300 text-stone-800 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors font-mono cursor-pointer"
              >
                <ArrowLeft size={13} /> Quay lại danh sách
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
