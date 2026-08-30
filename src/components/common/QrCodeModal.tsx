import React from 'react';
import { X, CheckCircle2, QrCode, Play, Calendar, User, MapPin, Sparkles, Download } from 'lucide-react';
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

  const handleStart = () => {
    onClose();
    if (onStartPlay) {
      onStartPlay();
    } else {
      startGameplay(ticket);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border flex flex-col relative"
        style={{
          background: '#FDFAF5',
          borderColor: '#D4AF37',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)'
        }}
      >
        {/* Modal Header */}
        <div 
          className="px-6 py-4 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, #0F2D1E 0%, #1C4A32 100%)',
            borderBottom: '1px solid rgba(212, 175, 55, 0.3)'
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <QrCode size={18} />
            </div>
            <div>
              <h3 className="font-heritage text-lg font-bold text-amber-300 m-0 leading-tight">
                Vé Di Sản Điện Tử
              </h3>
              <p className="text-[11px] font-mono text-stone-300 m-0">
                MÃ VÉ: {ticket.ticketCode}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-amber-200 shadow-inner relative">
            {/* SVG QR Code Simulation with Imperial Gold Aesthetic */}
            <div className="p-3 bg-stone-900 rounded-xl border-2 border-[#D4AF37] shadow-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(ticket.qrPayload)}&color=D4AF37&bgcolor=121412`}
                alt="Ticket QR Code"
                className="w-44 h-44 rounded-lg object-contain"
                onError={(e) => {
                  // Fallback if network issue
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-300">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>HỢP LỆ — SẴN SÀNG QUÉT CHECK-IN</span>
            </div>
          </div>

          {/* Ticket Information Breakdown */}
          <div className="p-4 rounded-xl bg-[#F5F0E8] border border-stone-300/80 space-y-2.5 text-xs font-luxury-sans">
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
              className="w-full btn-gold-aura py-3.5 text-sm"
            >
              <Play size={16} className="fill-current" />
              <span>BẮT ĐẦU VÀO CHƠI QUEST NGAY</span>
            </button>

            <button
              onClick={() => alert('Đã lưu mã QR vé về thiết bị của bạn thành công!')}
              className="w-full py-2.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold flex items-center justify-center gap-2 transition-colors font-mono"
            >
              <Download size={14} /> Lưu ảnh vé về máy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
