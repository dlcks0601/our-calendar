import type { Minutes } from '@/shared/lib/time';

export type ReasonCode =
  | 'all-required-ok' | 'optional-ok' | 'optional-partial' | 'optional-unavailable'
  | 'after-lunch' | 'lunch-squeeze' | 'offsite-day' | 'back-to-back'
  | 'focus-overlap' | 'late-start' | 'no-room' | 'before-lunch-bonus';
export interface ScoreEffect { code: ReasonCode; delta: number; who?: string; data?: Record<string, string | number>; }
export type ReasonTone = 'positive' | 'tradeoff' | 'warning';
export interface SlotReason { code: ReasonCode; tone: ReasonTone; text: string; who?: string; }
export interface PartialInfo { attendeeId: string; part: 'front' | 'back'; minutes: Minutes; conflictTitle: string; }
export interface CandidateSlot {
  id: string; day: string; start: Minutes; end: Minutes;
  score: number; reasons: SlotReason[]; partials: PartialInfo[];
  severity: 'good' | 'tradeoff' | 'warning'; roomIds: string[];
}
