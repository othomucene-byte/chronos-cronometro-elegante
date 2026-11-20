import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Upload,
  Download,
  RotateCw,
  FlipHorizontal,
  Sliders,
  Type,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { FormattedTime } from '../types';

interface CreativeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  formattedTime: FormattedTime;
}

interface StudioFilters {
  brightness: number;
  contrast: number;
  saturate: number;
  blur: number;
  sepia: number;
  grayscale: number;
}

const DEFAULT_FILTERS: StudioFilters = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  blur: 0,
  sepia: 0,
  grayscale: 0,
};

export const CreativeStudioModal: React.FC<CreativeStudioModalProps> = ({
  isOpen,
  onClose,
  isDark,
  formattedTime,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [filters, setFilters] = useState<StudioFilters>(DEFAULT_FILTERS);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [overlayText, setOverlayText] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  const timeString = `${formattedTime.minutes}:${formattedTime.seconds}.${formattedTime.centiseconds}`;

  const generateChronosCard = useCallback(() => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 960;
    tempCanvas.height = 600;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    const grad = ctx.createLinearGradient(0, 0, 960, 600);
    grad.addColorStop(0, '#09090b');
    grad.addColorStop(1, '#18181b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 960, 600);

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(480, 300, 190, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.font = '600 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CHRONOS', 480, 210);

    ctx.fillStyle = '#fafafa';
    ctx.font = '300 76px JetBrains Mono, monospace';
    ctx.fillText(timeString, 480, 325);

    ctx.fillStyle = '#71717a';
    ctx.font = '400 16px Inter, sans-serif';
    ctx.fillText('REGISTRO DE TEMPO', 480, 385);

    setImageSrc(tempCanvas.toDataURL('image/png'));
  }, [timeString]);

  useEffect(() => {
    if (isOpen && !imageSrc) {
      generateChronosCard();
    }
  }, [isOpen, imageSrc, generateChronosCard]);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = loadedImageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isRotated = rotation % 180 !== 0;
    const targetW = isRotated ? img.height : img.width;
    const targetH = isRotated ? img.width : img.height;

    canvas.width = targetW;
    canvas.height = targetH;

    ctx.clearRect(0, 0, targetW, targetH);
    ctx.save();

    ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) blur(${filters.blur}px) sepia(${filters.sepia}%) grayscale(${filters.grayscale}%)`;

    ctx.translate(targetW / 2, targetH / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, 1);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    if (showOverlay && overlayText.trim()) {
      ctx.save();
      const fontSize = Math.max(24, Math.round(targetW * 0.05));
      ctx.font = `600 ${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      const textWidth = ctx.measureText(overlayText).width;
      const padX = 28;
      const padY = 14;
      const boxW = textWidth + padX * 2;
      const boxH = fontSize + padY * 2;
      const boxX = (targetW - boxW) / 2;
      const boxY = targetH - boxH - 36;

      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 16);
      ctx.fill();

      ctx.fillStyle = '#fafafa';
      ctx.fillText(overlayText, targetW / 2, boxY + fontSize + padY * 0.6);
      ctx.restore();
    }
  }, [filters, rotation, flipH, showOverlay, overlayText]);

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.onload = () => {
      loadedImageRef.current = img;
      renderCanvas();
    };
    img.src = imageSrc;
  }, [imageSrc, renderCanvas]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageSrc(reader.result);
        setFilters(DEFAULT_FILTERS);
        setRotation(0);
        setFlipH(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetAll = () => {
    setFilters(DEFAULT_FILTERS);
    setRotation(0);
    setFlipH(false);
    setOverlayText('');
    setShowOverlay(false);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `chronos-studio-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm">
      <div
        className={`w-full max-w-5xl max-h-[92vh] rounded-3xl border overflow-hidden flex flex-col shadow-2xl ${
          isDark
            ? 'bg-zinc-950 border-zinc-800 text-zinc-100'
            : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isDark ? 'border-zinc-800' : 'border-stone-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-semibold tracking-tight">
              Estúdio Criativo
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark
                  ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Carregar Imagem
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar PNG
            </button>
            <button
              onClick={onClose}
              aria-label="Fechar Estúdio Criativo"
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isDark
                  ? 'hover:bg-zinc-900 text-zinc-400'
                  : 'hover:bg-stone-100 text-stone-500'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3">
          <div
            className={`lg:col-span-2 flex items-center justify-center p-4 sm:p-6 min-h-[280px] ${
              isDark ? 'bg-zinc-900/50' : 'bg-stone-100/70'
            }`}
          >
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[55vh] rounded-2xl shadow-lg object-contain"
            />
          </div>

          <div
            className={`p-5 space-y-5 border-t lg:border-t-0 lg:border-l overflow-y-auto ${
              isDark ? 'border-zinc-800' : 'border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 opacity-70">
                <Sliders className="w-3.5 h-3.5" />
                Ajustes
              </span>
              <button
                onClick={handleResetAll}
                className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                Resetar
              </button>
            </div>

            <div className="space-y-3">
              {[
                { key: 'brightness', label: 'Brilho', min: 30, max: 200, unit: '%' },
                { key: 'contrast', label: 'Contraste', min: 30, max: 200, unit: '%' },
                { key: 'saturate', label: 'Saturação', min: 0, max: 200, unit: '%' },
                { key: 'blur', label: 'Desfoque', min: 0, max: 12, unit: 'px' },
                { key: 'sepia', label: 'Sépia', min: 0, max: 100, unit: '%' },
                { key: 'grayscale', label: 'Preto e Branco', min: 0, max: 100, unit: '%' },
              ].map((item) => {
                const val = filters[item.key as keyof StudioFilters];
                return (
                  <div key={item.key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="opacity-80">{item.label}</span>
                      <span className="font-mono-tabular opacity-60">
                        {val}
                        {item.unit}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={item.min}
                      max={item.max}
                      value={val}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          [item.key]: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-zinc-800/40 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-70 block">
                Transformar
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800'
                      : 'bg-stone-100 hover:bg-stone-200'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Girar 90°
                </button>
                <button
                  onClick={() => setFlipH((f) => !f)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800'
                      : 'bg-stone-100 hover:bg-stone-200'
                  }`}
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  Espelhar
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 opacity-70">
                  <Type className="w-3.5 h-3.5" />
                  Texto na Imagem
                </span>
                <button
                  onClick={() => {
                    setShowOverlay((s) => !s);
                    if (!overlayText) setOverlayText(timeString);
                  }}
                  className="text-xs text-amber-500 hover:text-amber-400 cursor-pointer"
                >
                  {showOverlay ? 'Ocultar' : 'Ativar'}
                </button>
              </div>
              {showOverlay && (
                <input
                  type="text"
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value)}
                  placeholder="Digite uma legenda ou tempo..."
                  className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                    isDark
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-amber-500'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:border-amber-500'
                  }`}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};