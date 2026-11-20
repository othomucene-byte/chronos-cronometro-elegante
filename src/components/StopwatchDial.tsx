import React from 'react';
import { FormattedTime } from '../types';

interface StopwatchDialProps {
  elapsedMs: number;
  formatted: FormattedTime;
  isRunning: boolean;
  isDark: boolean;
}

export const StopwatchDial: React.FC<StopwatchDialProps> = ({
  elapsedMs,
  formatted,
  isRunning,
  isDark,
}) => {
  const secondsProgress = ((elapsedMs % 60000) / 60000) * 100;
  const radius = 136;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (secondsProgress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-72 h-72 sm:w-80 sm:h-80">
      <svg
        className="w-full h-full -rotate-90 transform"
        viewBox="0 0 300 300"
      >
        <circle
          cx="150"
          cy="150"
          r={radius}
          fill="none"
          stroke={isDark ? '#18181b' : '#e7e5e4'}
          strokeWidth="3"
        />
        <circle
          cx="150"
          cy="150"
          r={radius}
          fill="none"
          stroke={isRunning ? '#f59e0b' : isDark ? '#52525b' : '#a8a29e'}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-[stroke] duration-300"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
        {formatted.hours !== '00' && (
          <span
            className={`font-mono-tabular text-sm tracking-widest mb-1 ${
              isDark ? 'text-zinc-400' : 'text-stone-500'
            }`}
          >
            {formatted.hours}h
          </span>
        )}

        <div className="font-mono-tabular flex items-baseline tracking-tight">
          <span className="text-5xl sm:text-6xl font-light">
            {formatted.minutes}:{formatted.seconds}
          </span>
          <span
            className={`text-2xl sm:text-3xl font-light ml-1 ${
              isRunning
                ? 'text-amber-500'
                : isDark
                ? 'text-zinc-500'
                : 'text-stone-400'
            }`}
          >
            .{formatted.centiseconds}
          </span>
        </div>
      </div>
    </div>
  );
};