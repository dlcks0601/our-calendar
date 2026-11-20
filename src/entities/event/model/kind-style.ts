import type { CalendarEvent, EventKind } from './types';

/** 하루치 이벤트 — day 일치만 골라 시작 시각 순으로 정렬한다. */
export function eventsOn(events: readonly CalendarEvent[], day: string): CalendarEvent[] {
  return events.filter((e) => e.day === day).sort((a, b) => a.start - b.start);
}

// ── 이벤트 종류별 틴트 — 색이 곧 종류다. 옅은 바탕에 분명한 색. 하늘색은 밝고 맑은 톤만 쓴다 ──
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
  // 옅은 바탕 + 같은 계열의 짙은 글자. 제목은 바탕 대비 4.5:1 이상을 지킨다.
  meeting: { bg: '#DDF0FB', border: '#C2E0F6', title: '#136A99', sub: '#4A93BD', bar: '#3AA3DA' }, // 하늘
  focus: { bg: '#DFF3E6', border: '#C3E6CF', title: '#1F7A4B', sub: '#4E9D73', bar: '#3DAE74' }, // 초록
  lunch: { bg: '#FCF1D6', border: '#F3E0B0', title: '#8A6410', sub: '#B08A3A', bar: '#E0A82E' }, // 노랑
  personal: { bg: '#EEEDEA', border: '#DEDCD6', title: '#4A4944', sub: '#7A7870', bar: '#8F8C82' }, // 스톤
  offsite: { bg: '#FCE7E0', border: '#F4CFC3', title: '#A2452B', sub: '#C6765F', bar: '#E0704F' }, // 코랄
};

/** 이벤트별 표시 스타일 — 색이 곧 종류다. 셋업의 종류 칩과 같은 어휘(KIND_STYLE 단일 소스). */
export function styleFor(ev: CalendarEvent): KindStyle {
  return KIND_STYLE[ev.kind];
}
