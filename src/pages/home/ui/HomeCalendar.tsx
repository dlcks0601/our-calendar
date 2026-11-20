'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, type Person } from '@/entities/member';
import { type CalendarEvent, eventsOn, styleFor } from '@/entities/event';
import { fmtRange } from '@/shared/lib/time';
import { TODAY, WEEK_COUNT, DAY_START, DAY_END, clampWeek, weekDays, ANCHOR_MONTH_LABEL, buildMonthCells, weekIndexOfDay, yPct } from '@/shared/lib/calendar-grid';
import { SPRING } from '@/shared/tokens';
import { IconButton } from '@/shared/ui/icon-button';

/**
 * 홈 캘린더 — 내(이찬) 주간 일정 + 캘린더 안에 살고 있는 받은 초대(고스트 이벤트).
 *
 * 데스크톱(lg+): 월~금 5열 × 9~19시 주간 그리드. 모바일: 요일 칩 + 하루 목록.
 * 주 이동은 앵커 주(W0)~W2(3주, 데이터가 있는 범위)에서 클램프. 드래그 없음 — 보기 전용.
 * 오늘(라이브 앵커)은 요일 라벨 밑 검은 점으로만 은은하게 표시한다.
 *
 * responseBadges: 확정 회의 블록에 얹는 응답 아바타 미니 스택 — 응답 토스트가
 * 도착할 때마다(page.tsx가 people을 늘려 내려준다) 한 명씩 팝으로 채워진다.
 */

// 응답대기(받은 초대) 고스트 — 평소엔 점선 유령, 호버하면 솔리드 블랙로 차오르며 떠오른다.
// 그림자는 애니메이션 금지 원칙(성능)에 따라 after: 오버레이의 opacity로만 켠다.
const GHOST_CARD =
  // isolate: after:-z-10 글로우가 조상 배경 뒤로 꺼지지 않게 버튼 자신을 스태킹 컨텍스트로.
  // 주의: 여기에 relative를 넣으면 데스크톱 고스트의 absolute와 충돌해 카드가 흐름 배치로
  // 떨어진다(폭 쪼그라듦) — position은 사용처가 각자 정한다(데스크톱 absolute/모바일 relative).
  'group isolate border-2 border-dashed border-sky-200 bg-transparent ' +
  'transition-[background-color,border-color] duration-200 hover:z-10 hover:border-transparent hover:bg-ink ' +
  'after:pointer-events-none after:absolute after:-inset-px after:-z-10 after:rounded-[inherit] ' +
  'after:shadow-s3 after:opacity-0 after:transition-opacity after:duration-200 hover:after:opacity-100';
const GHOST_TITLE_CLS = 'text-sky-800 transition-colors duration-200 group-hover:text-on-ink';
const GHOST_SUB_CLS = 'text-sky-600 transition-colors duration-200 group-hover:text-on-ink/80';

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금'] as const;

// ── 응답 배지 — 확정 회의 블록의 아바타 미니 스택 ─────────────────────

export interface ResponseBadges {
  /** 배지를 얹을 이벤트 id(방금 확정한 회의) */
  eventId: string;
  /** 응답한 사람들 — 도착 순서대로 채워진다 */
  people: Person[];
}

const BADGE_POP = SPRING.pop;

/** 아바타 미니 스택 — 새 응답이 오면 한 명씩 제자리 팝으로 나타난다. */
function BadgeStack({ people }: { people: Person[] }) {
  const reduced = !!useReducedMotion();
  return (
    <span className="flex -space-x-1.5">
      {people.map((p) => (
        <motion.span
          key={p.id}
          initial={reduced ? { opacity: 0 } : { scale: 0 }}
          animate={reduced ? { opacity: 1 } : { scale: 1 }}
          transition={reduced ? { duration: 0.1 } : BADGE_POP}
          className="rounded-full ring-2 ring-gray-0"
        >
          <Avatar person={p} size={24} />
        </motion.span>
      ))}
    </span>
  );
}

function dayNumber(iso: string): number {
  return Number(iso.slice(8, 10));
}

