import { GapData } from '@/models/telemetry/gapData';

export const formatGap = (gap: GapData | null, isPositive: boolean = true): string => {
  const sign = isPositive ? '+' : '-';

  if (gap === null || gap === undefined) return `${sign} --:--`;

  if (gap.laps && gap.laps > 0) {
    return `${sign} ${gap.laps} LAPS`;
  }

  return `${sign} ${formatTime(gap.ms)}`;
};

export const formatTime = (ms: number | null): string => {
  if (ms === null || ms === undefined) return '--:--';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${minutes}:${seconds.toString().padStart(2, '0')}:${centiseconds.toString().padStart(2, '0')}`;
};
