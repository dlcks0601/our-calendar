'use client';

import type { Dispatch } from 'react';
import HomeCalendar, { type ResponseBadges } from './HomeCalendar';
import { NotificationBell, type AppNotification } from '@/widgets/notification-center';
import { Reveal } from '@/shared/ui/reveal';
import { Wordmark } from '@/shared/ui/wordmark';
import { useScrollProgress } from '@/shared/lib/hooks';
import { type Action, type AppState, INCOMING_INVITE } from '@/features/schedule-meeting';
import { ME_ID, ORG } from '@/entities/member';
import { ActionButton } from '@/shared/ui/action-button';

const ME = ORG.find((p) => p.id === ME_ID)!;

// ── 홈 — 분기점: 여정 A(새 일정/할 일 카드) · 여정 B(받은 초대 — 알림 벨·고스트) ──

export default function HomePage({
  state,
  dispatch,
  unreadCount,
  notifications,
  onOpenNotifications,
  responseBadges,
}: {
  state: AppState;
  dispatch: Dispatch<Action>;
  unreadCount: number;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  responseBadges: ResponseBadges | null;
}) {
  const openSetup = () => {
    // 확정을 마친 여정 뒤의 '일정 만들기'는 새 출발 — 이전 조율 조건을 비운다(myEvents 보존).
    // done을 우회해 홈에 온 경로(미리보기→홈 등)까지 커버한다. 미확정 여정의 재진입은 그대로 이어진다.
    if (state.confirmedAt) dispatch({ type: 'RESET' });
    dispatch({ type: 'SET_STEP', step: 'setup' });
  };
  const openInvite = () => dispatch({ type: 'SET_STEP', step: 'invite' });
  const headerVeil = useScrollProgress();
  // 응답을 마친 초대는 캘린더의 고스트가 소멸한다(수락이면 myEvents의 실제 회의 블록으로 대체).
  // 알림 센터의 초대 알림은 기록으로 남는다 — 탭하면 응답 완료 상태의 초대 화면이 열린다.
  const invitePending = state.inviteResponded === null;

  return (
    <div className="relative min-h-dvh bg-page pb-32 lg:pb-16">

      {/* 헤더 — 스크롤 연동 베일(FrostedBar와 같은 문법). 정지 상태 = 완전 투명. */}
      <div className="sticky top-0 z-50">
        <div
          aria-hidden
          style={{ opacity: headerVeil }}
          className="pointer-events-none absolute inset-x-0 -bottom-12 top-0 bg-page/60 backdrop-blur-lg [mask-image:linear-gradient(to_bottom,black_40%,transparent)]"
        />
        <div className="relative mx-auto max-w-[1200px] px-4 py-3.5 lg:px-6 lg:py-4">
          <Reveal as="header" className="flex items-center justify-between">
            <Wordmark />
            <div className="flex items-center gap-2">
              {/* 데스크톱 CTA — frosted sticky 헤더 소속이라 스크롤을 따라오면서 콘텐츠를 가리지 않는다. */}
              <span className="hidden lg:inline-flex">
                <ActionButton size="sm" onClick={openSetup}>
                  일정 만들기
                </ActionButton>
              </span>
              <NotificationBell
                unreadCount={unreadCount}
                list={notifications}
                onOpen={onOpenNotifications}
                onSelectInvite={openInvite}
                onOpenPage={() => dispatch({ type: 'SET_STEP', step: 'notifications' })}
              />
            </div>
          </Reveal>
        </div>
      </div>

      <Reveal delay={70} className="relative mx-auto max-w-[1200px] px-4 lg:px-6">
        {/* 내 기본 일정 + 셋업 혼자 경로로 저장한 개인 일정(myEvents)을 함께 그린다. */}
        <HomeCalendar
          events={[...ME.events, ...state.myEvents]}
          invite={invitePending ? INCOMING_INVITE : null}
          onOpenInvite={openInvite}
          responseBadges={responseBadges}
        />
      </Reveal>

      {/* 모바일 고정 CTA — 하단 풀폭. */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 px-4 pt-6 lg:hidden"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        {/* 하단 frost — 헤더의 미러: 스크롤 콘텐츠가 반투명 너머로 흐릿하게 지나간다(경계 없음). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-8 bottom-0 bg-gradient-to-t from-page via-page/85 to-transparent"
        />
        <ActionButton size="lg" fullWidth
          onClick={openSetup}
          className="relative"
        >
          일정 만들기
        </ActionButton>
      </div>

    </div>
  );
}
