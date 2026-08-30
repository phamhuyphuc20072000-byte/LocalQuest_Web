import React from 'react';
import { Compass, Flame, History, Moon, Utensils, Award, ShieldCheck, Zap } from 'lucide-react';
import { QuestTheme } from '../../types';

interface ThemeBadgeProps {
  theme: Exclude<QuestTheme, 'Tất cả'> | string;
  size?: 'sm' | 'md';
}

export function ThemeBadge({ theme, size = 'sm' }: ThemeBadgeProps) {
  const isSm = size === 'sm';
  const sizeClasses = isSm ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs';

  let icon = <Compass size={isSm ? 11 : 13} />;
  let colorStyle = 'bg-emerald-950/80 text-amber-300 border-amber-500/30';

  if (theme === 'Ẩm thực') {
    icon = <Utensils size={isSm ? 11 : 13} />;
    colorStyle = 'bg-amber-950/80 text-amber-300 border-amber-500/40';
  } else if (theme === 'Lịch sử') {
    icon = <History size={isSm ? 11 : 13} />;
    colorStyle = 'bg-stone-900/80 text-amber-200 border-amber-400/30';
  } else if (theme === 'Bí ẩn') {
    icon = <Flame size={isSm ? 11 : 13} />;
    colorStyle = 'bg-emerald-950/90 text-emerald-200 border-emerald-400/40';
  } else if (theme === 'Đêm') {
    icon = <Moon size={isSm ? 11 : 13} />;
    colorStyle = 'bg-indigo-950/80 text-amber-200 border-indigo-500/40';
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono uppercase tracking-wider font-semibold rounded border ${sizeClasses} ${colorStyle}`}
    >
      {icon}
      <span>{theme}</span>
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  let color = 'bg-emerald-100 text-emerald-900 border-emerald-300';
  if (difficulty === 'Trung bình') {
    color = 'bg-amber-100 text-amber-900 border-amber-300';
  } else if (difficulty === 'Khó' || difficulty === 'Thử thách') {
    color = 'bg-rose-100 text-rose-900 border-rose-300';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${color}`}>
      <Zap size={10} />
      <span>{difficulty}</span>
    </span>
  );
}

export function RoleBadge({ role }: { role: 'tourist' | 'guide' | 'admin' }) {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-900/90 text-amber-300 border border-amber-500/50 text-[10px] font-mono uppercase tracking-wider">
        <ShieldCheck size={11} /> Admin Board
      </span>
    );
  }
  if (role === 'guide') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-900/90 text-emerald-300 border border-emerald-500/50 text-[10px] font-mono uppercase tracking-wider">
        <Award size={11} /> Local Guide
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-600 text-[10px] font-mono uppercase tracking-wider">
      <Compass size={11} /> Explorer
    </span>
  );
}
