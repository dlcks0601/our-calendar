import type { CalendarEvent, EventKind } from './types';

/** 하루치 이벤트 — day 일치만 골라 시작 시각 순으로 정렬한다. */
export function eventsOn(events: readonly CalendarEvent[], day: string): CalendarEvent[] {
  return events.filter((e) => e.day === day).sort((a, b) => a.start - b.start);
}

// ── 이벤트 종류별 틴트 — 색이 곧 종류다. 검정·흰색과 어울리게 채도를 낮췄고 파란 계열은 쓰지 않는다 ──
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
  meeting: { bg: '#ECE8F0', border: '#DCD5E3', title: '#54456A', sub: '#7C6E90', bar: '#6F5C8A' }, // 플럼
  focus: { bg: '#E7EEE6', border: '#D3DED1', title: '#3F5A42', sub: '#69826B', bar: '#5E7D61' }, // 세이지
  lunch: { bg: '#F3EEE2', border: '#E5DCC8', title: '#6F5A2E', sub: '#93805A', bar: '#A58A4C' }, // 샌드
  personal: { bg: '#ECECEA', border: '#DCDCD8', title: '#4A4A46', sub: '#777772', bar: '#8A8A84' }, // 스톤
  offsite: { bg: '#F3E8E4', border: '#E6D3CC', title: '#7A4636', sub: '#A0705F', bar: '#A8604B' }, // 클레이
};

/** 이벤트별 표시 스타일 — 색이 곧 종류다. 셋업의 종류 칩과 같은 어휘(KIND_STYLE 단일 소스). */
export function styleFor(ev: CalendarEvent): KindStyle {
  return KIND_STYLE[ev.kind];
}
