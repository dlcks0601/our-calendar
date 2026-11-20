import type { CalendarEvent, EventKind } from './types';

/** 하루치 이벤트 — day 일치만 골라 시작 시각 순으로 정렬한다. */
export function eventsOn(events: readonly CalendarEvent[], day: string): CalendarEvent[] {
  return events.filter((e) => e.day === day).sort((a, b) => a.start - b.start);
}

// ── 이벤트 종류별 틴트 — 잉크의 농도로 종류를 구분한다 ──────────
// (ProfilePeek 미니 캘린더가 같은 팔레트를 공유한다 — 단일 소스)

export interface KindStyle {
  bg: string;
  border: string;
  title: string;
  sub: string;
  /** 목록에서 종류를 알리는 세로 바 색 */
  bar: string;
}

export const KIND_STYLE: Record<EventKind, KindStyle> = {
  // 회의가 가장 진하다 — 여러 사람의 시간이 걸린 일정이라 캘린더에서 먼저 읽혀야 한다.
  meeting: { bg: '#000000', border: '#000000', title: '#FFFFFF', sub: '#A6A6A6', bar: '#000000' },
  offsite: { bg: '#8E8E8E', border: '#8E8E8E', title: '#FFFFFF', sub: '#E6E6E6', bar: '#6B6B6B' },
  personal: { bg: '#CDCDCD', border: '#C2C2C2', title: '#000000', sub: '#4A4A4A', bar: '#9E9E9E' },
  focus: { bg: '#E2E2E2', border: '#D6D6D6', title: '#000000', sub: '#5C5C5C', bar: '#BDBDBD' },
  // 점심은 가장 옅다 — 조율에서 피해 가는 시간이지 막는 시간이 아니다.
  lunch: { bg: '#EFEFEF', border: '#E6E6E6', title: '#6B6B6B', sub: '#9A9A9A', bar: '#D9D9D9' },
};

/** 이벤트별 표시 스타일 — 농도가 곧 종류다. 셋업의 종류 칩과 같은 어휘(KIND_STYLE 단일 소스). */
export function styleFor(ev: CalendarEvent): KindStyle {
  return KIND_STYLE[ev.kind];
}
