'use client';

import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { ConfirmStep } from '@/pages/confirm';
import { DoneStep } from '@/pages/done';
import { InviteView } from '@/pages/invite';
import { SetupForm } from '@/pages/setup';
import { ToastStack, playResponseScript, useNotifications, type AppNotification } from '@/widgets/notification-center';
import { fromUrl, initialState, reducer, toUrl, INCOMING_INVITE, RESPONSE_SCRIPT } from '@/features/schedule-meeting';
import { type ResponseBadges, HomePage } from '@/pages/home';
import { ORG } from '@/entities/member';
import { FindTimePage } from '@/pages/find-time';
import { NotificationsPage } from '@/pages/notifications';

/**
 * 앱 본체 — 단일 페이지 스텝 머신. reducer가 상태를, 주소창(toUrl/fromUrl)이 딥링크를 소유한다.
 * home·setup·find·confirm·done에 더해 invite(여정 B/미리보기)까지 전 스텝이 실제 화면이다.
 *
 * T19 배선(제품 루프의 마감):
 *  - 초대 뷰 mode: reducer에 origin이 없으므로 직전 스텝을 ref로 추적 — done에서
 *    들어오면 'preview'(내가 보낸 초대의 수신자 관점), 그 외는 'incoming'(민수의 초대).
 *  - 응답 각본: 확정(confirmedSlotId) 후 홈에 도착하는 첫 순간 1회만 재생(세션 로컬
 *    플래그 — reducer가 아니라 로컬 state). 재생이 시작되면 스텝을 옮겨도 끊지 않고
 *    (토스트는 전역 오버레이) cancel은 페이지 언마운트 cleanup에만 묶는다.
 *  - 응답 배지: 도착한 response 알림(personId)을 각본 순서로 모아, 방금 확정한
 *    회의 블록(myEvents의 confirmed-*)에 아바타 스택으로 얹는다.
 */

const INVITE_FROM = ORG.find((p) => p.id === INCOMING_INVITE.fromId)!;
/** 성을 뗀 호칭 — '최민수' → '민수'(응답 토스트 '준호님' 톤과 맞춘다). 2글자 이름은 그대로. */
const INVITE_FROM_GIVEN = INVITE_FROM.name.length >= 3 ? INVITE_FROM.name.slice(1) : INVITE_FROM.name;