function hourLabel(h: number): string {
  // 오전/오후 없이 시각만 — 9시~12시, 1시~6시(오후는 12시간 표기).
  return `${h <= 12 ? h : h - 12}시`;
}

// ── 모바일 하루 목록 — 일반 이벤트와 고스트 초대를 시각 순으로 섞는다 ──

function MobileDayList({
  events,
  ghost,
  onOpenInvite,
  responseBadges,
}: {
  events: CalendarEvent[];
  ghost: HomeCalendarInvite | null;
  onOpenInvite?: () => void;
  responseBadges?: ResponseBadges | null;
}) {
  if (events.length === 0 && !ghost) {
    return <p className="py-10 text-center text-body-s text-faint">이 날은 일정이 없어요</p>;
  }
  const badgesFor = (ev: CalendarEvent) =>
    responseBadges && responseBadges.eventId === ev.id ? responseBadges.people : null;
  // 고스트를 시작 시각 자리에 끼워 넣는다(안정 정렬 유지).
  const ghostIndex = ghost ? events.filter((e) => e.start <= ghost.start).length : -1;
  return (
    <div className="mt-2 space-y-2.5">
      {events.slice(0, ghostIndex === -1 ? events.length : ghostIndex).map((ev) => (
        <MobileEventRow key={ev.id} ev={ev} badges={badgesFor(ev)} />
      ))}
      {ghost && (
        <button
          type="button"
          onClick={onOpenInvite}
          className={`pressable relative w-full rounded-r5 px-4 py-3.5 text-left ${GHOST_CARD}`}
          style={{ minHeight: mobileRowHeight({ start: ghost.start, end: ghost.end } as CalendarEvent) }}
        >
          <p className={`truncate text-body font-semibold ${GHOST_TITLE_CLS}`}>{ghost.title}</p>
          <p className={`mt-0.5 text-label ${GHOST_SUB_CLS}`}>{fmtRange(ghost.start, ghost.end)} · 응답 대기</p>
          {ghost.room && <p className={`mt-px text-label ${GHOST_SUB_CLS}`}>{ghost.room}</p>}
        </button>
      )}
      {ghostIndex !== -1 &&
        events.slice(ghostIndex).map((ev) => <MobileEventRow key={ev.id} ev={ev} badges={badgesFor(ev)} />)}
    </div>
  );
}

/** 모바일 카드 높이 — 길이가 곧 높이(캘린더의 기본). 30분=72px 기준, 30분당 +20px, 240px 캡. */
function mobileRowHeight(ev: CalendarEvent): number {
  const dur = ev.end - ev.start;
  return Math.min(240, 72 + Math.max(0, ((dur - 30) / 30) * 20));
}

function MobileEventRow({ ev, badges }: { ev: CalendarEvent; badges?: Person[] | null }) {
  const st = styleFor(ev);
  return (
    <div
      className="flex items-start gap-3 rounded-r5 px-4 py-3.5"
      style={{ backgroundColor: st.bg, minHeight: mobileRowHeight(ev) }}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-semibold" style={{ color: st.title }}>
          {ev.title}
        </p>
        <p className="mt-0.5 text-label" style={{ color: st.sub }}>
          {fmtRange(ev.start, ev.end)}
        </p>
        {ev.room && (
          <p className="mt-px text-label" style={{ color: st.sub }}>
            {ev.room}
          </p>
        )}
      </div>
      {badges && badges.length > 0 && <BadgeStack people={badges} />}
    </div>
  );
}

// ── 본체 ─────────────────────────────────────────────────────────────

export interface HomeCalendarInvite {
  title: string;
  day: string;
  /** 반복 초대 시리즈의 날들 — 없으면 day 단일. 매주 고스트가 살게 한다. */
  days?: string[];
  start: number;
  end: number;
  /** 주최자가 정한 회의실 — 초대에도 당연히 보인다. */
  room?: string;
}

