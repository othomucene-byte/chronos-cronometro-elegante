export interface LapItem {
  id: number;
  lapMs: number;
  totalMs: number;
}

export interface FormattedTime {
  hours: string;
  minutes: string;
  seconds: string;
  centiseconds: string;
}
