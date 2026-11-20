import { KIND_COLOR } from '@/shared/tokens';
import type { CalendarEvent, EventKind } from './types';

/** 하루치 이벤트 — day 일치만 골라 시작 시각 순으로 정렬한다. */
export function eventsOn(events: readonly CalendarEvent[], day: string): CalendarEvent[] {
  return events.filter((e) => e.day === day).sort((a, b) => a.start - b.start);
}

// ── 이벤트 종류별 색 — 색이 곧 종류다. 값은 토큰 명세(shared/tokens)에 있다 ──
// (ProfilePeek 미니 캘린더가 같은 팔레트를 공유한다 — 단일 소스)

export interface KindStyle {
  bg: string;
  border: string;
  title: string;
  sub: string;
  /** 목록에서 종류를 알리는 세로 바 색 */
  bar: string;
}

const kindStyle = (kind: EventKind): KindStyle => {
  const color = KIND_COLOR[kind];
  return { bg: color.bg, border: color.border, title: color.fg, sub: color.fgMuted, bar: color.bar };
};

/** 옅은 바탕에 같은 계열의 짙은 글자. 제목은 바탕 대비 4.5:1, 시간은 3:1 이상(토큰의 대비 검사가 지킨다). */
export const KIND_STYLE: Record<EventKind, KindStyle> = {
  meeting: kindStyle('meeting'),
  focus: kindStyle('focus'),
  lunch: kindStyle('lunch'),
  personal: kindStyle('personal'),
  offsite: kindStyle('offsite'),
};

/** 이벤트별 표시 스타일 — 색이 곧 종류다. 셋업의 종류 칩과 같은 어휘(KIND_STYLE 단일 소스). */
export function styleFor(ev: CalendarEvent): KindStyle {
  return KIND_STYLE[ev.kind];
}