export interface HomeCalendarProps {
  /** 내(이찬) 일정 — 전 기간을 넘겨도 주 필터는 여기서 한다. */
  events: CalendarEvent[];
  /** 받은 초대 — 캘린더 안에 고스트(점선) 이벤트로 산다. */
  invite?: HomeCalendarInvite | null;
  onOpenInvite?: () => void;
  /** 확정 회의 블록의 응답 아바타 스택 — 응답 토스트 도착에 맞춰 채워진다. */
  responseBadges?: ResponseBadges | null;
}

export default function HomeCalendar({ events, invite, onOpenInvite, responseBadges }: HomeCalendarProps) {
  const reduced = !!useReducedMotion();
  const [week, setWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState(TODAY);
  const [monthOpen, setMonthOpen] = useState(false);
  // 주 넘김 방향(±1) — 전환 페이드가 이 방향으로 살짝 흐른다(다음 주 = 오른쪽에서 들어옴).
  const [dir, setDir] = useState(1);
  const days = weekDays(week);
  const hours = Array.from({ length: (DAY_END - DAY_START) / 60 + 1 }, (_, i) => DAY_START / 60 + i);

  const goWeek = (delta: number) => {
    const next = clampWeek(week + delta);
    if (next === week) return;
    setDir(delta > 0 ? 1 : -1);
    setWeek(next);
    // 주를 옮기면 모바일 선택일도 따라간다 — 현재 주로 돌아오면 오늘로.
    setSelectedDay(next === 0 ? TODAY : weekDays(next)[0]);
  };

  // 주 전환 페이드 — 페이지가 바뀌듯 이전 주가 사라지고 새 주가 들어온다(방향 인지, 모션은 설명).
  const weekFade = {
    initial: reduced ? { opacity: 1 } : { opacity: 0, x: 20 * dir },
    animate: { opacity: 1, x: 0 },
    exit: reduced ? { opacity: 1 } : { opacity: 0, x: -14 * dir },
    transition: reduced ? { duration: 0 } : { duration: 0.18, ease: [0.4, 0, 0.2, 1] as const },
  };

  const [, month] = days[0].split('-');

  const ghostOn = (day: string) => (invite && (invite.days ?? [invite.day]).includes(day) ? invite : null);

  // ── 월간 피커 — '7월' 탭으로 열리고, 일정 있는 날엔 점, 날짜 탭 = 그 주로 점프 ──
  // 점심은 매일 있어 점의 의미가 사라지므로 제외 — 점 = 진짜 일정(회의·개인·외근 등).
  const dottedDays = new Set(events.filter((e) => e.kind !== 'lunch').map((e) => e.day));
  if (invite) for (const d of invite.days ?? [invite.day]) dottedDays.add(d);

  const goToDay = (day: string) => {
    const w = weekIndexOfDay(day);
    if (w === -1) return;
    if (w !== week) {
      setDir(w > week ? 1 : -1);
      setWeek(w);
    }
    setSelectedDay(day);
    setMonthOpen(false);
  };

  return (
    <section aria-label="내 캘린더">
      {/* ── 헤더: 월 + 범위 + 주 이동 + (데스크톱) CTA ── */}
      <div className="flex items-center justify-between">
        <div className="relative flex items-center gap-0.5">
          <IconButton size="sm" tone="default"
            onClick={() => goWeek(-1)}
            disabled={week === 0}
            aria-label="이전 주"
            className="disabled:pointer-events-none"
          >
            <ChevronLeft size={17} aria-hidden />
          </IconButton>
          {/* 월 + 주 범위 — 베이스라인 정렬(작은 글자가 큰 글자의 밑줄에 앉는다) */}
          <div className="flex items-baseline">
            <button
              type="button"
              onClick={() => setMonthOpen(!monthOpen)}
              aria-expanded={monthOpen}
              aria-label="월간 달력 열기"
              className="pressable rounded-r2 px-1.5 text-title-l font-bold tracking-tight text-strong hover:bg-subtle lg:text-heading"
            >
              {Number(month)}월
            </button>
            <span className="mx-1 text-body-s font-medium text-muted lg:text-body">
              {Number(days[0].slice(8, 10))}일 – {Number(days[days.length - 1].slice(8, 10))}일
            </span>
          </div>
          <IconButton size="sm" tone="default"
            onClick={() => goWeek(1)}
            disabled={week === WEEK_COUNT - 1}
            aria-label="다음 주"
            className="disabled:pointer-events-none"
          >
            <ChevronRight size={17} aria-hidden />
          </IconButton>

          {/* 월간 피커 팝오버 — 일~토 그리드, 오늘=검은 칩, 일정 있는 날=점 */}
          <AnimatePresence>
            {monthOpen && (
              <>
                <div className="fixed inset-0 z-[60]" aria-hidden onClick={() => setMonthOpen(false)} />
                <motion.div
                  key="month-picker"
                  role="dialog"
                  aria-label={`${Number(TODAY.slice(0, 4))}년 ${ANCHOR_MONTH_LABEL}`}
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
                  animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
                  transition={reduced ? { duration: 0.12 } : SPRING.position}
                  style={{ transformOrigin: 'top left' }}
                  className="absolute left-0 top-full z-[65] mt-2 w-[340px] rounded-r6 bg-page p-5 shadow-s4 ring-1 ring-default/60"
                >
                  <div className="grid grid-cols-7 pb-2">
                    {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
                      <span key={d} className="py-1 text-center text-body-s text-faint">
                        {d}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-y-3">
                    {buildMonthCells().map(({ day, inMonth }) => {
                      const navigable = inMonth && weekIndexOfDay(day) !== -1;
                      const today = day === TODAY;
                      const dotted = inMonth && dottedDays.has(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          disabled={!navigable}
                          onClick={() => goToDay(day)}
                          className={`pressable relative mx-auto flex h-10 w-10 items-center justify-center rounded-r4 text-title-s font-semibold ${
                            today
                              ? 'bg-ink text-on-ink'
                              : navigable
                                ? 'text-strong hover:bg-subtle'
                                : inMonth
                                  ? 'text-faint'
                                  : 'text-disabled'
                          } disabled:pointer-events-none`}
                        >
                          {dayNumber(day)}
                          {dotted && !today && (
                            <span aria-hidden className="absolute bottom-[3px] h-1 w-1 rounded-full bg-ink/60" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        {/* 일정 만들기 CTA는 페이지가 소유 — 모바일·데스크톱 모두 하단 고정. */}
      </div>

      {/* ── 데스크톱: 5열 주간 그리드 — bg 없음: 흰 페이지 배경이 헤더~그리드로 이어진다 ── */}
      <div className="mt-3 hidden overflow-hidden rounded-r6 px-2 lg:block">
        <AnimatePresence mode="wait" initial={false}>
        <motion.div key={week} {...weekFade}>
        {/* 요일 헤더 */}
        <div className="flex border-b border-default/70">
          <div className="w-[44px] shrink-0" aria-hidden />
          {days.map((day, i) => {
            const today = day === TODAY;
            return (
              <div key={day} className="flex flex-1 flex-col items-center gap-0.5 py-2.5">
                {/* 요일 위 + 날짜 아래 — 모바일과 같은 세로 스택, 높이는 압축. */}
                <span className={`text-caption leading-4 ${today ? 'font-semibold text-strong' : 'text-muted'}`}>
                  {WEEKDAY_LABELS[i]}
                </span>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-body font-semibold ${
                    today ? 'bg-ink text-on-ink' : 'text-strong'
                  }`}
                >
                  {dayNumber(day)}
                </span>
              </div>
            );
          })}
        </div>
        {/* 본문 — 시각 영역을 상하 여백(inset-y-4)으로 감싸 라벨/이벤트가 가장자리에 붙지 않게 한다. */}
        <div className="relative h-[640px]">
          <div className="absolute inset-x-0 inset-y-4 flex">
          {/* 시각 라벨 — 9시~6시 균등 배치. 처음은 위 정렬, 끝은 아래 정렬, 중간은 중앙 정렬. */}
          <div className="relative w-[44px] shrink-0" aria-hidden>
            {hours.map((h, i) => {
              const first = i === 0;
              const last = i === hours.length - 1;
              return (
                <span
                  key={h}
                  className={`absolute right-2 text-caption text-faint ${first ? '' : last ? '-translate-y-full' : '-translate-y-1/2'}`}
                  style={{ top: `${(i / (hours.length - 1)) * 100}%` }}
                >
                  {hourLabel(h)}
                </span>
              );
            })}
          </div>
          {days.map((day) => {
            const ghost = ghostOn(day);
            return (
              <div key={day} className="relative flex-1">
                {eventsOn(events, day).map((ev) => {
                  const top = yPct(ev.start);
                  const height = yPct(ev.end) - top;
                  const compact = ev.end - ev.start < 50;
                  const st = styleFor(ev);
                  const badges =
                    responseBadges && responseBadges.eventId === ev.id && responseBadges.people.length > 0
                      ? responseBadges.people
                      : null;
                  return (
                    <div
                      key={ev.id}
                      className="absolute inset-x-1.5 overflow-hidden rounded-r4 px-3 py-2"
                      style={{ top: `calc(${top}% + 3px)`, height: `calc(${height}% - 6px)`, backgroundColor: st.bg }}
                    >
                      <p className="truncate text-body-s font-bold leading-dense" style={{ color: st.title }}>
                        {ev.title}
                      </p>
                      {!compact && (
                        <p className="truncate text-caption font-medium leading-dense" style={{ color: st.sub }}>
                          {fmtRange(ev.start, ev.end)}
                          {ev.room ? `, ${ev.room}` : ''}
                        </p>
                      )}
                      {badges && (
                        <span className="absolute bottom-[3px] right-1.5">
                          <BadgeStack people={badges} />
                        </span>
                      )}
                    </div>
                  );
                })}
                {ghost && (
                  <button
                    type="button"
                    onClick={onOpenInvite}
                    className={`pressable absolute inset-x-1.5 rounded-r4 px-3 py-2 text-left ${GHOST_CARD}`}
                    style={{
                      top: `calc(${yPct(ghost.start)}% + 3px)`,
                      height: `calc(${yPct(ghost.end) - yPct(ghost.start)}% - 6px)`,
                    }}
                  >
                    <p className={`truncate text-body-s font-bold leading-dense ${GHOST_TITLE_CLS}`}>{ghost.title}</p>
                    <p className={`truncate text-caption font-medium leading-dense ${GHOST_SUB_CLS}`}>
                      {fmtRange(ghost.start, ghost.end)}
                      {ghost.room ? `, ${ghost.room}` : ''} · 응답 대기
                    </p>
                  </button>
                )}
              </div>
            );
          })}
          </div>
        </div>
        </motion.div>
        </AnimatePresence>
      </div>

      {/* ── 모바일: 요일 칩 + 하루 목록 ── */}
      <div className="mt-2 lg:hidden">
        <AnimatePresence mode="wait" initial={false}>
        <motion.div key={week} {...weekFade}>
        <div className="grid grid-cols-5">
          {days.map((day, i) => {
            const selected = day === selectedDay;
            const today = day === TODAY;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                aria-pressed={selected}
                className="pressable flex flex-col items-center gap-1 rounded-r4 py-2"
              >
                <span className={`text-caption ${selected || today ? 'font-semibold text-strong' : 'text-muted'}`}>
                  {WEEKDAY_LABELS[i]}
                </span>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-body-l font-semibold ${
                    selected ? 'bg-ink text-on-ink' : today ? 'text-strong' : 'text-strong'
                  }`}
                >
                  {dayNumber(day)}
                </span>
                <span
                  className={`h-1 w-1 rounded-full ${today && !selected ? 'bg-ink' : 'bg-transparent'}`}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>

        {/* 요일 탭 전환도 살짝 페이드 — 주 전환(바깥 키)보다 조용하게. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selectedDay}
            initial={reduced ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduced ? { opacity: 1 } : { opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.1, ease: 'easeOut' }}
          >
            <MobileDayList
              events={eventsOn(events, selectedDay)}
              ghost={ghostOn(selectedDay)}
              onOpenInvite={onOpenInvite}
              responseBadges={responseBadges}
            />
          </motion.div>
        </AnimatePresence>
        </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
