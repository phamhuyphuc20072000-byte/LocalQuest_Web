import React, { useState, useRef } from 'react';
import { Quest, UserRole, formatPrice, img } from '../data/quests';

export function Stars({ r, size = 13 }: { r: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill={i <= Math.round(r) ? '#C97D1A' : '#D9D0C0'}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: size - 1, color: '#6B6355', marginLeft: 3 }}>{r.toFixed(1)}</span>
    </span>
  );
}

export function DifficultyBadge({ d }: { d: string }) {
  const color = d === 'Dễ' ? '#2A6147' : d === 'Trung bình' ? '#C97D1A' : '#8B2020';
  const bg = d === 'Dễ' ? 'rgba(42,97,71,0.1)' : d === 'Trung bình' ? 'rgba(201,125,26,0.1)' : 'rgba(139,32,32,0.1)';
  return (
    <span style={{ background: bg, color, padding: '2px 8px', borderRadius: 2, fontSize: 11, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em' }}>
      {d}
    </span>
  );
}

export function ThemeBadge({ t }: { t: string }) {
  return (
    <span style={{ background: 'rgba(28,74,50,0.08)', color: '#1C4A32', padding: '3px 9px', borderRadius: 2, fontSize: 11, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>
      {t}
    </span>
  );
}

export function QuestCard({ q, onClick }: { q: Quest; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="card"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', transform: hovered ? 'translateY(-3px)' : 'none', boxShadow: hovered ? '0 8px 24px rgba(28,74,50,0.12)' : '0 1px 3px rgba(0,0,0,0.05)' }}
    >
      <div style={{ position: 'relative', height: 180, background: '#C5B89A', overflow: 'hidden' }}>
        <img src={img(q.imageId, 480, 320)} alt={q.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: hovered ? 'scale(1.05)' : 'scale(1)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(26,26,24,0.5) 100%)' }} />
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
          <ThemeBadge t={q.theme} />
          <DifficultyBadge d={q.difficulty} />
        </div>
        <div style={{ position: 'absolute', bottom: 10, right: 10 }}>
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, color: '#F5F0E8' }}>{formatPrice(q.price)}</span>
          <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.7)', fontFamily: 'Outfit, sans-serif', marginLeft: 2 }}>/người</span>
        </div>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#9A9080', marginBottom: 4, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{q.city}</p>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 600, color: '#1A1A18', marginBottom: 6, lineHeight: 1.3 }}>{q.name}</h3>
        <p style={{ fontSize: 13, color: '#6B6355', marginBottom: 10, lineHeight: 1.5 }}>{q.teaser}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stars r={q.rating} />
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9A9080' }}>🚶 {q.distance}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#9A9080' }}>⏱ {q.walkTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PublicHeader({
  user,
  userEmail,
  onLogin,
  onLogout,
  onGuidePortal,
  onHome,
  onPlayGame
}: {
  user: UserRole;
  userEmail?: string;
  onLogin: () => void;
  onLogout?: () => void;
  onGuidePortal: () => void;
  onHome: () => void;
  onPlayGame?: () => void;
}) {
  return (
    <header style={{ background: '#132E1F', borderBottom: '1px solid rgba(245,240,232,0.08)', position: 'sticky', top: 0, zIndex: 40 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <button onClick={onHome} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" fill="#C97D1A" />
            <path d="M14 6L14 22M8 11L14 6L20 11" stroke="#132E1F" strokeWidth="2" strokeLinecap="round" />
            <circle cx="14" cy="17" r="3" fill="#132E1F" />
          </svg>
          <span style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: '#F5F0E8', letterSpacing: '-0.01em' }}>LocalQuest</span>
        </button>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {onPlayGame && (
            <button onClick={onPlayGame} className="btn-amber" style={{ padding: '7px 16px', fontSize: 13 }}>
              🎮 Trải Nghiệm Game Quest
            </button>
          )}
          <button
            onClick={onGuidePortal}
            style={{ background: 'none', border: '1px solid rgba(245,240,232,0.25)', color: '#F5F0E8', padding: '7px 16px', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = '#C97D1A'; (e.target as HTMLElement).style.color = '#C97D1A'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'rgba(245,240,232,0.25)'; (e.target as HTMLElement).style.color = '#F5F0E8'; }}
          >
            Trở thành Người dẫn đường
          </button>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(245,240,232,0.1)', padding: '6px 14px', borderRadius: 4 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#C97D1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 12, color: '#132E1F', fontWeight: 700 }}>{user === 'admin' ? 'A' : user === 'guide' ? 'G' : 'T'}</span>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: 12, color: '#F5F0E8', fontFamily: 'Outfit, sans-serif', margin: 0, fontWeight: 600 }}>{user === 'admin' ? 'Quản trị viên' : user === 'guide' ? 'Hướng dẫn viên' : 'Khách du lịch'}</p>
                  {userEmail && <p style={{ fontSize: 10, color: '#A8C4B4', fontFamily: 'JetBrains Mono, monospace', margin: 0 }}>{userEmail}</p>}
                </div>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  style={{
                    background: 'rgba(201,125,26,0.2)',
                    border: '1px solid #C97D1A',
                    color: '#E8A234',
                    padding: '6px 14px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontFamily: 'Outfit, sans-serif',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { (e.currentTarget.style.background = '#C97D1A'); (e.currentTarget.style.color = '#132E1F'); }}
                  onMouseLeave={e => { (e.currentTarget.style.background = 'rgba(201,125,26,0.2)'); (e.currentTarget.style.color = '#E8A234'); }}
                >
                  Đăng xuất
                </button>
              )}
            </div>
          ) : (
            <button className="btn-amber" style={{ padding: '8px 18px', fontSize: 13 }} onClick={onLogin}>Đăng nhập</button>
          )}
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer style={{ background: '#0B2317', borderTop: '1px solid rgba(245,240,232,0.08)', color: '#F5F0E8', position: 'relative' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px 36px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 40, marginBottom: 48 }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#C97D1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 14 }}>🧭</span>
              </div>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: '#F5F0E8' }}>LocalQuest</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.7)', lineHeight: 1.6, marginBottom: 24, maxWidth: 280 }}>
              Nâng cao tiêu chuẩn khám phá phố phường thông qua trải nghiệm thực tế và sáng tạo.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {['Facebook', 'Instagram', 'Youtube'].map((icon, idx) => (
                <div key={idx} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(245,240,232,0.08)', border: '1px solid rgba(245,240,232,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', fontSize: 13 }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(201,125,26,0.3)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(245,240,232,0.08)')}>
                  {idx === 0 ? 'fb' : idx === 1 ? 'ig' : 'yt'}
                </div>
              ))}
            </div>
          </div>
          {/* Sản phẩm Col */}
          <div>
            <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 600, color: '#F5F0E8', marginBottom: 16 }}>Sản phẩm</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12, fontSize: 13, color: 'rgba(245,240,232,0.7)' }}>
              <li style={{ cursor: 'pointer' }}>Lõi Chuyến Đi</li>
              <li style={{ cursor: 'pointer' }}>Bảng Điều khiển Guide</li>
              <li style={{ cursor: 'pointer' }}>API Doanh nghiệp</li>
              <li style={{ cursor: 'pointer' }}>Bảng giá</li>
            </ul>
          </div>
          {/* Công ty Col */}
          <div>
            <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 600, color: '#F5F0E8', marginBottom: 16 }}>Công ty</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12, fontSize: 13, color: 'rgba(245,240,232,0.7)' }}>
              <li style={{ cursor: 'pointer' }}>Bài báo Nghiên cứu</li>
              <li style={{ cursor: 'pointer' }}>Câu chuyện của chúng tôi</li>
              <li style={{ cursor: 'pointer' }}>Tuyển dụng</li>
              <li style={{ cursor: 'pointer' }}>Bộ công cụ báo chí</li>
            </ul>
          </div>
          {/* Liên hệ Col */}
          <div>
            <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 600, color: '#F5F0E8', marginBottom: 16 }}>Liên hệ</h4>
            <div style={{ display: 'grid', gap: 14, fontSize: 13, color: 'rgba(245,240,232,0.8)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16, color: '#E8A234' }}>✉️</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>nguyenthanhdanhctk42@gmail.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16, color: '#E8A234' }}>📞</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600 }}>+84 348 547 500</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 16, color: '#E8A234', marginTop: 2 }}>🏢</span>
                <span style={{ lineHeight: 1.5 }}>8C Tống Hữu Định, Thảo Điền, Hồ Chí Minh</span>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid rgba(245,240,232,0.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'rgba(245,240,232,0.5)', margin: 0, letterSpacing: '0.04em' }}>
            © 2026 LOCALQUEST AI INC. BẢO LƯU MỌI QUYỀN.
          </p>
          <div style={{ display: 'flex', gap: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'rgba(245,240,232,0.6)' }}>
            <span style={{ cursor: 'pointer' }}>CHÍNH SÁCH BẢO MẬT</span>
            <span style={{ cursor: 'pointer' }}>ĐIỀU KHOẢN DỊCH VỤ</span>
            <span style={{ cursor: 'pointer' }}>CHÍNH SÁCH COOKIE</span>
          </div>
        </div>
      </div>
      {/* Floating Chat Widget Icon */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99, cursor: 'pointer' }} onClick={() => alert('Tổng đài hỗ trợ 24/7: +84 348 547 500 - Email: nguyenthanhdanhctk42@gmail.com')}>
        <div style={{ position: 'relative', width: 48, height: 48, borderRadius: '50%', background: '#1C4A32', border: '1.5px solid #2A6147', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="22" height="22" fill="none" stroke="#F5F0E8" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <div style={{ position: 'absolute', top: -2, right: -2, background: '#D32F2F', color: '#FFF', width: 18, height: 18, borderRadius: '50%', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'JetBrains Mono, monospace' }}>
            1
          </div>
        </div>
      </div>
    </footer>
  );
}

