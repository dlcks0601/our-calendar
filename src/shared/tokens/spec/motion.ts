/** 가속 곡선. CSS에서는 `var(--bezier-<이름>)`로 쓴다. */
export const EASING = {
  standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
  out: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
  back: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  ambient: 'cubic-bezier(0.6, 0, 0, 0.6)',
} as const;

/** 스프링 — motion 라이브러리에 그대로 넘긴다. */
export const SPRING = {
  /** 자리 이동과 순서 바뀜. 넘치지 않는다. */
  position: { type: 'spring', stiffness: 350, damping: 30 },
  /** 작은 것이 튀어나올 때. 살짝 넘친다. */
  pop: { type: 'spring', stiffness: 500, damping: 18 },
  /** 시트와 패널이 올라올 때. */
  sheet: { type: 'spring', stiffness: 400, damping: 30 },
} as const;
