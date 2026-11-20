/** 모서리 반경(px). 클래스는 `rounded-r1` … `rounded-r6`. 원형은 `rounded-full`. */
export const RADIUS = { r1: 6, r2: 8, r3: 10, r4: 12, r5: 16, r6: 24 } as const;

/** 그림자 — 얕은 것부터. 클래스는 `shadow-s1` … `shadow-s4`. */
export const SHADOW = {
  /** 카드가 바탕에서 살짝 떠 있을 때 */
  s1: '0 1px 3px rgb(0 0 0 / 0.06)',
  /** 선택된 칩, 떠 있는 작은 요소 */
  s2: '0 2px 10px rgb(0 0 0 / 0.18)',
  /** 선택된 일정 블록, 떠 있는 버튼 */
  s3: '0 8px 24px rgb(0 0 0 / 0.18)',
  /** 팝오버, 시트처럼 화면 위에 덮이는 것 */
  s4: '0 16px 40px rgb(0 0 0 / 0.14), 0 2px 8px rgb(0 0 0 / 0.06)',
} as const;