export function OtpSixDigitInput({
  otpValues,
  setOtpValues,
  isError,
  onComplete
}: {
  otpValues: string[];
  setOtpValues: (vals: string[]) => void;
  isError?: boolean;
  onComplete?: (otpStr: string) => void;
}) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, val: string) => {
    const char = val.slice(-1);
    if (!/^\d*$/.test(char)) return;
    const newValues = [...otpValues];
    newValues[index] = char;
    setOtpValues(newValues);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    const fullStr = newValues.join('');
    if (fullStr.length === 6 && onComplete) {
      onComplete(fullStr);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newValues = Array(6).fill('');
    for (let i = 0; i < pasted.length; i++) {
      newValues[i] = pasted[i];
    }
    setOtpValues(newValues);
    if (pasted.length < 6) {
      inputRefs.current[pasted.length]?.focus();
    } else {
      inputRefs.current[5]?.focus();
      if (onComplete) onComplete(pasted);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '20px 0' }}>
      {Array(6).fill(0).map((_, i) => (
        <input
          key={i}
          ref={el => { inputRefs.current[i] = el; }}
          type="text"
          maxLength={1}
          inputMode="numeric"
          value={otpValues[i] || ''}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          style={{
            width: 48,
            height: 56,
            borderRadius: 10,
            border: `2px solid ${isError ? '#E53E3E' : (otpValues[i] ? '#1C4A32' : '#CBD5E0')}`,
            background: isError ? '#FFF5F5' : '#FFFFFF',
            textAlign: 'center',
            fontSize: 22,
            fontWeight: 700,
            color: isError ? '#E53E3E' : '#1A202C',
            outline: 'none',
            boxShadow: otpValues[i] ? '0 2px 8px rgba(28,74,50,0.15)' : 'none',
            transition: 'all 0.2s'
          }}
        />
      ))}
    </div>
  );
}
