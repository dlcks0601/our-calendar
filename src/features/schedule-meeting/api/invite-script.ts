import type { SlotReason } from '@/entities/slot';
import { ANCHOR_DATE, W0_THU, W1_THU, W2_THU } from '@/shared/config';

// ── S5: 수신 초대 ──────────────────────────────────────────
// 최민수 → 나. 받는 사람(나) 관점의 해요체. 내 줄(회원님)이 첫 줄.
// 코드값은 SlotReason 재사용, 세계 사실과 모순 없게 손으로 쓴다.
// attendeeCount는 각본 수치(민수가 잡은 회의의 전체 인원) — 초대 카드 헤드라인이 그대로 쓴다.
// 단일 회차 — 이 제품의 일정 만들기에 반복 개념이 없으니 초대도 반복을 말하지 않는다(2026-07-10).
// 날짜 = 앵커 이후 첫 목요일: 라이브 앵커가 금요일이면 이번 주 목(과거)을 건너뛴다 —
// 받은 초대가 지난 날짜로 보이면 세계가 깨진다.
const INVITE_THU = [W0_THU, W1_THU, W2_THU].find((d) => d >= ANCHOR_DATE) ?? W2_THU;

export const INCOMING_INVITE: {
  fromId: string; title: string; day: string; days: string[]; start: number; end: number;
  room: string; attendeeCount: number; reasonsForMe: SlotReason[];
} = {
  fromId: 'minsu',
  title: '디자인 시스템 리뷰',
  day: INVITE_THU,
  days: [INVITE_THU],
  start: 840,
  end: 900,
  room: '미팅룸 2', // 주최자(민수)가 정한 회의실 — 초대에도 당연히 보인다

  attendeeCount: 5,
  reasonsForMe: [
    { code: 'all-required-ok', tone: 'positive', text: '회원님의 금요일 마감 회의를 피했어요' },
    { code: 'optional-ok', tone: 'positive', text: '점심 이후라 오후 흐름에 자연스럽게 이어져요' },
    { code: 'offsite-day', tone: 'warning', text: '박준호님은 이날 외근이라 화상으로 합류해요' },
  ],
};

// ── S6: 응답 각본 ──────────────────────────────────────────
export const RESPONSE_SCRIPT: {
  afterMs: number; personId: string; kind: 'accepted' | 'partial' | 'difficult'; text: string;
}[] = [
  { afterMs: 3000, personId: 'junho', kind: 'accepted', text: '준호님이 참석해요' },
  { afterMs: 6000, personId: 'seoyeon', kind: 'accepted', text: '서연님이 참석해요' },
  { afterMs: 10000, personId: 'haneul', kind: 'partial', text: '하늘님이 앞 30분 함께해요' },
];
