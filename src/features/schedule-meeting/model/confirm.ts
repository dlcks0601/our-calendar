import type { Minutes } from '@/shared/lib/time';
import type { CandidateSlot, SlotReason } from '@/entities/slot';
import type { Room } from '@/entities/room';

// ── 순수 헬퍼(테스트 대상) ─────────────────────────────────────────

export interface Mitigations {
  delayTen: boolean;
  fiftyMin: boolean;
}

/** 완화 토글 노출 조건 — 슬롯의 실제 긴장(reasons)에서만 파생한다. */
export function mitigationOptions(slot: Pick<CandidateSlot, 'reasons' | 'start' | 'end'>): Mitigations {
  return {
    delayTen: slot.reasons.some((r) => r.code === 'after-lunch'),
    // '50분 회의'는 줄여서 배려하는 제안 — 원래 길이가 50분 이하면 성립하지 않는다.
    fiftyMin: slot.reasons.some((r) => r.code === 'back-to-back') && slot.end - slot.start > 50,
  };
}

/**
 * 실제로 적용되는 완화 — 토글 상태는 슬롯이 바뀌어도 reducer에 남을 수 있으므로,
 * 이 슬롯이 그 완화를 제안하는 경우에만 유효한 것으로 본다(파생 무효화).
 */
export function activeMitigations(
  slot: Pick<CandidateSlot, 'reasons' | 'start' | 'end'>,
  m: Mitigations,
): Mitigations {
  const opts = mitigationOptions(slot);
  return { delayTen: m.delayTen && opts.delayTen, fiftyMin: m.fiftyMin && opts.fiftyMin };
}

/** 완화 반영 시간 — delayTen은 시작·끝 +10분, fiftyMin은 (늦춘) 시작부터 50분으로 마친다. */
export function adjustedRange(
  slot: { start: Minutes; end: Minutes },
  m: Mitigations,
): { start: Minutes; end: Minutes } {
  const start = slot.start + (m.delayTen ? 10 : 0);
  const end = m.fiftyMin ? start + 50 : slot.end + (m.delayTen ? 10 : 0);
  return { start, end };
}

/** 확정 직전 정직함 — 선택 슬롯의 긴장 라인(비positive)만 1~2줄 재노출한다. */
export function tensionLines(reasons: SlotReason[]): SlotReason[] {
  return reasons.filter((r) => r.tone !== 'positive').slice(0, 2);
}

/** '딱 맞는' 방 — 정원 여유(capacity − headcount)가 최소인 방의 id. 동률이면 앞쪽, 없으면 null. */
export function bestRoomId(rooms: Pick<Room, 'id' | 'capacity'>[], headcount: number): string | null {
  let best: string | null = null;
  let slack = Infinity;
  for (const r of rooms) {
    const s = r.capacity - headcount;
    if (s >= 0 && s < slack) {
      best = r.id;
      slack = s;
    }
  }
  return best;
}

/** 분 → '30분' / '50분' / '1시간' / '1시간 30분'. */
export function fmtDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
}
