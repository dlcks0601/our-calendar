/**
 * 글자 명세 — 크기와 줄 높이를 한 단계로 묶는다. 클래스는 `text-<이름>`.
 * 20px까지는 줄 높이 1.5, 그 위 제목은 좁힌다. 따로 정해야 하면 `leading-<이름>`을 함께 쓴다.
 */
export const TEXT = {
  micro: { size: 7, lineHeight: 1 },
  'caption-s': { size: 10, lineHeight: 1.5 },
  caption: { size: 11, lineHeight: 1.5 },
  label: { size: 12, lineHeight: 1.5 },
  'body-s': { size: 13, lineHeight: 1.5 },
  body: { size: 14, lineHeight: 1.5 },
  'body-l': { size: 15, lineHeight: 1.5 },
  'title-s': { size: 16, lineHeight: 1.5 },
  title: { size: 18, lineHeight: 1.5 },
  'title-l': { size: 20, lineHeight: 1.5 },
  heading: { size: 22, lineHeight: 1.35 },
  'heading-l': { size: 24, lineHeight: 1.35 },
  display: { size: 28, lineHeight: 1.3 },
} as const;

/** 줄 높이를 따로 정할 때 쓰는 단계. 클래스는 `leading-<이름>`. */
export const LEADING = { dense: 1.3, snug: 1.4, normal: 1.5, loose: 1.6 } as const;

/** 자간. 클래스는 `tracking-<이름>`. */
export const TRACKING = { tight: '-0.02em', snug: '-0.01em' } as const;

/**
 * 굵기 — 단계를 통째로 한 칸씩 가볍게 잡는다. 위계는 유지하고 전체 인상만 덜어 낸다.
 * 무게는 글자가 아니라 검정 면이 진다.
 */
export const WEIGHT = {
  light: 300,
  normal: 380,
  medium: 440,
  semibold: 500,
  bold: 560,
  extrabold: 600,
  black: 620,
} as const;

/** 글꼴. 화면 글자는 Pretendard, 로고만 Overused Grotesk(`--font-wordmark`는 RootLayout이 주입). */
export const FONT = {
  sans: "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  logo: "var(--font-wordmark), 'Pretendard Variable', Pretendard, sans-serif",
} as const;
