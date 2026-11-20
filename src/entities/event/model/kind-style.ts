import type { CalendarEvent, EventKind } from './types';

/** 하루치 이벤트 — day 일치만 골라 시작 시각 순으로 정렬한다. */
export function eventsOn(events: readonly CalendarEvent[], day: string): CalendarEvent[] {
  return events.filter((e) => e.day === day).sort((a, b) => a.start - b.start);
}

// ── 이벤트 종류별 틴트 — 색이 곧 종류다. 파란 계열은 쓰지 않는다 ──────────
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
  meeting: { bg: '#F1EAFE', border: '#E0D2FB', title: '#5B25C9', sub: '#8558DB', bar: '#7A3FE0' }, // 보라
  focus: { bg: '#E2F5EA', border: '#C4E8D3', title: '#0F7A43', sub: '#3D9A6B', bar: '#2FA868' }, // 초록
  lunch: { bg: '#FFF2DC', border: '#F6E2BC', title: '#9A5B00', sub: '#B5802A', bar: '#F0A020' }, // 호박
  personal: { bg: '#F1F6D9', border: '#E0E9B5', title: '#56700A', sub: '#7C9231', bar: '#8FA61E' }, // 올리브
  offsite: { bg: '#FDECEF', border: '#F5D3DA', title: '#C12F53', sub: '#D4607C', bar: '#E0456B' }, // 로즈
};

/** 이벤트별 표시 스타일 — 색이 곧 종류다. 셋업의 종류 칩과 같은 어휘(KIND_STYLE 단일 소스). */
export function styleFor(ev: CalendarEvent): KindStyle {
  return KIND_STYLE[ev.kind];
}