export default function StepRouter() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const { list, toasts, unreadCount, push, seed, dismiss, markAllRead } = useNotifications();

  // 라이브 앵커 하이드레이션 가드 — 날짜 세계(ANCHOR_DATE)는 모듈 로드 시점에 굳는데,
  // 서버(빌드/부팅 시점)와 클라이언트(지금)의 '오늘'이 자정을 사이에 두고 갈라지면
  // 서버 HTML과 클라이언트 렌더가 어긋나 하이드레이션이 깨진다(딥링크가 홈으로 튕김).
  // 데모라 SEO가 필요 없으니 날짜 세계는 클라이언트에서만 그린다 — 서버는 빈 무대만.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // 마운트 시 1회 — 주소창의 딥링크 상태를 흡수한다. (아래 동기화 effect보다 먼저
  // 선언되어 있어 초기 상태가 주소창을 덮어쓰기 전에 원본 쿼리를 읽는다.)
  useEffect(() => {
    dispatch({ type: 'HYDRATE', patch: fromUrl(window.location.search) });
  }, []);

  // 상태 변경 → 주소창 반영. 히스토리 스택은 쌓지 않는다(replaceState).
  useEffect(() => {
    history.replaceState(null, '', `?${toUrl(state)}`);
  }, [state]);

  // 스텝 전환 시 스크롤 최상단 — 한 페이지 스텝 머신이라 이전 화면의 스크롤이 남는다.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [state.step]);

  // ── 받은 초대 적립 — 마운트 시 1회, 알림 센터의 안 읽은 항목으로(토스트 아님) ──
  // 초대는 "이 세션이 시작되기 전에 이미 도착해 있던" 사실이라 transient 토스트가 아니라
  // seed로 곧장 list에 심는다. StrictMode 이중 호출은 ref로 가드(응답 각본 가드와 같은 결).
  const inviteSeededRef = useRef(false);
  useEffect(() => {
    if (inviteSeededRef.current) return;
    inviteSeededRef.current = true;
    if (state.inviteResponded === null) {
      seed({
        id: 'invite-minsu',
        kind: 'invite',
        personId: INCOMING_INVITE.fromId,
        text: '민수님이 회의에 초대했어요',
        at: Date.now(),
      });
    }
  }, [state.inviteResponded, seed]);

  // ── 초대 뷰 mode — 직전 스텝 추적(done → 'preview', 그 외 → 'incoming') ──
  const [inviteMode, setInviteMode] = useState<'incoming' | 'preview'>('incoming');
  const prevStepRef = useRef(state.step);
  useEffect(() => {
    const prev = prevStepRef.current;
    if (state.step === 'invite' && prev !== 'invite') {
      setInviteMode(prev === 'done' ? 'preview' : 'incoming');
    }
    prevStepRef.current = state.step;
  }, [state.step]);

  // ── 응답 각본 재생 — 확정 후 홈 도착 시 1회(세션 로컬 플래그) ──
  const [scriptStarted, setScriptStarted] = useState(false);
  useEffect(() => {
    if (!scriptStarted && state.step === 'home' && state.confirmedSlotId !== null) {
      setScriptStarted(true);
    }
  }, [scriptStarted, state.step, state.confirmedSlotId]);
  useEffect(() => {
    if (!scriptStarted) return;
    // 시작되면 스텝 이동에도 계속 흐른다 — cancel은 언마운트 cleanup에만 묶인다.
    return playResponseScript(push);
  }, [scriptStarted, push]);

  // ── 응답 배지 — 도착한 response 알림을 각본 순서로 모아 확정 회의 블록에 ──
  const responseBadges = useMemo<ResponseBadges | null>(() => {
    const confirmedEvent = [...state.myEvents].reverse().find((e) => e.id.startsWith('confirmed-'));
    if (!confirmedEvent) return null;
    const arrived = new Set(
      [...toasts, ...list].filter((n) => n.kind === 'response' && n.personId).map((n) => n.personId!),
    );
    const people = RESPONSE_SCRIPT.filter((item) => arrived.has(item.personId)).map(
      (item) => ORG.find((p) => p.id === item.personId)!,
    );
    return people.length > 0 ? { eventId: confirmedEvent.id, people } : null;
  }, [state.myEvents, toasts, list]);

  // ── 혼자 일정 저장 피드백 — 홈 복귀가 무음이 되지 않게. transient: 알림 센터엔 안 남는다 ──
  const notifySaved = () =>
    push({
      id: `my-event-saved-${Date.now()}`,
      kind: 'response',
      text: '캘린더에 자리 잡았어요',
      at: Date.now(),
      transient: true,
    });

  // ── 여정 B 응답 — RESPOND_INVITE + 알림 센터 적립(1회 가드) ──
  const respondInvite = (response: 'accepted' | 'difficult') => {
    if (state.inviteResponded !== null) return; // reducer도 no-op이지만 알림 중복 방지
    dispatch({ type: 'RESPOND_INVITE', response });
    const note: AppNotification = {
      id: `invite-resp-${response}`,
      kind: 'invite',
      personId: INCOMING_INVITE.fromId,
      text:
        response === 'accepted'
          ? `${INVITE_FROM_GIVEN}님에게 참석 응답을 보냈어요`
          : `${INVITE_FROM_GIVEN}님에게 어려운 사정을 전했어요`,
      at: Date.now(),
    };
    push(note);
  };

  // 서버 렌더·첫 하이드레이션 프레임 — 날짜가 없는 빈 무대(위 가드 참조).
  if (!mounted) return <main className="min-h-dvh bg-bg" />;

  return (
    <>
      {state.step === 'home' ? (
        <HomePage
          state={state}
          dispatch={dispatch}
          unreadCount={unreadCount}
          notifications={list}
          onOpenNotifications={markAllRead}
          responseBadges={responseBadges}
        />
      ) : state.step === 'setup' ? (
        <SetupForm state={state} dispatch={dispatch} onSaved={notifySaved} />
      ) : state.step === 'find' ? (
        <FindTimePage state={state} dispatch={dispatch} />
      ) : state.step === 'confirm' ? (
        <ConfirmStep state={state} dispatch={dispatch} />
      ) : state.step === 'done' ? (
        <DoneStep state={state} dispatch={dispatch} />
      ) : state.step === 'notifications' ? (
        <NotificationsPage
          notifications={list}
          onBack={() => dispatch({ type: 'SET_STEP', step: 'home' })}
          onSelectInvite={() => dispatch({ type: 'SET_STEP', step: 'invite' })}
        />
      ) : (
        <InviteView mode={inviteMode} state={state} dispatch={dispatch} onRespond={respondInvite} />
      )}
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
