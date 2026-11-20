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
  /** 글자 역할(`text-<이름>`의 이름). 일정 블록의 글자는 'kind'. */
  role: string;
  fg: string;
  bg: string;
  /** 이 조합에 적용하는 기준. 본문 글자 4.5, 보조 글자 3. */
  min: number;
  /** 기준을 지키지 못하는 조합은 숨기지 않고 여기에 이유를 적는다. miss는 알려진 미달, exempt는 기준의 대상이 아닌 것. */
  waiver?: { type: 'miss' | 'exempt'; reason: string };
}

/** 본문 글자의 기준 — WCAG AA(4.5:1). */
const BODY = 4.5;
/**
 * 보조 글자의 기준 — 이 제품이 정한 3:1. WCAG AA는 작은 글자에 4.5:1을 요구하므로
 * 12~14px로 쓰는 보조 글자는 AA에 못 미친다. 값을 어둡게 할지는 디자인 결정으로 남아 있다.
 */
const SECONDARY = 3;

type FgRole = keyof typeof FG;
type BgRole = keyof typeof BG;

const on = (label: string, role: FgRole, bg: BgRole, min: number, waiver?: ContrastPair['waiver']): ContrastPair => ({
  label,
  role,
  fg: resolve(FG[role]),
  bg: resolve(BG[bg]),
  min,
  ...(waiver ? { waiver } : {}),
});

/**
 * 글자 역할마다, 화면에서 실제로 놓이는 바탕과의 조합. 테스트가 전부 검사하고 문서 화면이 그대로 보여 준다.
 * 글자 역할을 새로 만들면 여기에 조합을 적어야 테스트가 통과한다.
 */
export const CONTRAST_PAIRS: ContrastPair[] = [
  on('강조 글자 / 페이지', 'strong', 'page', BODY),
  on('강조 글자 / 가장 옅은 바탕', 'strong', 'faint', BODY),
  on('강조 글자 / 옅은 바탕', 'strong', 'subtle', BODY),
  on('강조 글자 / 회색 바탕', 'strong', 'muted', BODY),
  on('본문 글자 / 페이지', 'default', 'page', BODY),
  on('본문 글자 / 가장 옅은 바탕', 'default', 'faint', BODY),
  on('본문 글자 / 옅은 바탕', 'default', 'subtle', BODY),
  on('보조 글자 / 페이지', 'muted', 'page', SECONDARY),
  on('보조 글자 / 가장 옅은 바탕', 'muted', 'faint', SECONDARY),
  on('보조 글자 / 옅은 바탕', 'muted', 'subtle', SECONDARY),
  on('옅은 안내 글자 / 페이지', 'faint', 'page', SECONDARY, {
    type: 'miss',
    reason: '빈 상태 안내, 자리표시 글자, 시간 눈금, 장식 아이콘에 쓴다. 3:1에 못 미치는 알려진 한계다',
  }),
  on('비활성 버튼 글자 / 옅은 바탕', 'faint', 'subtle', SECONDARY, {
    type: 'exempt',
    reason: '누를 수 없는 버튼의 글자. 비활성 요소는 대비 기준의 대상이 아니다',
  }),
  on('꺼진 표시 / 페이지', 'disabled', 'page', SECONDARY, {
    type: 'exempt',
    reason: '선택되지 않은 체크와 고를 수 없는 날짜. 꺼진 상태를 나타내는 표시라 대비 기준의 대상이 아니다',
  }),
  on('검정 면 위 글자', 'on-ink', 'ink', BODY),
  on('눌린 검정 면 위 글자', 'on-ink', 'ink-pressed', BODY),
  on('토스트와 말풍선 위 글자', 'on-ink', 'ink-soft', BODY),
  on('완료 표시 위 글자', 'on-ink', 'positive', BODY),
  on('경고 글자 / 경고 바탕', 'warning', 'warning-weak', BODY),
  on('긍정 글자 / 페이지', 'positive', 'page', BODY),
  on('위험 글자 / 페이지', 'critical', 'page', BODY, {
    type: 'miss',
    reason: '아직 화면에서 쓰지 않는 역할이다. 본문 기준에 조금 못 미쳐, 쓰기 전에 값을 조정해야 한다',
  }),
  ...Object.entries(KIND_FAMILY).flatMap(([kind, family]): ContrastPair[] => [
    {
      label: `일정 제목 / 일정 바탕 (${kind})`,
      role: 'kind',
      fg: resolve(`${family}-${KIND_STEP.fg}`),
      bg: resolve(`${family}-${KIND_STEP.bg}`),
      min: BODY,
    },
    {
      label: `일정 시간 / 일정 바탕 (${kind})`,
      role: 'kind',
      fg: resolve(`${family}-${KIND_STEP.fgMuted}`),
      bg: resolve(`${family}-${KIND_STEP.bg}`),
      min: SECONDARY,
    },
  ]),
];
