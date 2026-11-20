import type { Minutes } from '@/shared/lib/time';
import type { CalendarEvent } from '@/entities/event/@x/member';

export type AttendanceType = 'required' | 'optional';
export interface Person {
  id: string; name: string; role: string; faceId: string;
  workHours: { start: Minutes; end: Minutes };
  events: CalendarEvent[];                    // 데모 전 기간(7/1~7/24)
}
export interface Attendee extends Person { attendanceType: AttendanceType; isOrganizer?: boolean; }
