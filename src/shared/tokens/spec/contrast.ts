import { BG, FG, KIND_FAMILY, KIND_STEP, resolve } from './color.ts';

/** sRGB 한 채널을 선형 값으로 */
function linear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * linear((n >> 16) & 255) + 0.7152 * linear((n >> 8) & 255) + 0.0722 * linear(n & 255);
}

/** WCAG 2.x 대비 비율 (1 ~ 21). 인자 순서는 상관없다. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export interface ContrastPair {
  label: string;
  fg: string;
  bg: string;
  /** 지켜야 할 최소 비율. 본문 글자 4.5, 보조 글자와 큰 글자 3. */
  min: number;
}

const BODY = 4.5;
const SECONDARY = 3;

const pair = (label: string, fg: string, bg: string, min: number): ContrastPair => ({ label, fg, bg, min });

/** 화면에서 실제로 쓰는 글자·바탕 조합. 테스트가 전부 검사하고, 문서 화면이 그대로 보여 준다. */
export const CONTRAST_PAIRS: ContrastPair[] = [
  pair('강조 글자 / 페이지', resolve(FG.strong), resolve(BG.page), BODY),
  pair('강조 글자 / 옅은 바탕', resolve(FG.strong), resolve(BG.subtle), BODY),
  pair('강조 글자 / 회색 바탕', resolve(FG.strong), resolve(BG.muted), BODY),
  pair('본문 글자 / 페이지', resolve(FG.default), resolve(BG.page), BODY),
  pair('본문 글자 / 옅은 바탕', resolve(FG.default), resolve(BG.subtle), BODY),
  pair('보조 글자 / 페이지', resolve(FG.muted), resolve(BG.page), SECONDARY),
  pair('보조 글자 / 옅은 바탕', resolve(FG.muted), resolve(BG.subtle), SECONDARY),
  pair('검정 면 위 글자', resolve(FG['on-ink']), resolve(BG.ink), BODY),
  pair('눌린 검정 면 위 글자', resolve(FG['on-ink']), resolve(BG['ink-pressed']), BODY),
  pair('경고 글자 / 경고 바탕', resolve(FG.warning), resolve(BG['warning-weak']), BODY),
  pair('완료 표시 위 글자', resolve(FG['on-ink']), resolve(BG.positive), BODY),
  ...Object.entries(KIND_FAMILY).flatMap(([kind, family]) => [
    pair(`일정 제목 / 일정 바탕 (${kind})`, resolve(`${family}-${KIND_STEP.fg}`), resolve(`${family}-${KIND_STEP.bg}`), BODY),
    pair(`일정 시간 / 일정 바탕 (${kind})`, resolve(`${family}-${KIND_STEP.fgMuted}`), resolve(`${family}-${KIND_STEP.bg}`), SECONDARY),
  ]),
];
