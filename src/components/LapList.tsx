import React from 'react';
import { LapItem } from '../types';
import { formatTimeString } from '../utils/formatTime';

interface LapListProps {
  laps: LapItem[];
  isDark: boolean;
}

export const LapList: React.FC<LapListProps> = ({ laps, isDark }) => {
  if (laps.length === 0) {
    return null;
  }

  let fastestId: number | null = null;
  let slowestId: number | null = null;

  if (laps.length >= 2) {
    let minLap = Infinity;
    let maxLap = -Infinity;
    for (const lap of laps) {
      if (lap.lapMs < minLap) {
        minLap = lap.lapMs;
        fastestId = lap.id;
      }
      if (lap.lapMs > maxLap) {
        maxLap = lap.lapMs;
        slowestId = lap.id;
      }
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`rounded-2xl border overflow-hidden ${
          isDark
            ? 'bg-zinc-900/50 border-zinc-800/80'
            : 'bg-white border-stone-200/80 shadow-sm'
        }`}
      >
        <div
          className={`grid grid-cols-3 px-5 py-3 text-xs font-medium uppercase tracking-wider border-b ${
            isDark
              ? 'text-zinc-500 border-zinc-800/80'
              : 'text-stone-400 border-stone-100'
          }`}
        >
          <span>Volta</span>
          <span className="text-center">Tempo</span>
          <span className="text-right">Total</span>
        </div>

        <div className="max-h-56 overflow-y-auto divide-y divide-zinc-800/40">
          {laps.map((lap) => {
            const isFastest = lap.id === fastestId;
            const isSlowest = lap.id === slowestId;

            return (
              <div
                key={lap.id}
                className={`grid grid-cols-3 items-center px-5 py-3 text-sm font-mono-tabular transition-colors ${
                  isDark
                    ? 'divide-zinc-800/50 hover:bg-zinc-800/30'
                    : 'border-stone-100 hover:bg-stone-50'
                }`}
              >
                <span
                  className={`flex items-center gap-2 ${
                    isDark ? 'text-zinc-400' : 'text-stone-500'
                  }`}
                >
                  #{lap.id.toString().padStart(2, '0')}
                  {isFastest && (
                    <span className="text-[10px] font-sans uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-500">
                      Melhor
                    </span>
                  )}
                  {isSlowest && (
                    <span className="text-[10px] font-sans uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-500">
                      Pior
                    </span>
                  )}
                </span>
                <span
                  className={`text-center ${
                    isFastest
                      ? 'text-emerald-500 font-medium'
                      : isSlowest
                      ? 'text-rose-500 font-medium'
                      : ''
                  }`}
                >
                  {formatTimeString(lap.lapMs)}
                </span>
                <span
                  className={`text-right ${
                    isDark ? 'text-zinc-500' : 'text-stone-400'
                  }`}
                >
                  {formatTimeString(lap.totalMs)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};