import type { Room } from '../model/types';
import { W1_MON, W1_TUE, W1_WED, W1_THU, W1_FRI } from '@/shared/config';

// ── 회의실 4개 ─────────────────────────────────────────────
// 정원 4/8/10/2. 일부 점유 일정으로 슬롯마다 가용성이 달라진다.
// (Wed 7/15 10:00~11:00 은 큰 방(미팅룸2·5)을 비워 별 슬롯이 no-room 을 받지 않게 한다.)
export const ROOMS: Room[] = [
  {
    id: 'room-1', name: '미팅룸 1', capacity: 4, floorNote: '3층',
    events: [
      { day: W1_MON, start: 600, end: 720 }, { day: W1_WED, start: 780, end: 900 },
      { day: W1_THU, start: 660, end: 780 }, { day: W1_FRI, start: 600, end: 720 },
    ],
  },
  {
    id: 'room-2', name: '미팅룸 2', capacity: 8, floorNote: '3층',
    events: [
      { day: W1_MON, start: 810, end: 960 }, { day: W1_TUE, start: 600, end: 720 },
      { day: W1_THU, start: 780, end: 900 }, { day: W1_FRI, start: 900, end: 1020 },
    ],
  },
  {
    id: 'room-5', name: '미팅룸 5', capacity: 10, floorNote: '4층',
    events: [
      { day: W1_MON, start: 900, end: 1080 }, { day: W1_TUE, start: 660, end: 840 },
      { day: W1_WED, start: 780, end: 900 }, { day: W1_THU, start: 900, end: 1050 },
    ],
  },
  {
    id: 'room-focus', name: '포커스룸', capacity: 2, floorNote: '3층',
    events: [
      { day: W1_WED, start: 600, end: 720 }, { day: W1_THU, start: 660, end: 780 },
    ],
  },
];
