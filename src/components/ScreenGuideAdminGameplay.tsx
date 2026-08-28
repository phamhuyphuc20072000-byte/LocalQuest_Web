import React, { useState } from 'react';
import { Quest, Waypoint, PENDING_GUIDES, PENDING_QUESTS, PENDING_WITHDRAWALS, formatPrice } from '../data/quests';
import { GuideMapStudio } from './GuideMapStudio';

// 1. Guide Portal & Studio
export function ScreenGuideStudio({
  onBack,
  onCreateQuest
}: {
  onBack: () => void;
  onCreateQuest: (newQ: Partial<Quest>) => void;
}) {
  const [city, setCity] = useState('Hà Nội');
  const [questName, setQuestName] = useState('');
  const [theme, setTheme] = useState<'Ẩm thực' | 'Lịch sử' | 'Bí ẩn' | 'Đêm'>('Bí ẩn');
  const [price, setPrice] = useState(180000);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([
    { id: 1, lat: 21.0285, lng: 105.8542, name: 'Trạm khởi hành', script: 'Điểm tập kết đầu tiên', question: 'Câu đố manh mối số 1?', answers: ['Đáp án đúng', 'Đáp án sai'], correct: 0 }
  ]);

  const handleMapClick = (lat: number, lng: number) => {
    const nextId = waypoints.length + 1;
    setWaypoints([
      ...waypoints,
      {
        id: nextId,
        lat,
        lng,
        name: `Trạm ${nextId}: Điểm khám phá mới`,
        script: `Kịch bản thuyết minh cho trạm ${nextId}`,
        question: `Thử thách tại trạm ${nextId}?`,
        answers: ['Phương án A', 'Phương án B'],
        correct: 0
      }
    ]);
  };

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh', padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={onBack} className="btn-outline" style={{ padding: '6px 14px', fontSize: 13 }}>← Quay lại</button>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700, color: '#1C4A32', margin: 0 }}>Guide Quest Creator Studio</h1>
          </div>
          <button
            className="btn-amber"
            onClick={() => {
              if (!questName.trim()) {
                alert('Vui lòng nhập tên Quest!');
                return;
              }
              onCreateQuest({ name: questName, city, theme, price, waypoints });
              alert('🎉 Đã gửi hồ sơ Quest mới lên hệ thống xét duyệt Admin!');
              onBack();
            }}
          >
            🚀 Xuất bản Quest Mới
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24 }}>
          {/* Left Config Panel */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>1. Thông tin cơ bản</h3>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#6B6355', marginBottom: 4 }}>TÊN QUEST</label>
                <input className="input-field" placeholder="Ví dụ: Ký ức Phố Cổ..." value={questName} onChange={e => setQuestName(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#6B6355', marginBottom: 4 }}>THÀNH PHỐ</label>
                <select className="input-field" value={city} onChange={e => setCity(e.target.value)}>
                  {['Hà Nội', 'TP. Hồ Chí Minh', 'Hội An', 'Huế'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#6B6355', marginBottom: 4 }}>CHỦ ĐỀ</label>
                <select className="input-field" value={theme} onChange={e => setTheme(e.target.value as any)}>
                  {['Bí ẩn', 'Ẩm thực', 'Lịch sử', 'Đêm'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#6B6355', marginBottom: 4 }}>GIÁ VÉ (VNĐ/NGƯỜI)</label>
                <input type="number" className="input-field" value={price} onChange={e => setPrice(Number(e.target.value))} />
              </div>
            </div>

            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 16, fontWeight: 600, margin: '24px 0 12px' }}>2. Danh sách trạm dừng ({waypoints.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
              {waypoints.map((wp, i) => (
                <div key={wp.id} style={{ background: '#F5F0E8', padding: '8px 12px', borderRadius: 4, fontSize: 12, border: '1px solid rgba(107,99,85,0.15)' }}>
                  <strong>Trạm {wp.id}:</strong> {wp.name}
                  <p style={{ margin: '2px 0 0', color: '#9A9080', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>GPS: {wp.lat.toFixed(4)}, {wp.lng.toFixed(4)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Leaflet Studio */}
          <div className="card" style={{ padding: 12, minHeight: 480 }}>
            <GuideMapStudio city={city} waypoints={waypoints} onSelectLocation={handleMapClick} />
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. Admin Dashboard
export function ScreenAdminDashboard({ onBack }: { onBack: () => void }) {
  const [guides, setGuides] = useState(PENDING_GUIDES);
  const [quests, setQuests] = useState(PENDING_QUESTS);
  const [withdrawals, setWithdrawals] = useState(PENDING_WITHDRAWALS);

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh', padding: 24 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={onBack} className="btn-outline" style={{ padding: '6px 14px', fontSize: 13 }}>← Quay lại</button>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 700, color: '#1C4A32', margin: 0 }}>Hệ Thống Quản Trị Hệ Thống LocalQuest</h1>
          </div>
          <span className="badge badge-forest">ADMIN PORTAL</span>
        </div>

        {/* Guides Approval */}
        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 600, color: '#1C4A32', marginBottom: 14 }}>📋 Phê duyệt Hồ sơ Guide Mới ({guides.length})</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {guides.map(g => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F5F0E8', borderRadius: 6, border: '1px solid rgba(107,99,85,0.12)' }}>
                <div>
                  <p style={{ fontWeight: 600, margin: '0 0 2px' }}>{g.name} · <span style={{ color: '#C97D1A' }}>{g.city}</span></p>
                  <p style={{ fontSize: 12, color: '#6B6355', margin: 0, fontFamily: 'JetBrains Mono, monospace' }}>SĐT: {g.phone} · Ngày nộp: {g.submitted}</p>
                </div>
                <button
                  className="btn-primary"
                  style={{ padding: '6px 16px', fontSize: 12 }}
                  onClick={() => {
                    setGuides(guides.filter(x => x.id !== g.id));
                    alert(`✅ Đã phê duyệt Guide: ${g.name}`);
                  }}
                >
                  Phê duyệt
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Withdrawals Approval */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 600, color: '#1C4A32', marginBottom: 14 }}>💰 Xác nhận Yêu cầu Rút tiền Guide ({withdrawals.length})</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {withdrawals.map(w => (
              <div key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#F5F0E8', borderRadius: 6, border: '1px solid rgba(107,99,85,0.12)' }}>
                <div>
                  <p style={{ fontWeight: 600, margin: '0 0 2px' }}>Guide: {w.guide} · <strong>{formatPrice(w.amount)}</strong></p>
                  <p style={{ fontSize: 12, color: '#6B6355', margin: 0, fontFamily: 'JetBrains Mono, monospace' }}>{w.bank} ({w.account})</p>
                </div>
                <button
                  className="btn-amber"
                  style={{ padding: '6px 16px', fontSize: 12 }}
                  onClick={() => {
                    setWithdrawals(withdrawals.filter(x => x.id !== w.id));
                    alert(`💸 Đã duyệt chi tiền thành công cho: ${w.guide}`);
                  }}
                >
                  Xác nhận Chuyển khoản
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Gameplay Screen
export function ScreenGameplay({
  quest,
  onBack
}: {
  quest: Quest;
  onBack: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAns, setSelectedAns] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const waypoint = quest.waypoints[currentStep] || quest.waypoints[0];

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAns(index);
    setIsAnswered(true);
    if (index === waypoint.correct) {
      setScore(score + 100);
    }
  };

  const handleNext = () => {
    if (currentStep < quest.waypoints.length - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedAns(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <div style={{ background: '#132E1F', minHeight: '100vh', color: '#F5F0E8', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(245,240,232,0.1)' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#A8C4B4', cursor: 'pointer', fontSize: 14 }}>
          ← Rời Game
        </button>
        <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 16, margin: 0, color: '#E8A234' }}>{quest.name}</h3>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, background: 'rgba(201,125,26,0.2)', padding: '4px 10px', borderRadius: 4, color: '#E8A234' }}>
          ⭐ Điểm: {score}
        </div>
      </div>

      {/* Main Gameplay Canvas */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 540, background: '#FDFAF5', color: '#1A1A18', borderRadius: 12, padding: 32, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
          {!isFinished ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#1C4A32', fontWeight: 700, background: 'rgba(28,74,50,0.1)', padding: '2px 8px', borderRadius: 2 }}>
                  TRẠM {currentStep + 1} / {quest.waypoints.length}
                </span>
                <span style={{ fontSize: 12, color: '#9A9080', fontFamily: 'JetBrains Mono, monospace' }}>GPS ACTIVE</span>
              </div>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: '#1C4A32', margin: '0 0 12px' }}>{waypoint.name}</h2>
              <div style={{ background: '#F5F0E8', padding: 14, borderRadius: 6, marginBottom: 20, borderLeft: '3px solid #C97D1A' }}>
                <p style={{ fontSize: 13, color: '#6B6355', lineHeight: 1.5, margin: 0 }}>"{waypoint.script}"</p>
              </div>

              <p style={{ fontSize: 15, fontWeight: 600, color: '#1A1A18', marginBottom: 16 }}>❓ {waypoint.question}</p>

              <div style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
                {waypoint.answers.map((ans, idx) => {
                  let bg = '#FDFAF5';
                  let border = '1px solid rgba(107,99,85,0.2)';
                  if (isAnswered) {
                    if (idx === waypoint.correct) {
                      bg = 'rgba(42,97,71,0.15)';
                      border = '2px solid #2A6147';
                    } else if (idx === selectedAns) {
                      bg = 'rgba(211,47,47,0.15)';
                      border = '2px solid #D32F2F';
                    }
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      disabled={isAnswered}
                      style={{ padding: '12px 16px', borderRadius: 6, border, background: bg, textAlign: 'left', cursor: 'pointer', fontSize: 14, fontFamily: 'Outfit, sans-serif', fontWeight: 500 }}
                    >
                      {String.fromCharCode(65 + idx)}. {ans}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleNext}>
                  {currentStep < quest.waypoints.length - 1 ? 'Đi tiếp Trạm Kế Tiếp →' : 'Xem Kết Quả Hoàn Thành 🎉'}
                </button>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
              <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 700, color: '#1C4A32', margin: '0 0 8px' }}>Chúc mừng bạn đã hoàn thành Quest!</h2>
              <p style={{ fontSize: 14, color: '#6B6355', marginBottom: 20 }}>Bạn đã xuất sắc giải mã toàn bộ bí mật tại {quest.city}.</p>
              <div style={{ background: 'rgba(201,125,26,0.1)', padding: 16, borderRadius: 8, marginBottom: 24 }}>
                <p style={{ fontSize: 12, color: '#C97D1A', fontFamily: 'JetBrains Mono, monospace', margin: '0 0 4px', fontWeight: 600 }}>TỔNG ĐIỂM THƯỞNG</p>
                <p style={{ fontFamily: 'Fraunces, serif', fontSize: 36, fontWeight: 700, color: '#1C4A32', margin: 0 }}>+{score + 350} pts</p>
              </div>
              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onBack}>
                Trở về Trang chủ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
