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
  Volume2,
  Sparkles,
  Mic,
  Check,
  BookOpen,
  MapPin
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
    toggleMinimizeAudio,
    selectedVoiceId,
    setSelectedVoiceId,
    availableVoices
  } = useQuest();

  const [isScriptExpanded, setIsScriptExpanded] = useState(true); // Default to showing full script so words are never lost
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
  const [isVoiceMenuOpen, setIsVoiceMenuOpen] = useState(false);

  if (!audioTrack) return null;

  const currentVoiceObj = availableVoices.find((v) => v.id === selectedVoiceId) || availableVoices[0];

  const progressPercent = audioTrack.duration > 0 
    ? Math.min(100, Math.max(0, (audioTrack.currentTime / audioTrack.duration) * 100)) 
    : 0;

  // 1. Minimized Mode: Spinning Gold Vinyl Record
  if (audioTrack.isMinimized) {
    return (
      <div 
        id="floating-audio-minimized-vinyl"
        className="fixed bottom-6 left-6 z-50 animate-in zoom-in-75 duration-300"
      >
        <div className="relative group cursor-pointer" onClick={toggleMinimizeAudio}>
          
          {/* Vinyl Disc Container */}
          <div 
            className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center relative border-2 border-[#D4AF37] transition-all duration-300 group-hover:scale-110 ${
              audioTrack.isPlaying ? 'animate-spin [animation-duration:6s]' : ''
            }`}
            style={{
              background: 'radial-gradient(circle, #2A2416 0%, #151815 50%, #0B1710 100%)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px rgba(212, 175, 55, 0.4)'
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
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#0F2D1E] border border-[#D4AF37] text-amber-300 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer"
            title={audioTrack.isPlaying ? 'Tạm dừng' : 'Phát tiếp'}
          >
            {audioTrack.isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
          </button>

          {/* Equalizer Tooltip on Hover */}
          <div className="absolute left-20 bottom-1 bg-[#0F2D1E]/95 border border-[#D4AF37]/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs text-amber-100 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex items-center gap-2">
            <Disc size={14} className="text-amber-400 animate-spin" />
            <div className="text-left">
              <p className="font-heritage font-bold text-amber-200 text-[11px] m-0 max-w-[150px] truncate">{audioTrack.title}</p>
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
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl animate-in slide-in-from-bottom-6 duration-300"
    >
      <div 
        className="rounded-2xl shadow-2xl p-4 sm:p-5 transition-all duration-300 border-2 relative overflow-hidden bg-[#0A1A12]/98 backdrop-blur-2xl"
        style={{
          borderColor: '#D4AF37',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(212, 175, 55, 0.3)'
        }}
      >
        {/* Top Header Row: Badge, Live Waveform, Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          
          {/* Badge & City */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-amber-500/40 flex items-center gap-1.5 flex-shrink-0">
              <Radio size={11} className="animate-pulse text-amber-400" />
              <span>THUYẾT MINH DI SẢN</span>
            </span>

            {audioTrack.city && (
              <span className="text-[10px] font-mono text-stone-300 bg-white/10 px-2 py-0.5 rounded border border-white/10 flex-shrink-0 flex items-center gap-1">
                <MapPin size={9} className="text-amber-400" />
                {audioTrack.city}
              </span>
            )}
          </div>

          {/* Realtime Waveform Equalizer */}
          <div className="flex items-center gap-1 h-5 px-2 py-1 rounded-md bg-black/40 border border-amber-500/15">
            {[40, 75, 100, 60, 90, 45, 80, 100, 70, 50, 85, 65].map((heightPct, idx) => (
              <span 
                key={idx} 
                className={`w-1 rounded-full transition-all duration-200 ${
                  audioTrack.isPlaying ? 'bg-gradient-to-t from-amber-400 to-emerald-400' : 'bg-stone-600'
                }`}
                style={{
                  height: audioTrack.isPlaying ? `${Math.max(25, (heightPct * ((idx % 3 + 1) / 3)))}%` : '25%',
                  animation: audioTrack.isPlaying ? `pulse 0.7s ease-in-out infinite alternate ${idx * 0.06}s` : 'none'
                }}
              />
            ))}
          </div>

          {/* Action Buttons: Voice, Speed, Minimize, Close */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            
            {/* Native Vietnamese Voice Selector */}
            <div className="relative">
              <button
                id="btn-audio-voice-selector"
                onClick={() => {
                  setIsVoiceMenuOpen(!isVoiceMenuOpen);
                  setIsSpeedMenuOpen(false);
                }}
                className="px-2.5 py-1 rounded-lg text-amber-200 bg-amber-500/15 border border-amber-400/40 hover:bg-amber-500/25 text-[11px] font-mono font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Chọn giọng đọc người Việt bản địa"
              >
                <Mic size={12} className="text-amber-400" />
                <span className="max-w-[80px] sm:max-w-[120px] truncate">
                  {currentVoiceObj ? (currentVoiceObj.gender === 'Nữ' ? 'Nữ Việt' : 'Nam Việt') : 'Giọng Việt'}
                </span>
                <ChevronDown size={11} className="text-amber-400/80" />
              </button>

              {isVoiceMenuOpen && (
                <div 
                  className="absolute right-0 bottom-full mb-2 bg-[#0C2418] border-2 border-[#D4AF37] rounded-2xl p-2.5 shadow-2xl flex flex-col gap-1.5 z-50 w-72 sm:w-80 animate-in fade-in zoom-in-95"
                  style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 20px rgba(212,175,55,0.3)' }}
                >
                  <div className="px-1 py-1 border-b border-emerald-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1.5">
                      <Mic size={13} />
                      <span>GIỌNG ĐỌC NGƯỜI VIỆT THUẦN TÚY</span>
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      100% BẢN ĐỊA
                    </span>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-0.5 mt-1">
                    {availableVoices.map((voice) => {
                      const isSelected = selectedVoiceId === voice.id;
                      return (
                        <button
                          key={voice.id}
                          onClick={() => {
                            setSelectedVoiceId(voice.id);
                            setIsVoiceMenuOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl transition-all flex items-start justify-between gap-2 cursor-pointer border ${
                            isSelected
                              ? 'bg-gradient-to-r from-amber-500/25 to-emerald-800/40 border-amber-400 text-amber-100 shadow-xs'
                              : 'bg-black/20 hover:bg-white/10 border-white/5 text-stone-300 hover:text-white'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-heritage text-xs font-bold text-amber-200">
                                {voice.name}
                              </span>
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400/15 text-amber-300 border border-amber-400/20">
                                {voice.gender}
                              </span>
                            </div>
                            <p className="text-[10px] text-stone-400 font-luxury-sans m-0 mt-0.5 truncate">
                              {voice.description}
                            </p>
                          </div>
                          {isSelected && <Check size={14} className="text-amber-400 flex-shrink-0 mt-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Speed Selector */}
            <div className="relative">
              <button
                id="btn-audio-speed"
                onClick={() => {
                  setIsSpeedMenuOpen(!isSpeedMenuOpen);
                  setIsVoiceMenuOpen(false);
                }}
                className="px-2 py-1 rounded-lg text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-[11px] font-mono font-bold transition-colors flex items-center gap-1 cursor-pointer"
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
                      className={`px-2 py-1 rounded text-xs font-mono text-center transition-colors cursor-pointer ${
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

            {/* Toggle Subtitles / Script */}
            <button
              id="btn-audio-expand-script"
              onClick={() => setIsScriptExpanded(!isScriptExpanded)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isScriptExpanded 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'text-stone-400 hover:text-amber-300 hover:bg-white/10 border-transparent'
              }`}
              title={isScriptExpanded ? 'Thu gọn lời kịch bản' : 'Hiện lời kịch bản thuyết minh'}
            >
              <BookOpen size={15} />
            </button>

            {/* Minimize to Vinyl Button */}
            <button
              id="btn-audio-minimize"
              onClick={toggleMinimizeAudio}
              className="p-1.5 rounded-lg text-stone-400 hover:text-amber-300 hover:bg-white/10 transition-colors cursor-pointer"
              title="Thu nhỏ thành đĩa xoay"
            >
              <Minimize2 size={15} />
            </button>

            {/* Stop / Close Player */}
            <button
              id="btn-audio-stop"
              onClick={stopAudio}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer"
              title="Dừng phát và đóng"
            >
              <X size={15} />
            </button>

          </div>
        </div>

        {/* Middle Row: Track Title & Info */}
        <div className="flex items-center gap-3 mb-2.5">
          {/* Mini Vinyl Icon */}
          <div 
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#D4AF37] shadow-md relative overflow-hidden ${
              audioTrack.isPlaying ? 'animate-pulse' : ''
            }`}
            style={{ background: 'linear-gradient(135deg, #1C4A32 0%, #0F2D1E 100%)' }}
          >
            <Sparkles size={16} className="text-amber-300" />
          </div>

          {/* Title and Quest */}
          <div className="flex-1 min-w-0">
            <h4 className="font-heritage text-sm sm:text-base font-bold text-amber-100 truncate m-0">
              {audioTrack.title}
            </h4>
            <p className="text-xs text-stone-400 truncate m-0 font-luxury-sans mt-0.5 flex items-center gap-1.5">
              <span className="text-amber-400 font-semibold">{audioTrack.questName}</span>
              {audioTrack.waypointIndex !== undefined && (
                <>
                  <span className="text-stone-600">•</span>
                  <span>Trạm {audioTrack.waypointIndex + 1}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Live Subtitle / Heritage Transcript Display (KHÔNG BỊ MẤT CHỮ) */}
        {isScriptExpanded && (
          <div className="mb-3 p-3 rounded-xl bg-black/60 border border-amber-500/25 max-h-32 sm:max-h-36 overflow-y-auto shadow-inner animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold text-amber-300 flex items-center gap-1.5 uppercase">
                <Volume2 size={12} className={audioTrack.isPlaying ? 'text-amber-400 animate-pulse' : 'text-stone-400'} />
                <span>Lời thuyết minh bản địa:</span>
              </span>
              <span className="text-[9px] font-mono text-stone-400">
                {audioTrack.isPlaying ? 'Đang đọc...' : 'Đã tạm dừng'}
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-stone-100 leading-relaxed font-luxury-sans m-0 selection:bg-amber-400 selection:text-stone-950 font-medium">
              "{audioTrack.script}"
            </p>
          </div>
        )}

        {/* Interactive Progress Scrubber Bar */}
        <div className="space-y-1 mb-3">
          <div className="relative group flex items-center">
            <input
              id="audio-scrubber"
              type="range"
              min={0}
              max={Math.max(1, audioTrack.duration || 30)}
              step={0.2}
              value={audioTrack.currentTime || 0}
              onChange={(e) => seekAudio(parseFloat(e.target.value))}
              className="w-full h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
              style={{
                background: `linear-gradient(to right, #D4AF37 0%, #D4AF37 ${progressPercent}%, #1E2620 ${progressPercent}%, #1E2620 100%)`
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-stone-300 px-0.5">
            <span className="text-amber-300 font-bold">{formatTime(audioTrack.currentTime)}</span>
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
            className="p-2 rounded-xl text-stone-300 hover:text-amber-300 hover:bg-white/10 transition-colors cursor-pointer"
            title="Trạm dừng trước đó / Tua lại đầu"
          >
            <SkipBack size={18} />
          </button>

          {/* Skip -10s */}
          <button
            id="btn-audio-skip-back"
            onClick={() => skipAudio(-10)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono text-stone-300 hover:text-amber-300 hover:bg-white/10 transition-colors cursor-pointer"
            title="Lùi lại 10 giây"
          >
            <RotateCcw size={16} />
            <span className="text-[11px]">-10s</span>
          </button>

          {/* Main Play / Pause Button */}
          <button
            id="btn-audio-toggle"
            onClick={toggleAudioPlay}
            className="w-12 h-12 rounded-full flex items-center justify-center text-stone-950 transition-transform duration-200 hover:scale-105 active:scale-95 shadow-xl flex-shrink-0 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #E6CA65 50%, #C97D1A 100%)',
              border: '2px solid #FFF',
              boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)'
            }}
            title={audioTrack.isPlaying ? 'Tạm dừng' : 'Phát thuyết minh'}
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
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono text-stone-300 hover:text-amber-300 hover:bg-white/10 transition-colors cursor-pointer"
            title="Tua tới 10 giây"
          >
            <span className="text-[11px]">+10s</span>
            <RotateCw size={16} />
          </button>

          {/* Next Waypoint */}
          <button
            id="btn-audio-next"
            onClick={nextAudioTrack}
            className="p-2 rounded-xl text-stone-300 hover:text-amber-300 hover:bg-white/10 transition-colors cursor-pointer"
            title="Tự động phát trạm dừng tiếp theo"
          >
            <SkipForward size={18} />
          </button>

        </div>

      </div>
    </div>
  );
}
