import React, { useState } from 'react';
import {
  MapPin,
  Compass,
  Navigation,
  CheckCircle2,
  Sparkles,
  Award,
  ExternalLink,
  LocateFixed,
  Camera,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Quest, UserProfile } from '../types';

interface InteractiveMapProps {
  quests: Quest[];
  user: UserProfile | null;
  onSelectQuest: (quest: Quest) => void;
  onOpenAuthModal: () => void;
  onCompleteQuest: (questId: string, points: number) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  quests,
  user,
  onSelectQuest,
  onOpenAuthModal,
  onCompleteQuest
}) => {
  const [selectedQuestId, setSelectedQuestId] = useState<string>(quests[0]?.id || '');
  const [activeCheckpointIndex, setActiveCheckpointIndex] = useState(0);
  const [simulatedGps, setSimulatedGps] = useState(false);

  const selectedQuest = quests.find((q) => q.id === selectedQuestId) || quests[0];

  const handleSimulateGpsCheckIn = () => {
    setSimulatedGps(true);
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 }
    });
    setTimeout(() => setSimulatedGps(false), 3000);
  };

  return (
    <div id="interactive-map-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in text-stone-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            Bản đồ Nhiệm vụ & Định vị Checkpoint
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Bản Đồ Hành Trình Trải Nghiệm Bản Địa
          </h2>
        </div>

        {/* Quest Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400 font-medium">Hành trình:</span>
          <select
            id="map-quest-selector"
            value={selectedQuestId}
            onChange={(e) => {
              setSelectedQuestId(e.target.value);
              setActiveCheckpointIndex(0);
            }}
            className="px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-100 text-xs font-semibold focus:outline-none focus:border-amber-500 cursor-pointer shadow-sm"
          >
            {quests.map((q) => (
              <option key={q.id} value={q.id}>
                {q.destination}: {q.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Visual Map Canvas + Checkpoint Sidepanel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Map Stage */}
        <div className="lg:col-span-2 bg-stone-950 border border-stone-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[480px]">
          {/* Map Grid Background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>

          {/* Top Status Overlay */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-stone-900/90 backdrop-blur px-3 py-1.5 rounded-xl border border-stone-700/80 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-semibold text-white">{selectedQuest.destination}</span>
              <span className="text-stone-400">({selectedQuest.checkpoints.length} Checkpoints)</span>
            </div>

            <button
              onClick={handleSimulateGpsCheckIn}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-stone-950 text-xs font-semibold transition-all shadow-md"
            >
              <LocateFixed className="w-3.5 h-3.5" />
              <span>{simulatedGps ? 'Đã kích hoạt GPS ảo!' : 'Mô phỏng GPS Check-in'}</span>
            </button>
          </div>

          {/* Center Stage: Interactive Route & Checkpoint Markers */}
          <div className="relative z-10 my-8 flex items-center justify-around flex-wrap gap-6">
            {selectedQuest.checkpoints.map((cp, idx) => {
              const isSelected = activeCheckpointIndex === idx;

              return (
                <div
                  key={cp.id}
                  onClick={() => setActiveCheckpointIndex(idx)}
                  className="flex flex-col items-center gap-2 cursor-pointer group"
                >
                  <div
                    className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 scale-110 shadow-lg shadow-amber-500/30 border-2 border-white'
                        : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-700'
                    }`}
                  >
                    <span className="font-extrabold text-base">{idx + 1}</span>
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400"></div>
                  </div>

                  <div className="text-center max-w-[120px]">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-amber-400' : 'text-stone-300'}`}>
                      {cp.title.split(':')[1] || cp.title}
                    </p>
                    <p className="text-[10px] text-stone-500 truncate">{cp.locationName}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Quest Info Bar */}
          <div className="relative z-10 bg-stone-900/90 backdrop-blur p-4 rounded-2xl border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-white text-sm">{selectedQuest.title}</p>
              <p className="text-stone-400 text-[11px] mt-0.5">
                Host: <span className="text-stone-200">{selectedQuest.hostName}</span> ({selectedQuest.hostBadge})
              </p>
            </div>

            <button
              onClick={() => onSelectQuest(selectedQuest)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
            >
              <span>Xem Toàn Bộ Lộ Trình</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Sidepanel: Active Checkpoint Focus */}
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-5 flex flex-col justify-between shadow-xl">
          {selectedQuest.checkpoints[activeCheckpointIndex] && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center">
                    {activeCheckpointIndex + 1}
                  </span>
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    Trạm Đang Chọn
                  </span>
                </div>
                <span className="text-xs text-stone-400 font-mono">
                  ~{selectedQuest.checkpoints[activeCheckpointIndex].estimatedMinutes} phút
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base text-white">
                  {selectedQuest.checkpoints[activeCheckpointIndex].title}
                </h3>
                <p className="text-xs text-stone-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-500" />
                  <span>{selectedQuest.checkpoints[activeCheckpointIndex].locationName}</span>
                </p>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800/80">
                {selectedQuest.checkpoints[activeCheckpointIndex].description}
              </p>

              {/* Task Challenge */}
              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Thử thách cần hoàn thành:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {selectedQuest.checkpoints[activeCheckpointIndex].taskDescription}
                </p>
              </div>

              {/* Local Secret Tip */}
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 text-xs space-y-1">
                <span className="font-bold text-amber-400">💡 Mẹo bản địa:</span>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  {selectedQuest.checkpoints[activeCheckpointIndex].localTip}
                </p>
              </div>

              {/* Photo Prompt */}
              {selectedQuest.checkpoints[activeCheckpointIndex].photoSpotPrompt && (
                <div className="flex items-start gap-2 text-xs text-stone-400 bg-stone-950/40 p-2.5 rounded-xl border border-stone-800">
                  <Camera className="w-4 h-4 text-stone-500 flex-shrink-0 mt-0.5" />
                  <span className="text-[11px]">
                    {selectedQuest.checkpoints[activeCheckpointIndex].photoSpotPrompt}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Trigger */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (!user) {
                  onOpenAuthModal();
                } else {
                  handleSimulateGpsCheckIn();
                }
              }}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{user ? 'Xác nhận Check-in Trạm Này' : 'Đăng nhập để Check-in & Tích Điểm'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
