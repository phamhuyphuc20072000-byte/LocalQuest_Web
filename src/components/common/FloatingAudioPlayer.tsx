import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  SkipBack, 
  SkipForward, 
  X, 
  Radio, 
  ChevronUp, 
  ChevronDown, 
  Disc, 
  Minimize2, 
  Maximize2,
  Volume2,
  Sparkles
} from 'lucide-react';
import { useQuest } from '../../context/QuestContext';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0];

export function FloatingAudioPlayer() {
  const { 
    audioTrack, 
    toggleAudioPlay, 
    seekAudio, 
    skipAudio, 
    setPlaybackRate, 
    nextAudioTrack, 
    prevAudioTrack, 
    stopAudio,
    toggleMinimizeAudio 
  } = useQuest();

  const [isScriptExpanded, setIsScriptExpanded] = useState(false);
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);

  if (!audioTrack) return null;

  const progressPercent = audioTrack.duration > 0 
    ? Math.min(100, Math.max(0, (audioTrack.currentTime / audioTrack.duration) * 100)) 
    : 0;

  // 1. Minimized Mode: Spinning Gold Vinyl Record
  if (audioTrack.isMinimized) {
    return (
      <div 
        id="floating-audio-minimized-vinyl"
        className="fixed bottom-6 left-6 z-40 animate-in zoom-in-75 duration-300"
      >
        <div className="relative group cursor-pointer" onClick={toggleMinimizeAudio}>
          
          {/* Vinyl Disc Container */}
          <div 
            className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center relative border-2 border-[#D4AF37] transition-all duration-300 group-hover:scale-110 ${
              audioTrack.isPlaying ? 'animate-spin [animation-duration:6s]' : ''
            }`}
            style={{
              background: 'radial-gradient(circle, #2A2416 0%, #151815 50%, #0B1710 100%)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(212, 175, 55, 0.35)'
            }}
          >
            {/* Vinyl Grooves Pattern */}
            <div className="absolute inset-2 rounded-full border border-amber-500/20 pointer-events-none" />
            <div className="absolute inset-3.5 rounded-full border border-stone-600/30 pointer-events-none" />
            <div className="absolute inset-5 rounded-full border border-amber-500/20 pointer-events-none" />

            {/* Center Gold Label */}
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center border border-amber-300 shadow-inner"
              style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />
            </div>
          </div>

          {/* Quick Play/Pause Badge Overlay */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleAudioPlay();
            }}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0F2D1E] border border-[#D4AF37] text-amber-300 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
            title={audioTrack.isPlaying ? 'Tạm dừng' : 'Phát tiếp'}
          >
            {audioTrack.isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
          </button>

          {/* Equalizer Indicator & Tooltip on Hover */}
          <div className="absolute left-20 bottom-1 bg-[#0F2D1E]/95 border border-[#D4AF37]/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs text-amber-100 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex items-center gap-2">
            <Disc size={14} className="text-amber-400 animate-spin" />
            <div className="text-left">
              <p className="font-heritage font-bold text-amber-200 text-[11px] m-0 max-w-[140px] truncate">{audioTrack.title}</p>
              <p className="font-mono text-[9px] text-stone-400 m-0">{formatTime(audioTrack.currentTime)} / {formatTime(audioTrack.duration)}</p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // 2. Full Floating Player Bar
  return (
    <div 
      id="floating-audio-player"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl animate-in slide-in-from-bottom-6 duration-300"
    >
      <div 
        className="rounded-2xl shadow-2xl p-4 sm:p-5 transition-all duration-300 border relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(12, 38, 25, 0.96) 0%, rgba(18, 22, 18, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          borderColor: '#D4AF37',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), 0 0 25px rgba(212, 175, 55, 0.25)'
        }}
      >
        {/* Top Header Row: Badge, Live Waveform, Actions */}
        <div className="flex items-center justify-between gap-3 mb-3">
          
          {/* Badge & City */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-amber-500/40 flex items-center gap-1.5 flex-shrink-0">
              <Radio size={11} className="animate-pulse text-amber-400" />
              <span>THUYẾT MINH DI SẢN</span>
            </span>

            {audioTrack.waypointIndex !== undefined && (
              <span className="text-[11px] font-mono text-stone-300 bg-white/10 px-2 py-0.5 rounded border border-white/10 flex-shrink-0">
                Trạm {audioTrack.waypointIndex + 1}
              </span>
            )}
          </div>

          {/* Realtime Waveform Equalizer */}
          <div className="flex items-center gap-1 h-5 px-2 py-1 rounded-md bg-black/30 border border-amber-500/10">
            {[40, 75, 100, 60, 90, 45, 80, 100, 70, 50, 85, 65].map((heightPct, idx) => (
              <span 
                key={idx} 
                className={`w-1 rounded-full transition-all duration-200 ${
                  audioTrack.isPlaying ? 'bg-gradient-to-t from-amber-400 to-emerald-400' : 'bg-stone-600'
                }`}
                style={{
                  height: audioTrack.isPlaying ? `${Math.max(20, (heightPct * ((idx % 3 + 1) / 3)))}%` : '25%',
                  animation: audioTrack.isPlaying ? `pulse 0.8s ease-in-out infinite alternate ${idx * 0.08}s` : 'none'
                }}
              />
            ))}
          </div>

          {/* Action Buttons: Speed, Minimize, Close */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            
            {/* Speed Selector */}
            <div className="relative">
              <button
                id="btn-audio-speed"
                onClick={() => setIsSpeedMenuOpen(!isSpeedMenuOpen)}
                className="px-2 py-1 rounded-lg text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-[11px] font-mono font-bold transition-colors flex items-center gap-1"
                title="Thay đổi tốc độ phát"
              >
                <span>{audioTrack.playbackRate || 1.0}x</span>
              </button>

              {isSpeedMenuOpen && (
                <div 
                  className="absolute right-0 bottom-full mb-2 bg-[#0F2D1E] border border-[#D4AF37] rounded-xl p-1.5 shadow-2xl flex flex-col gap-1 z-50 min-w-[70px] animate-in fade-in zoom-in-95"
                >
                  {SPEED_OPTIONS.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        setPlaybackRate(rate);
                        setIsSpeedMenuOpen(false);
                      }}
                      className={`px-2 py-1 rounded text-xs font-mono text-center transition-colors ${
                        (audioTrack.playbackRate || 1.0) === rate
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold'
                          : 'text-stone-300 hover:bg-white/10 hover:text-amber-300'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Minimize to Vinyl Button */}
            <button
              id="btn-audio-minimize"
              onClick={toggleMinimizeAudio}
              className="p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-white/10 transition-colors"
              title="Thu nhỏ thành đĩa xoay"
            >
              <Minimize2 size={16} />
            </button>

            {/* Expand / Collapse Script */}
            <button
              id="btn-audio-expand-script"
              onClick={() => setIsScriptExpanded(!isScriptExpanded)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-white/10 transition-colors"
              title={isScriptExpanded ? 'Ẩn lời kịch bản' : 'Xem toàn bộ lời kịch bản'}
            >
              {isScriptExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>

            {/* Stop / Close Player */}
            <button
              id="btn-audio-stop"
              onClick={stopAudio}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
              title="Dừng phát và đóng"
            >
              <X size={16} />
            </button>

          </div>
        </div>

        {/* Middle Row: Track Details & Vinyl Icon */}
        <div className="flex items-center gap-3 mb-3">
          
          {/* Mini Vinyl Art Icon */}
          <div 
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#D4AF37] shadow-md relative overflow-hidden ${
              audioTrack.isPlaying ? 'animate-pulse' : ''
            }`}
            style={{ background: 'linear-gradient(135deg, #1C4A32 0%, #0F2D1E 100%)' }}
          >
            <Sparkles size={18} className="text-amber-300" />
          </div>

          {/* Title and Quest Name */}
          <div className="flex-1 min-w-0">
            <h4 className="font-heritage text-sm sm:text-base font-bold text-amber-100 truncate m-0">
              {audioTrack.title}
            </h4>
            <p className="text-xs text-stone-400 truncate m-0 font-luxury-sans mt-0.5 flex items-center gap-1.5">
              <span className="text-amber-400 font-semibold">{audioTrack.questName}</span>
              {audioTrack.city && (
                <>
                  <span className="text-stone-600">•</span>
                  <span>{audioTrack.city}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Interactive Scrubbing Progress Bar */}
        <div className="space-y-1 mb-3">
          <div className="relative group flex items-center">
            <input
              id="audio-scrubber"
              type="range"
              min={0}
              max={audioTrack.duration || 100}
              step={0.5}
              value={audioTrack.currentTime || 0}
              onChange={(e) => seekAudio(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
              style={{
                background: `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${progressPercent}%, #2A2F2B ${progressPercent}%, #2A2F2B 100%)`
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 px-0.5">
            <span>{formatTime(audioTrack.currentTime)}</span>
            <span className="text-stone-500">/</span>
            <span>{formatTime(audioTrack.duration)}</span>
          </div>
        </div>

        {/* Playback Controls Row */}
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          
          {/* Previous Waypoint */}
          <button
            id="btn-audio-prev"
            onClick={prevAudioTrack}
            className="p-2 rounded-xl text-stone-300 hover:text-amber-300 hover:bg-white/10 transition-colors"
            title="Trạm dừng trước đó / Tua lại đầu"
          >
            <SkipBack size={18} />
          </button>

          {/* Skip -10s */}
          <button
            id="btn-audio-skip-back"
            onClick={() => skipAudio(-10)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono text-stone-300 hover:text-amber-300 hover:bg-white/10 transition-colors"
            title="Lùi lại 10 giây"
          >
            <RotateCcw size={16} />
            <span className="text-[11px]">-10s</span>
          </button>

          {/* Main Play / Pause Button */}
          <button
            id="btn-audio-toggle"
            onClick={toggleAudioPlay}
            className="w-12 h-12 rounded-full flex items-center justify-center text-stone-950 transition-transform duration-200 hover:scale-105 active:scale-95 shadow-xl flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #E6CA65 50%, #C97D1A 100%)',
              border: '2px solid #FFF',
              boxShadow: '0 0 20px rgba(212, 175, 55, 0.45)'
            }}
            title={audioTrack.isPlaying ? 'Tạm dừng' : 'Phát'}
          >
            {audioTrack.isPlaying ? (
              <Pause size={22} className="fill-stone-950" />
            ) : (
              <Play size={22} className="fill-stone-950 ml-0.5" />
            )}
          </button>

          {/* Skip +10s */}
          <button
            id="btn-audio-skip-fwd"
            onClick={() => skipAudio(10)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono text-stone-300 hover:text-amber-300 hover:bg-white/10 transition-colors"
            title="Tua tới 10 giây"
          >
            <span className="text-[11px]">+10s</span>
            <RotateCw size={16} />
          </button>

          {/* Next Waypoint */}
          <button
            id="btn-audio-next"
            onClick={nextAudioTrack}
            className="p-2 rounded-xl text-stone-300 hover:text-amber-300 hover:bg-white/10 transition-colors"
            title="Tự động phát trạm dừng tiếp theo"
          >
            <SkipForward size={18} />
          </button>

        </div>

        {/* Expanded Script Viewer */}
        {isScriptExpanded && (
          <div className="mt-4 pt-3.5 border-t border-emerald-800/60 animate-in fade-in duration-200">
            <div className="p-3.5 rounded-xl bg-black/50 border border-amber-500/20 max-h-44 overflow-y-auto">
              <div className="flex items-center gap-1.5 mb-1.5 text-amber-300 font-mono text-[11px]">
                <Volume2 size={13} />
                <span>KỊCH BẢN THUYẾT MINH NGHỆ NHÂN:</span>
              </div>
              <p className="text-xs text-stone-200 leading-relaxed font-luxury-sans italic m-0 selection:bg-amber-400 selection:text-stone-950">
                "{audioTrack.script}"
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
