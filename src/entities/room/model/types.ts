import type { Minutes } from '@/shared/lib/time';

export interface Room { id: string; name: string; capacity: number; floorNote: string; events: { day: string; start: Minutes; end: Minutes }[]; }
