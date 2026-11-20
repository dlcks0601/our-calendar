import { AVATAR_FAMILIES, BG, FG, KIND_FAMILY, KIND_STEP, PALETTE, PERSON, STROKE } from './color.ts';
import { EASING, SPRING } from './motion.ts';
import { RADIUS, SHADOW } from './shape.ts';
import { FONT, LEADING, TEXT, TRACKING, WEIGHT } from './typography.ts';

/** 토큰 명세 전체 — 생성기, 테스트, 문서 화면이 같은 객체를 읽는다. */
export const TOKENS = {
  palette: PALETTE,
  fg: FG,
  bg: BG,
  stroke: STROKE,
  kindFamily: KIND_FAMILY,
  kindStep: KIND_STEP,
  person: PERSON,
  avatarFamilies: AVATAR_FAMILIES,
  text: TEXT,
  leading: LEADING,
  tracking: TRACKING,
  weight: WEIGHT,
  font: FONT,
  radius: RADIUS,
  shadow: SHADOW,
  easing: EASING,
  spring: SPRING,
} as const;

export type TokenSpec = typeof TOKENS;
