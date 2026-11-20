import { addDaysISO, weekdayIndex, mondayOf } from '@/shared/lib/time';
import { ANCHOR_DATE } from '@/shared/config';

// ── 주(週) 헬퍼 — 순수 함수(HomeCalendar.test.ts가 계약) ──────────────

/** 데모 세계의 오늘 — 라이브 앵커(테스트는 NEXT_PUBLIC_ANCHOR로 고정). */
export const TODAY = ANCHOR_DATE;
/** 홈에서 볼 수 있는 첫 주의 월요일 — 앵커 주(W0). */
export const FIRST_MONDAY = mondayOf(ANCHOR_DATE);
/** 이벤트가 존재하는 주 수(7/6~7/24). */
export const WEEK_COUNT = 3;
/** 그리드 세로 프레임 — 9시~19시. */
export const DAY_START = 540;
export const DAY_END = 1080;

/** 주 인덱스를 0..WEEK_COUNT-1로 클램프한다. */
export function clampWeek(index: number): number {
  return Math.min(Math.max(index, 0), WEEK_COUNT - 1);
}

/** weekIndex(0~2) → 그 주 월~금 ISO 5일. 범위 밖 인덱스는 클램프된다. */
export function weekDays(weekIndex: number): string[] {
  const monday = addDaysISO(FIRST_MONDAY, clampWeek(weekIndex) * 7);
  return [0, 1, 2, 3, 4].map((i) => addDaysISO(monday, i));
}

/** 앵커가 속한 달 — '2026-07' 접두어와 '7월' 라벨의 단일 소스. */
export const ANCHOR_MONTH = TODAY.slice(0, 7);
export const ANCHOR_MONTH_LABEL = `${Number(TODAY.slice(5, 7))}월`;

/** 월간 피커 그리드 — 앵커의 달(일요일 시작), 앞뒤 달 채움 포함. 달 길이에 맞는 정확한 주 수. */
export function buildMonthCells(): { day: string; inMonth: boolean }[] {
  const first = `${ANCHOR_MONTH}-01`;
  const offset = (weekdayIndex(first) + 1) % 7; // 일요일 시작 그리드에서 1일 앞의 채움 칸 수
  const daysInMonth = new Date(Date.UTC(Number(TODAY.slice(0, 4)), Number(TODAY.slice(5, 7)), 0)).getUTCDate();
  const start = addDaysISO(first, -offset);
  return Array.from({ length: Math.ceil((offset + daysInMonth) / 7) * 7 }, (_, i) => {
    const day = addDaysISO(start, i);
    return { day, inMonth: day.startsWith(ANCHOR_MONTH) };
  });
}

/** 해당 날짜가 속한 주 인덱스(0..WEEK_COUNT-1) — 주간 뷰 범위 밖이면 -1. */
export function weekIndexOfDay(day: string): number {
  for (let w = 0; w < WEEK_COUNT; w += 1) {
    if (weekDays(w).includes(day)) return w;
  }
  return -1;
}

/** 분(자정 기준) → 그리드 세로 위치(%) — 9~19시 프레임 기준, 프레임 밖은 클램프. */
export function yPct(minutes: number): number {
  const clamped = Math.min(Math.max(minutes, DAY_START), DAY_END);
  return ((clamped - DAY_START) / (DAY_END - DAY_START)) * 100;
}
