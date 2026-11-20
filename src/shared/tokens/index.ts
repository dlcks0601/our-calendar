import { AVATAR_FAMILIES, KIND_FAMILY, KIND_STEP, PERSON, resolve } from './spec/color.ts';
import { SPRING } from './spec/motion.ts';

export { TOKENS, type TokenSpec } from './spec/index.ts';
export { CONTRAST_PAIRS, contrastRatio, type ContrastPair } from './spec/contrast.ts';
export { resolve as resolveColor } from './spec/color.ts';
export { SPRING };

export type KindName = keyof typeof KIND_FAMILY;
export interface KindColor {
  bg: string;
  border: string;
  bar: string;
  fgMuted: string;
  fg: string;
}

const kindColor = (family: string): KindColor => ({
  bg: resolve(`${family}-${KIND_STEP.bg}`),
  border: resolve(`${family}-${KIND_STEP.border}`),
  bar: resolve(`${family}-${KIND_STEP.bar}`),
  fgMuted: resolve(`${family}-${KIND_STEP.fgMuted}`),
  fg: resolve(`${family}-${KIND_STEP.fg}`),
});

/** 일정 종류별 색 값 — 인라인 스타일로 색을 줘야 하는 곳(일정 블록)에서 쓴다. */
export const KIND_COLOR = Object.fromEntries(
  Object.entries(KIND_FAMILY).map(([kind, family]) => [kind, kindColor(family)]),
) as Record<KindName, KindColor>;

/** 사람 색 값 — 타임라인의 사람 구분. */
export const PERSON_COLORS: readonly string[] = PERSON.map(resolve);

/** 아바타 바탕과 글자 쌍. */
export const AVATAR_TINTS: readonly { bg: string; text: string }[] = AVATAR_FAMILIES.map((family) => ({
  bg: resolve(`${family}-100`),
  text: resolve(`${family}-800`),
}));
