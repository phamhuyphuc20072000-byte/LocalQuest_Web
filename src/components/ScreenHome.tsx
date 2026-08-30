import React, { useState, useEffect } from 'react';
import { Quest, QUESTS, QuestTheme, UserRole, formatPrice } from '../data/quests';
import { PublicHeader, PublicFooter, QuestCard } from './SharedUI';
import { TreasureMap } from './TreasureMap';
import { askGeminiAiGuide, generateGeminiStory, AIChatMessage } from '../gemini';

export function ScreenAiGuideDetailsModal({
  quest,
  onClose,
  onBook
}: {
  quest: Quest;
  onClose: () => void;
  onBook: () => void;
}) {
  const [demoInput, setDemoInput] = useState('');
  const [demoChat, setDemoChat] = useState<AIChatMessage[]>([
    {
      sender: 'ai',
      text: `🤖 Chào bạn! Tôi là Trợ Lý AI Local Bot chuyên trách của Quest "${quest.name}". Tôi hoạt động 24/7, luôn sẵn sàng thuyết minh âm thanh & giải đáp mọi thắc mắc của bạn về quán ăn ngon, lịch sử & góc chụp ảnh đẹp tại ${quest.city}!`
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [narrativeScript, setNarrativeScript] = useState<string>('');

  useEffect(() => {
    // Generate initial narration audio script for the first waypoint
    const firstWp = quest.waypoints[0];
    generateGeminiStory(firstWp?.name || quest.name, firstWp?.script || quest.story, quest.city)
      .then(script => setNarrativeScript(script));

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [quest]);

  const toggleAudioNarration = () => {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt không hỗ trợ Web Speech Audio.');
      return;
    }

    if (isPlayingDemo) {
      window.speechSynthesis.cancel();
      setIsPlayingDemo(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = narrativeScript || `Chào mừng bạn đến với Quest ${quest.name} tại ${quest.city}. ${quest.story}`;
    const clean = textToRead.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.95;

    utterance.onstart = () => setIsPlayingDemo(true);
    utterance.onend = () => setIsPlayingDemo(false);
    utterance.onerror = () => setIsPlayingDemo(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSendDemo = async (msgText?: string) => {
    const q = msgText || demoInput;
    if (!q.trim() || loading) return;

    const userMsg: AIChatMessage = { sender: 'user', text: q };
    const updatedChat = [...demoChat, userMsg];
    setDemoChat(updatedChat);
    if (!msgText) setDemoInput('');
    setLoading(true);

    try {
      const reply = await askGeminiAiGuide(q, quest.name, updatedChat, quest.city);
      setDemoChat(prev => [...prev, { sender: 'ai', text: reply }]);
    } catch (err) {
      setDemoChat(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `🤖 [AI Bot]: Đối với Quest "${quest.name}" tại ${quest.city}, tôi khuyến nghị bạn ghé thăm quán gia truyền nằm trong ngõ nhỏ để thưởng thức hương vị đặc sắc nhất!`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overlay-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#FDFAF5', borderRadius: 10, width: '100%', maxWidth: 560, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.3)', border: '1.5px solid #C97D1A' }}>
        {/* Header */}
        <div style={{ background: '#132E1F', color: '#FDFAF5', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🤖</span>
            <div>
              <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 700, margin: 0, color: '#E8A234' }}>Giới Thiệu Trợ Lý AI Local Bot 24/7</h3>
              <p style={{ fontSize: 11, color: '#A8C4B4', margin: '2px 0 0', fontFamily: 'JetBrains Mono, monospace' }}>Dành riêng cho Quest: {quest.name}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#A8C4B4', cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>
        {/* Content Body */}
        <div style={{ padding: 24 }}>
          <div style={{ background: 'rgba(201,125,26,0.08)', border: '1px solid #C97D1A', borderRadius: 6, padding: '14px 16px', marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: '#C97D1A', fontWeight: 700, margin: '0 0 4px', fontFamily: 'JetBrains Mono, monospace' }}>💡 TẠI SAO CHỌN TRỢ LÝ AI LOCAL BOT 24/7?</p>
            <p style={{ fontSize: 13, color: '#6B6355', lineHeight: 1.5, margin: 0 }}>
              Giúp bạn trải nghiệm Tour tự do 24/7 mà không phụ thuộc vào lịch rảnh của Hướng dẫn viên người thật. Bao gồm giọng đọc thuyết minh âm thanh sống động & Chatbot giải đáp thắc mắc địa phương tức thì!
            </p>
          </div>
          {/* Feature 1: Audio Narrator Demo */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 600, color: '#1C4A32', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              🎙️ 1. Thuyết Minh Giọng Đọc Âm Thanh (AI Voice Narrator)
            </h4>
            <div style={{ background: 'rgba(28,74,50,0.06)', borderRadius: 6, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid rgba(28,74,50,0.15)' }}>
              <button onClick={toggleAudioNarration} style={{ width: 38, height: 38, borderRadius: '50%', background: '#1C4A32', color: '#FDFAF5', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                {isPlayingDemo ? '⏸' : '▶'}
              </button>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1C4A32', margin: 0 }}>Nghe thử giọng thuyết minh AI</p>
                <p style={{ fontSize: 11, color: '#6B6355', margin: 0, fontFamily: 'JetBrains Mono, monospace' }}>{isPlayingDemo ? '🔊 Đang phát giọng đọc thuyết minh tiếng Việt...' : 'Bấm ▶ để nghe thử giọng thuyết minh AI'}</p>
              </div>
            </div>
          </div>
          {/* Feature 2: Interactive Sandbox */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 600, color: '#1C4A32', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              💬 2. Trò Chuyện Trực Tiếp Với AI Local Bot (Gemini 24/7)
            </h4>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {['🍜 Quán ăn ngon địa phương?', '📸 Góc chụp ảnh check-in đẹp?', '📜 Bí mật lịch sử trạm', '💡 Mẹo tránh đông đúc'].map(chip => (
                <button key={chip} disabled={loading} onClick={() => handleSendDemo(chip)} style={{ padding: '4px 10px', borderRadius: 12, background: '#F5F0E8', border: '1px solid rgba(107,99,85,0.2)', fontSize: 11, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
                  {chip}
                </button>
              ))}
            </div>
            <div style={{ background: '#F5F0E8', borderRadius: 6, padding: 12, maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, border: '1px solid rgba(107,99,85,0.15)', marginBottom: 10 }}>
              {demoChat.map((m, i) => (
                <div key={i} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', background: m.sender === 'user' ? '#1C4A32' : '#FDFAF5', color: m.sender === 'user' ? '#FFF' : '#1A1A18', padding: '8px 12px', borderRadius: 6, fontSize: 12, lineHeight: 1.4, whiteSpace: 'pre-line', border: m.sender === 'ai' ? '1px solid rgba(0,0,0,0.06)' : 'none' }}>
                  {m.text}
                </div>
              ))}
              {loading && (
                <div style={{ alignSelf: 'flex-start', background: '#FDFAF5', padding: '6px 12px', borderRadius: 6, fontSize: 11, color: '#C97D1A', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'JetBrains Mono, monospace' }}>
                  <span>⏳ AI đang phản hồi...</span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="input-field" placeholder="Chat trực tiếp với AI Bot..." value={demoInput} disabled={loading} onChange={e => setDemoInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSendDemo(); }} style={{ margin: 0, fontSize: 13 }} />
              <button className="btn-amber" disabled={loading || !demoInput.trim()} onClick={() => handleSendDemo()} style={{ padding: '0 16px', fontSize: 13, opacity: (loading || !demoInput.trim()) ? 0.6 : 1 }}>
                {loading ? '...' : 'Gửi'}
              </button>
            </div>
          </div>
          {/* Pricing & CTA */}
          <div style={{ background: 'linear-gradient(135deg, rgba(28,74,50,0.06), rgba(201,125,26,0.08))', borderRadius: 6, padding: 16, border: '1px solid rgba(201,125,26,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 12, color: '#6B6355', margin: 0 }}>Giá Vé AI 24/7 Tự Do Trọn Gói:</p>
              <p style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 700, color: '#1C4A32', margin: '2px 0 0' }}>{formatPrice(Math.round(quest.price * 0.35))}</p>
            </div>
            <button className="btn-amber" onClick={() => { onClose(); onBook(); }} style={{ padding: '12px 20px', fontSize: 14, fontWeight: 700 }}>
              🎟️ Đặt Vé AI 24/7 Ngay →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ScreenA1({
  onQuestClick,
  onLogin,
  onLogout,
  onGuidePortal,
  user,
  userEmail,
  onPlayGame
}: {
  onQuestClick: (q: Quest) => void;
  onLogin: () => void;
  onLogout: () => void;
  onGuidePortal: () => void;
  user: UserRole;
  userEmail?: string;
  onPlayGame: () => void;
}) {
  const [searchCity, setSearchCity] = useState('');
  const [theme, setTheme] = useState<QuestTheme>('Tất cả');
  const [distance, setDistance] = useState(10);
  const themes: QuestTheme[] = ['Tất cả', 'Ẩm thực', 'Lịch sử', 'Bí ẩn', 'Đêm'];

  const filtered = QUESTS.filter(q => {
    const cityMatch = !searchCity || q.city.toLowerCase().includes(searchCity.toLowerCase());
    const themeMatch = theme === 'Tất cả' || q.theme === theme;
    const distMatch = parseFloat(q.distance) <= distance;
    return cityMatch && themeMatch && distMatch;
  });

  return (
    <div style={{ background: '#F5F0E8', minHeight: '100vh' }}>
      <PublicHeader user={user} userEmail={userEmail} onLogin={onLogin} onLogout={onLogout} onGuidePortal={onGuidePortal} onHome={() => {}} onPlayGame={onPlayGame} />
      {/* Hero */}
      <div style={{
        position: 'relative',
        padding: '64px 24px 72px',
        overflow: 'hidden'
      }}>
        {/* Moving travel background image */}
        <div className="hero-bg-animated" />
        {/* Dark vignette gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(13, 34, 23, 0.82) 0%, rgba(19, 46, 32, 0.90) 70%, #132E1F 100%)',
          zIndex: 1
        }} />
        {/* Subtle grid pattern overlay */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.12, backgroundImage: 'radial-gradient(circle, #E8A234 1px, transparent 1px)', backgroundSize: '28px 28px', zIndex: 1 }} />
        
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          {/* Travel badges */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
            <span style={{ background: 'rgba(232,162,52,0.2)', border: '1px solid #E8A234', color: '#F5F0E8', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>
              📍 KHÁM PHÁ ĐỊA PHƯƠNG
            </span>
            <span style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(245,240,232,0.25)', color: '#F5F0E8', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}>
              🚶 Walking Tour Độc Bản
            </span>
            <span style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(245,240,232,0.25)', color: '#F5F0E8', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}>
              ⭐ 4.9/5 Trải nghiệm 5 sao
            </span>
          </div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 54, fontWeight: 700, color: '#F5F0E8', lineHeight: 1.15, marginBottom: 18, maxWidth: 650, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
            Mỗi con phố là<br /><em style={{ color: '#E8A234', fontStyle: 'italic' }}>một kho báu</em> chờ bạn
          </h1>
          
          <p style={{ fontSize: 17, color: 'rgba(245,240,232,0.92)', maxWidth: 520, lineHeight: 1.65, marginBottom: 28, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
            Hòa mình vào những Quest walking tour được thiết kế bởi người dân địa phương — từ ẩm thực bí mật đến bí ẩn lịch sử.
          </p>
          {/* Travel Stats Banner */}
          <div style={{ display: 'flex', gap: 28, marginBottom: 36, color: '#F5F0E8', fontSize: 13, flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#E8A234', fontFamily: 'Fraunces, serif', display: 'block' }}>12+</span>
              <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.7)', fontFamily: 'JetBrains Mono, monospace' }}>Hành trình bí ẩn</span>
            </div>
            <div style={{ borderLeft: '1px solid rgba(245,240,232,0.2)', paddingLeft: 28 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#E8A234', fontFamily: 'Fraunces, serif', display: 'block' }}>4</span>
              <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.7)', fontFamily: 'JetBrains Mono, monospace' }}>Thành phố di sản</span>
            </div>
            <div style={{ borderLeft: '1px solid rgba(245,240,232,0.2)', paddingLeft: 28 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#E8A234', fontFamily: 'Fraunces, serif', display: 'block' }}>2,500+</span>
              <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.7)', fontFamily: 'JetBrains Mono, monospace' }}>Du khách hài lòng</span>
            </div>
          </div>
          {/* Search bar */}
          <div style={{ background: '#FDFAF5', borderRadius: 8, padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, alignItems: 'end', maxWidth: 880, boxShadow: '0 12px 40px rgba(0,0,0,0.35)', border: '1px solid rgba(201,125,26,0.3)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#6B6355', marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Thành phố</label>
              <input className="input-field" placeholder="Hà Nội, Hội An..." value={searchCity} onChange={e => setSearchCity(e.target.value)} style={{ margin: 0 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#6B6355', marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Chủ đề</label>
              <select className="input-field" value={theme} onChange={e => setTheme(e.target.value as QuestTheme)} style={{ margin: 0 }}>
                {themes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#6B6355', marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Cự ly tối đa: {distance} km</label>
              <input type="range" min={1} max={15} value={distance} onChange={e => setDistance(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#1C4A32', cursor: 'pointer', margin: '6px 0' }} />
            </div>
            <button className="btn-primary" style={{ height: 42, padding: '0 28px', fontSize: 14, fontWeight: 600 }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginRight: 6 }}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
              Tìm Quest
            </button>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
        {/* Quest list */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: '#1A1A18' }}>
              {filtered.length} Quest {theme !== 'Tất cả' ? `— ${theme}` : 'khám phá'}
            </h2>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {themes.filter(t => t !== 'Tất cả').map(t => (
                <button key={t} onClick={() => setTheme(theme === t ? 'Tất cả' : t)}
                  style={{ padding: '5px 12px', borderRadius: 2, border: '1px solid', fontSize: 12, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.04em', background: theme === t ? '#1C4A32' : 'transparent', color: theme === t ? '#F5F0E8' : '#6B6355', borderColor: theme === t ? '#1C4A32' : 'rgba(107,99,85,0.3)' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9A9080' }}>
              <p style={{ fontFamily: 'Fraunces, serif', fontSize: 20, marginBottom: 8 }}>Không tìm thấy Quest phù hợp</p>
              <p style={{ fontSize: 14 }}>Thử thay đổi bộ lọc để khám phá thêm</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {filtered.map(q => <QuestCard key={q.id} q={q} onClick={() => onQuestClick(q)} />)}
            </div>
          )}
        </div>
        {/* Treasure Map sidebar (Real Leaflet Map) */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 17, fontWeight: 600, color: '#1A1A18' }}>Bản đồ kho báu (OpenStreetMap)</h3>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#1C4A32', fontWeight: 600, background: 'rgba(28,74,50,0.1)', padding: '2px 6px', borderRadius: 2 }}>TƯƠNG TÁC THẬT</span>
          </div>
          <TreasureMap onQuestClick={onQuestClick} selectedCity={searchCity || 'Tất cả'} />
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(201,125,26,0.08)', borderRadius: 4, borderLeft: '3px solid #C97D1A' }}>
            <p style={{ fontSize: 12, color: '#6B6355', lineHeight: 1.5, margin: 0 }}>
              Tọa độ chi tiết từng trạm dừng sẽ hiển thị chính xác khi du khách mở ứng dụng chơi Quest thực địa.
            </p>
          </div>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16 }}>
            {[
              { label: 'Quest hoạt động', value: '47' },
              { label: 'Hướng dẫn viên', value: '23' },
              { label: 'Thành phố', value: '8' },
              { label: 'Lượt hoàn thành', value: '2.4k' },
            ].map(s => (
              <div key={s.label} style={{ background: '#FDFAF5', border: '1px solid rgba(107,99,85,0.12)', borderRadius: 4, padding: '10px 14px' }}>
                <p style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, color: '#1C4A32', margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: '#9A9080', margin: 0, marginTop: 2 }}>{s.label}</p>
              </div>
            ))}
          </div>
          {/* AI Local Guide Feature Banner */}
          <div className="card" style={{ marginTop: 16, padding: 18, border: '1.5px solid #C97D1A', background: 'linear-gradient(135deg, #FDFAF5, rgba(201,125,26,0.06))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 24 }}>🤖</span>
              <div>
                <h4 style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 700, color: '#1C4A32', margin: 0 }}>Trợ Lý AI Local Bot 24/7</h4>
                <p style={{ fontSize: 10, color: '#C97D1A', margin: 0, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>TỰ ĐỘNG · ONLINE TOÀN QUỐC</p>
              </div>
            </div>
            <p style={{ fontSize: 12, color: '#6B6355', lineHeight: 1.5, margin: '0 0 10px' }}>
              Mỗi Quest đều tích hợp sẵn Chế độ Trợ Lý AI 24/7! Giúp bạn tự do đi chơi bất kỳ lúc nào với giá vé ưu đãi giảm 65%.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#2A6147', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>
              <span>✓ Audio Thuyết minh</span>
              <span>•</span>
              <span>✓ Chat hỏi đáp 24/7</span>
            </div>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
