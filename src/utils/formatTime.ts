import { FormattedTime } from '../types';

export function formatTime(ms: number): FormattedTime {
  const totalCentiseconds = Math.floor(ms / 10);
  const centiseconds = totalCentiseconds % 100;
  const totalSeconds = Math.floor(totalCentiseconds / 100);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  return {
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
    centiseconds: pad(centiseconds),
  };
}

export function formatTimeString(ms: number): string {
  const { hours, minutes, seconds, centiseconds } = formatTime(ms);
  if (hours !== '00') {
    return `${hours}:${minutes}:${seconds}.${centiseconds}`;
  }
  return `${minutes}:${seconds}.${centiseconds}`;
}
