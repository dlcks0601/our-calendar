import { addDaysISO, weekdayIndex, mondayOf } from '@/shared/lib/time';

/**
 * 앵커(오늘) — 라이브. 언제 열어도 '오늘'이 진짜 오늘이어야 한다(사용자 계약 변경:
 * 앵커 해석에 한해 실시간 시계 허용 — 그 아래 세계·엔진은 여전히 앵커 상대 결정적).
 * KST 고정 계산 — 서버/클라이언트가 같은 날짜를 보게 해 하이드레이션 불일치를 막는다.
 * 주말이면 다음 월요일로 넘긴다(영업일 세계). 테스트는 NEXT_PUBLIC_ANCHOR로
 * 고정 앵커(2026-07-07 화)를 주입해 요일 안무 계약을 그대로 검증한다.
 */
function resolveAnchor(): string {
  const fixed = process.env.NEXT_PUBLIC_ANCHOR;
  if (fixed) return fixed;
  const kst = new Date(Date.now() + 9 * 3600_000);
  const iso = kst.toISOString().slice(0, 10);
  const wd = weekdayIndex(iso); // 0=월 … 5=토, 6=일
  if (wd === 5) return addDaysISO(iso, 2);
  if (wd === 6) return addDaysISO(iso, 1);
  return iso;
}
export const ANCHOR_DATE = resolveAnchor();

// ── 날짜 상수 — 앵커(오늘) 상대 계산. 라이브 앵커를 따라 세계 전체가 움직인다. ──
// 안무는 전부 '주차(W0·W1·W2) × 요일' 상대 구조라, 여기만 앵커를 따라가면 씬이 보존된다.
export const W0_MON = mondayOf(ANCHOR_DATE); // 현재 주(홈 캘린더에 보이는 주)
export const W0_TUE = addDaysISO(W0_MON, 1);
export const W0_WED = addDaysISO(W0_MON, 2);
export const W0_THU = addDaysISO(W0_MON, 3);
export const W0_FRI = addDaysISO(W0_MON, 4);
export const W1_MON = addDaysISO(W0_MON, 7); // 다음 주(next-week)
export const W1_TUE = addDaysISO(W0_MON, 8);
export const W1_WED = addDaysISO(W0_MON, 9);
export const W1_THU = addDaysISO(W0_MON, 10);
export const W1_FRI = addDaysISO(W0_MON, 11);
export const W2_MON = addDaysISO(W0_MON, 14); // 그 다음 주(flexible)
export const W2_TUE = addDaysISO(W0_MON, 15);
export const W2_WED = addDaysISO(W0_MON, 16);
export const W2_THU = addDaysISO(W0_MON, 17);
export const W2_FRI = addDaysISO(W0_MON, 18);
