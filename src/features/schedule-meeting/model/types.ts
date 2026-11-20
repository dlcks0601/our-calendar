import type { Minutes } from '@/shared/lib/time';

export type DeadlineKind = 'this-week' | 'next-week' | 'flexible';
export interface Rules { days: string[]; durationMinutes: number; deadline: DeadlineKind; }
export interface LunchRhythm { start: Minutes; end: Minutes }
export interface PersonInsights {
  offsiteWeekdays: number[];                                  // 빈도 ≥2 요일
  recurring: { weekday: number; start: Minutes; title: string }[]; // 주 2회 이상 반복
  lunchRhythm: LunchRhythm | null;
  headline: string | null;                                    // 피크 각주 문장
  scanLine: string;                                           // 스캔 모먼트 문장
}
