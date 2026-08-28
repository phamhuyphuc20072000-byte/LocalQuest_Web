import React, { useState } from 'react';
import { Quest, formatPrice, img } from '../data/quests';

export function ScreenA5({
  quest,
  bookingData,
  onBack,
  onPay,
  onFail
}: {
  quest: Quest;
  bookingData?: { guideType: 'human' | 'ai'; date: string; session: string; people: number; total: number } | null;
  onBack: () => void;
  onPay: () => void;
  onFail: () => void;
}) {
  const [name, setName] = useState('Nguyễn Văn An');
  const [sdt, setSdt] = useState('0912 345 678');
  const [email, setEmail] = useState('email@gmail.com');
  const [method, setMethod] = useState<'MoMo' | 'VNPay' | 'Thẻ tín dụng'>('VNPay');

  const people = bookingData?.people || 2;
  const session = bookingData?.session || 'Chiều 14:00';
  const total = bookingData?.total || quest.price * people;

  const methods = ['MoMo', 'VNPay', 'Thẻ tín dụng'] as const;

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh' }}>
      <div style={{ background: '#132E1F', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(245,240,232,0.7)', cursor: 'pointer', fontSize: 18 }}>←</button>
        <span style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, color: '#F5F0E8' }}>Thanh toán</span>
      </div>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28 }}>
        <div>
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, color: '#1A1A18', marginBottom: 18 }}>Thông tin nhận vé</h3>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#6B6355', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Họ và tên</label>
                <input className="input-field" placeholder="Nguyễn Văn An" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#6B6355', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Số điện thoại</label>
                  <input className="input-field" placeholder="0912 345 678" value={sdt} onChange={e => setSdt(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#6B6355', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Email</label>
                  <input className="input-field" placeholder="email@gmail.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, color: '#1A1A18', marginBottom: 18 }}>Phương thức thanh toán</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {methods.map(m => (
                <button key={m} onClick={() => setMethod(m)}
                  style={{ padding: '14px 10px', border: '1.5px solid', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'Outfit, sans-serif', transition: 'all 0.15s', background: method === m ? '#1C4A32' : '#FDFAF5', color: method === m ? '#F5F0E8' : '#1A1A18', borderColor: method === m ? '#1C4A32' : 'rgba(107,99,85,0.25)' }}>
                  {m === 'MoMo' ? '📱 MoMo' : m === 'VNPay' ? '🏦 VNPay' : '💳 Thẻ'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="card" style={{ padding: 20, position: 'sticky', top: 20 }}>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#9A9080', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Đơn hàng</p>
            <div style={{ height: 100, borderRadius: 4, overflow: 'hidden', marginBottom: 14, background: '#C5B89A' }}>
              <img src={img(quest.imageId, 300, 200)} alt={quest.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 600, color: '#1A1A18', marginBottom: 4 }}>{quest.name}</h4>
            <p style={{ fontSize: 13, color: '#6B6355', marginBottom: 16 }}>📍 {quest.city} · {session} · {people} người</p>
            <div style={{ borderTop: '1px solid rgba(107,99,85,0.15)', paddingTop: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#6B6355' }}>Vé × {people}</span>
                <span style={{ fontSize: 13, color: '#6B6355', fontFamily: 'JetBrains Mono, monospace' }}>{formatPrice(total)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 600 }}>Tổng cộng</span>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: '#1C4A32' }}>{formatPrice(total)}</span>
            </div>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} onClick={onPay}>
              Thanh toán ngay
            </button>
            <button onClick={onFail} style={{ width: '100%', marginTop: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#9A9080', fontFamily: 'Outfit, sans-serif', textDecoration: 'underline' }}>
              Thử thanh toán thất bại (demo)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScreenA6({
  success,
  quest,
  onRetry,
  onHome,
  onPlayGame
}: {
  success: boolean;
  quest: Quest;
  onRetry: () => void;
  onHome: () => void;
  onPlayGame: () => void;
}) {
  const orderCode = 'LQ' + Math.floor(1000 + Math.random() * 9000);

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
        {success ? (
          <>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(28,74,50,0.1)', border: '3px solid #1C4A32', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36, color: '#1C4A32' }}>✓</div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 30, fontWeight: 700, color: '#1C4A32', marginBottom: 8 }}>Đặt vé thành công!</h1>
            <p style={{ fontSize: 15, color: '#6B6355', marginBottom: 24, lineHeight: 1.6 }}>Vé điện tử đã được gửi đến email của bạn. Bạn đã có thể tham gia cuộc hành trình ngay bây giờ!</p>
            
            <div className="card" style={{ padding: 24, marginBottom: 20, textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#9A9080', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Mã đơn hàng</p>
                  <p style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700, color: '#1C4A32', margin: 0 }}>#{orderCode}</p>
                </div>
                <div style={{ background: '#F5F0E8', padding: '6px 12px', borderRadius: 4, textAlign: 'right' }}>
                  <p style={{ fontSize: 11, color: '#2A6147', fontWeight: 600, margin: 0 }}>ĐÃ THANH TOÁN</p>
                </div>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A18', margin: '0 0 6px' }}>{quest.name}</p>
              <p style={{ fontSize: 12, color: '#6B6355', margin: '0 0 16px' }}>📍 {quest.city} · 3 trạm dừng chân</p>
              
              <div style={{ background: 'rgba(201,125,26,0.08)', borderRadius: 6, padding: '12px 14px', borderLeft: '3px solid #C97D1A' }}>
                <p style={{ fontSize: 12, color: '#6B6355', margin: 0 }}>
                  💡 Bạn có thể bật ứng dụng GPS và tới trạm đầu tiên để bắt đầu quét manh mối giải đố!
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-amber" style={{ flex: 1, justifyContent: 'center' }} onClick={onPlayGame}>
                🎮 Bắt Đầu Chơi Quest Ngay
              </button>
              <button className="btn-outline" onClick={onHome}>
                Về trang chủ
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(211,47,47,0.1)', border: '3px solid #D32F2F', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 36, color: '#D32F2F' }}>✕</div>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 30, fontWeight: 700, color: '#D32F2F', marginBottom: 8 }}>Thanh toán thất bại</h1>
            <p style={{ fontSize: 15, color: '#6B6355', marginBottom: 24, lineHeight: 1.6 }}>Giao dịch không thành công hoặc đã bị hủy. Vui lòng kiểm tra lại tài khoản hoặc đổi phương thức thanh toán.</p>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={onRetry}>
                Thử lại thanh toán
              </button>
              <button className="btn-outline" onClick={onHome}>
                Về trang chủ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
