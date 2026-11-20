import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Flag, Sun, Moon, Keyboard, Sparkles } from 'lucide-react';
import { LapItem } from './types';
import { formatTime } from './utils/formatTime';
import { LapList } from './components/LapList';
import { StopwatchDial } from './components/StopwatchDial';
import { CreativeStudioModal } from './components/CreativeStudioModal';

export function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [laps, setLaps] = useState<LapItem[]>([]);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const accumulatedMsRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  const updateTimer = useCallback(() => {
    if (startTimeRef.current !== null) {
      const now = performance.now();
      setElapsedMs(accumulatedMsRef.current + (now - startTimeRef.current));
      rafRef.current = requestAnimationFrame(updateTimer);
    }
  }, []);

  const handleStartPause = useCallback(() => {
    if (isRunning) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      if (startTimeRef.current !== null) {
        accumulatedMsRef.current += performance.now() - startTimeRef.current;
      }
      startTimeRef.current = null;
      setIsRunning(false);
    } else {
      startTimeRef.current = performance.now();
      setIsRunning(true);
      rafRef.current = requestAnimationFrame(updateTimer);
    }
  }, [isRunning, updateTimer]);

  const handleReset = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }
    startTimeRef.current = null;
    accumulatedMsRef.current = 0;
    setIsRunning(false);
    setElapsedMs(0);
    setLaps([]);
  }, []);

  const handleLap = useCallback(() => {
    if (!isRunning && elapsedMs === 0) return;
    const previousTotal = laps.length > 0 ? laps[0].totalMs : 0;
    const lapMs = elapsedMs - previousTotal;
    const newLap: LapItem = {
      id: laps.length + 1,
      lapMs,
      totalMs: elapsedMs,
    };
    setLaps((prev) => [newLap, ...prev]);
  }, [isRunning, elapsedMs, laps]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isStudioOpen) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleStartPause();
      } else if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        handleLap();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleReset();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleStartPause, handleLap, handleReset, isStudioOpen]);

  const formatted = formatTime(elapsedMs);

  return (
    <div
      className={`min-h-screen transition-colors duration-500 flex flex-col justify-between px-4 py-6 sm:px-8 sm:py-8 ${
        isDark
          ? 'bg-zinc-950 text-zinc-100 selection:bg-amber-500/30'
          : 'bg-stone-50 text-stone-900 selection:bg-amber-500/20'
      }`}
    >
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
              isRunning
                ? 'bg-amber-500 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                : isDark
                ? 'bg-zinc-700'
                : 'bg-stone-300'
            }`}
          />
          <h1 className="text-sm font-medium tracking-[0.2em] uppercase opacity-80">
            Chronos
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsStudioOpen(true)}
            aria-label="Abrir Estúdio Criativo"
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isDark
                ? 'bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800'
                : 'bg-white hover:bg-stone-100 text-amber-600 border border-stone-200 shadow-sm'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Estúdio Criativo</span>
          </button>
          <button
            onClick={() => setShowShortcuts((prev) => !prev)}
            aria-label="Atalhos de teclado"
            className={`p-2.5 rounded-full transition-colors cursor-pointer ${
              isDark
                ? 'hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                : 'hover:bg-stone-200/70 text-stone-500 hover:text-stone-800'
            }`}
          >
            <Keyboard className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsDark((prev) => !prev)}
            aria-label="Alternar tema"
            className={`p-2.5 rounded-full transition-colors cursor-pointer ${
              isDark
                ? 'hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                : 'hover:bg-stone-200/70 text-stone-500 hover:text-stone-800'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {showShortcuts && (
        <div className="max-w-md w-full mx-auto mt-4">
          <div
            className={`text-xs rounded-2xl px-4 py-3 flex items-center justify-center gap-6 border ${
              isDark
                ? 'bg-zinc-900/70 border-zinc-800 text-zinc-400'
                : 'bg-white border-stone-200 text-stone-500 shadow-sm'
            }`}
          >
            <span>
              <kbd className="font-mono font-semibold opacity-90">Espaço</kbd> Iniciar/Pausar
            </span>
            <span>
              <kbd className="font-mono font-semibold opacity-90">L</kbd> Volta
            </span>
            <span>
              <kbd className="font-mono font-semibold opacity-90">R</kbd> Zerar
            </span>
          </div>
        </div>
      )}

      <main className="max-w-2xl w-full mx-auto flex-1 flex flex-col items-center justify-center py-8 gap-10">
        <StopwatchDial
          elapsedMs={elapsedMs}
          formatted={formatted}
          isRunning={isRunning}
          isDark={isDark}
        />

        <div className="flex items-center justify-center gap-5 sm:gap-7">
          <button
            onClick={handleReset}
            disabled={elapsedMs === 0 && !isRunning}
            aria-label="Zerar cronômetro"
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
              isDark
                ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-sm'
            }`}
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleStartPause}
            aria-label={isRunning ? 'Pausar' : 'Iniciar'}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg active:scale-95 ${
              isRunning
                ? isDark
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/30'
                  : 'bg-stone-900 hover:bg-stone-800 text-amber-400'
                : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/25'
            }`}
          >
            {isRunning ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          <button
            onClick={handleLap}
            disabled={!isRunning && elapsedMs === 0}
            aria-label="Marcar volta"
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
              isDark
                ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 shadow-sm'
            }`}
          >
            <Flag className="w-5 h-5" />
          </button>
        </div>

        <LapList laps={laps} isDark={isDark} />
      </main>

      <footer className="max-w-2xl w-full mx-auto text-center">
        <p
          className={`text-xs tracking-wide ${
            isDark ? 'text-zinc-600' : 'text-stone-400'
          }`}
        >
          Precisão de milissegundos • Pressione Espaço para iniciar
        </p>
      </footer>

      <CreativeStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        isDark={isDark}
        formattedTime={formatted}
      />
    </div>
  );
}

export default App;