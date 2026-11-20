import type { Minutes } from '@/shared/lib/time';

export type EventKind = 'meeting' | 'focus' | 'offsite' | 'lunch' | 'personal';
export interface CalendarEvent { id: string; day: string; start: Minutes; end: Minutes; title: string; kind: EventKind; room?: string; }
