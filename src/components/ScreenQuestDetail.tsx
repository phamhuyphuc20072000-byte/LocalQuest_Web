import React, { useState } from 'react';
import { Quest, UserRole, formatPrice, img } from '../data/quests';
import { PublicHeader, PublicFooter, Stars, DifficultyBadge, ThemeBadge } from './SharedUI';
import { ScreenAiGuideDetailsModal } from './ScreenHome';

export function ScreenA3({
  quest,
  user,
  onClose,
  onProceed
}: {
  quest: Quest;
  user: UserRole;
  onClose: () => void;
  onProceed: (bookingData: { guideType: 'human' | 'ai'; date: string; session: string; people: number; total: number }) => void;
}) {
  const today = new Date().toISOString().split('T')[0];
  const [guideType, setGuideType] = useState<'human' | 'ai'>('human');
  const [date, setDate] = useState(today);
  const [session, setSession] = useState<'Sáng 8:00' | 'Chiều 14:00' | 'Tối 18:00'>('Chiều 14:00');
  const [people, setPeople] = useState(2);
  const unitPrice = guideType === 'human' ? quest.price : Math.round(quest.price * 0.35);
  const total = unitPrice * people;

  return (
    <div className="overlay-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#FDFAF5', borderRadius: 8, width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ background: '#1C4A32', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#A8C4B4', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 2px' }}>Đặt vé Quest</p>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, color: '#F5F0E8', margin: 0 }}>{quest.name}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(245,240,232,0.6)', cursor: 'pointer', fontSize: 20, padding: 4 }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>
          {/* Guide Mode Selection (Human vs AI 24/7) */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#6B6355', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Hình thức Hướng dẫn viên</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div
                onClick={() => setGuideType('human')}
                style={{
                  border: '1.5px solid',
                  borderColor: guideType === 'human' ? '#1C4A32' : 'rgba(107,99,85,0.25)',
                  background: guideType === 'human' ? 'rgba(28,74,50,0.08)' : '#FDFAF5',
                  borderRadius: 6,
                  padding: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1C4A32', margin: '0 0 2px' }}>👤 Guide Người Thật</p>
                <p style={{ fontSize: 11, color: '#6B6355', margin: '0 0 6px' }}>Hẹn giờ đi trực tiếp cùng Guide bản địa</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#C97D1A', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>{formatPrice(quest.price)}/người</p>
              </div>
              <div
                onClick={() => setGuideType('ai')}
                style={{
                  border: '1.5px solid',
                  borderColor: guideType === 'ai' ? '#C97D1A' : 'rgba(107,99,85,0.25)',
                  background: guideType === 'ai' ? 'rgba(201,125,26,0.08)' : '#FDFAF5',
                  borderRadius: 6,
                  padding: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#C97D1A', margin: 0 }}>🤖 Trợ Lý AI 24/7</p>
                  <span style={{ fontSize: 9, background: '#C97D1A', color: '#FFF', padding: '1px 5px', borderRadius: 2, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>GIẢM 65%</span>
                </div>
                <p style={{ fontSize: 11, color: '#6B6355', margin: '0 0 6px' }}>Tự do chơi 24/7 + Thuyết minh & Chat AI</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#2A6147', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>{formatPrice(Math.round(quest.price * 0.35))}/người</p>
              </div>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#6B6355', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Ngày đi</label>
            <input type="date" className="input-field" min={today} value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#6B6355', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Ca đi</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {(['Sáng 8:00', 'Chiều 14:00', 'Tối 18:00'] as const).map(s => (
                <button key={s} onClick={() => setSession(s)}
                  style={{ padding: '10px 6px', border: '1.5px solid', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.15s', fontFamily: 'Outfit, sans-serif', background: session === s ? '#1C4A32' : 'transparent', color: session === s ? '#F5F0E8' : '#1A1A18', borderColor: session === s ? '#1C4A32' : 'rgba(107,99,85,0.3)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#6B6355', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Số người</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#F5F0E8', borderRadius: 4, padding: '8px 16px', width: 'fit-content' }}>
              <button onClick={() => setPeople(Math.max(1, people - 1))} style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid rgba(107,99,85,0.3)', background: '#FDFAF5', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1C4A32', fontWeight: 700 }}>−</button>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, color: '#1A1A18', minWidth: 32, textAlign: 'center' }}>{people}</span>
              <button onClick={() => setPeople(Math.min(10, people + 1))} style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid rgba(107,99,85,0.3)', background: '#FDFAF5', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1C4A32', fontWeight: 700 }}>+</button>
              <span style={{ fontSize: 13, color: '#9A9080' }}>người (tối đa 10)</span>
            </div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, rgba(28,74,50,0.06), rgba(201,125,26,0.06))', border: '1px solid rgba(28,74,50,0.12)', borderRadius: 6, padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: '#6B6355' }}>{formatPrice(unitPrice)} × {people} người ({guideType === 'human' ? 'Guide Người Thật' : 'Trợ Lý AI 24/7'})</span>
              <span style={{ fontSize: 13, color: '#6B6355', fontFamily: 'JetBrains Mono, monospace' }}>{formatPrice(total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(107,99,85,0.15)' }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 600, color: '#1A1A18' }}>Tổng tạm tính</span>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: '#1C4A32' }}>{formatPrice(total)}</span>
            </div>
          </div>
          <button className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 15, justifyContent: 'center' }} onClick={() => onProceed({ guideType, date, session, people, total })}>
            Tiến hành thanh toán →
          </button>
        </div>
      </div>
    </div>
  );
}

export function ScreenA2({
  quest,
  onBack,
  onBook,
  user,
  userEmail,
  onLogin,
  onLogout
}: {
  quest: Quest;
  onBack: () => void;
  onBook: () => void;
  user: UserRole;
  userEmail?: string;
  onLogin: () => void;
  onLogout: () => void;
}) {
  const [showAiModal, setShowAiModal] = useState(false);

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh' }}>
      <PublicHeader user={user} userEmail={userEmail} onLogin={onLogin} onLogout={onLogout} onGuidePortal={() => {}} onHome={onBack} />
      {showAiModal && <ScreenAiGuideDetailsModal quest={quest} onClose={() => setShowAiModal(false)} onBook={onBook} />}
      {/* Hero image */}
      <div style={{ position: 'relative', height: 360, background: '#C5B89A', overflow: 'hidden' }}>
        <img src={img(quest.imageId, 1200, 600)} alt={quest.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(26,26,24,0.1) 0%, rgba(26,26,24,0.7) 100%)' }} />
        <button onClick={onBack} style={{ position: 'absolute', top: 20, left: 20, background: 'rgba(245,240,232,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(245,240,232,0.3)', color: '#F5F0E8', padding: '8px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
          ← Quay lại
        </button>
        <div style={{ position: 'absolute', bottom: 28, left: 32 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <ThemeBadge t={quest.theme} />
            <DifficultyBadge d={quest.difficulty} />
          </div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 40, fontWeight: 700, color: '#F5F0E8', lineHeight: 1.2, marginBottom: 8 }}>{quest.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Stars r={quest.rating} size={15} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'rgba(245,240,232,0.7)' }}>{quest.reviews} đánh giá</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'rgba(245,240,232,0.7)' }}>📍 {quest.city}</span>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40 }}>
        {/* Left: content */}
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
            {[
              { label: 'Độ khó', value: quest.difficulty, icon: '⚡' },
              { label: 'Thời gian đi bộ', value: quest.walkTime, icon: '⏱' },
              { label: 'Cự ly', value: quest.distance, icon: '🚶' },
            ].map(s => (
              <div key={s.label} style={{ background: '#FDFAF5', border: '1px solid rgba(107,99,85,0.12)', borderRadius: 6, padding: '16px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                <p style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, color: '#1A1A18', margin: 0 }}>{s.value}</p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#9A9080', margin: 0, marginTop: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 600, color: '#1A1A18', marginBottom: 16 }}>Kịch bản Quest</h2>
            <div style={{ borderLeft: '3px solid #C97D1A', paddingLeft: 20, marginBottom: 16 }}>
              <p style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontStyle: 'italic', color: '#6B6355', lineHeight: 1.7 }}>"{quest.teaser}"</p>
            </div>
            <p style={{ fontSize: 15, color: '#4A4438', lineHeight: 1.75 }}>{quest.story}</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, rgba(28,74,50,0.05), rgba(201,125,26,0.05))', border: '1px solid rgba(28,74,50,0.12)', borderRadius: 6, padding: '24px' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, color: '#1C4A32', marginBottom: 14 }}>Quest này bao gồm</h3>
            {[
              'Bản đồ số có các trạm dừng được mở khóa dần',
              'Kịch bản thuyết minh tại từng trạm',
              'Câu đố và thử thách giải mã',
              'Mã QR vé điện tử để Check-in',
              'Hỗ trợ trực tiếp từ Guide trong suốt hành trình',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                <span style={{ color: '#C97D1A', marginTop: 2, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 14, color: '#4A4438', lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Right: Guide info + AI Guide + CTA */}
        <div>
          {/* Human Guide Card */}
          <div className="card" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#9A9080', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Người dẫn đường người thật</p>
              <span style={{ fontSize: 11, background: 'rgba(28,74,50,0.1)', color: '#1C4A32', padding: '2px 8px', borderRadius: 10, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>👤 TRỰC TIẾP</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', background: '#C5B89A', flexShrink: 0 }}>
                <img src={img(quest.guideImageId, 112, 112)} alt={quest.guideName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <p style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 600, color: '#1A1A18', marginBottom: 4 }}>{quest.guideName}</p>
                <Stars r={quest.guideRating} />
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#6B6355', lineHeight: 1.6, margin: 0 }}>
              Người bạn địa với hơn 5 năm kinh nghiệm dẫn khách khám phá {quest.city}. Mỗi Quest được nghiên cứu kỹ lưỡng từ tài liệu lịch sử địa phương.
            </p>
          </div>
          {/* AI Local Guide 24/7 Card */}
          <div
            className="card"
            style={{ padding: 20, marginBottom: 16, border: '1.5px solid #C97D1A', background: '#FDFAF5', cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => setShowAiModal(true)}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#1C4A32')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#C97D1A')}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(201,125,26,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🤖</div>
                <div>
                  <p style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 700, color: '#1C4A32', margin: 0 }}>Trợ Lý AI Local Bot 24/7</p>
                  <p style={{ fontSize: 11, color: '#2A6147', margin: 0, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>● Luôn sẵn sàng mọi lúc</p>
                </div>
              </div>
              <span style={{ background: '#C97D1A', color: '#FFF', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 10, fontFamily: 'JetBrains Mono, monospace' }}>ONLINE 24/7</span>
            </div>
            <p style={{ fontSize: 13, color: '#6B6355', lineHeight: 1.5, marginBottom: 12 }}>
              Bao gồm Trợ lý AI sẽ thuyết minh giọng đọc & chat trả lời mọi thắc mắc của bạn! Nhấn để xem trải nghiệm thử.
            </p>
            <div style={{ background: 'rgba(201,125,26,0.1)', padding: '10px 12px', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: '#C97D1A', fontWeight: 600 }}>Vé AI 24/7 Tự Do:</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1C4A32', fontFamily: 'JetBrains Mono, monospace' }}>{formatPrice(Math.round(quest.price * 0.35))}</span>
            </div>
            <div style={{ textAlign: 'center', fontSize: 12, color: '#C97D1A', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <span>🔍 Nhấn xem trang chi tiết & Dùng thử AI →</span>
            </div>
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 700, color: '#1C4A32' }}>{formatPrice(quest.price)}</span>
              <span style={{ fontSize: 14, color: '#9A9080' }}>/ người</span>
            </div>
            <p style={{ fontSize: 13, color: '#9A9080', marginBottom: 20 }}>Tùy chọn: Guide người thật hoặc Trợ lý AI 24/7</p>
            <button className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 16, justifyContent: 'center' }} onClick={onBook}>
              🎟️ Đặt Vé Ngay
            </button>
            <p style={{ fontSize: 12, color: '#9A9080', textAlign: 'center', marginTop: 10 }}>Hoàn tiền 100% nếu hủy trước 24h</p>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
