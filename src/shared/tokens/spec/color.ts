/**
 * 색 명세 — 팔레트 → 역할 → 일정 종류·사람 순으로 쌓는다. 값은 여기 한 곳에만 있다.
 * 무채색은 화면에서 역할 이름으로만 쓴다(`text-strong`, `bg-ink`, `ring-page`). 테스트가 지킨다.
 * 색 계열은 색이 곧 정보인 곳(일정 종류, 사람, 안내 배지, 제안 카드, 완료·스캔 화면의 배경)에서 팔레트 단계를 직접 쓴다.
 */

/** 팔레트: 계열별 단계표. 숫자가 클수록 진하다. 실제로 쓰이는 단계만 둔다. */
export const PALETTE = {
  gray: {
    0: '#FFFFFF',
    50: '#F7F7F7',
    100: '#F4F4F4',
    200: '#E6E6E6',
    300: '#D6D6D6',
    400: '#B8B8B8',
    500: '#8C8C8C',
    600: '#6B6B6B',
    700: '#4A4A4A',
    800: '#3C3C3C',
    900: '#2E2E2E',
    1000: '#000000',
  },
  sky: { 100: '#DDF0FB', 200: '#C2E0F6', 500: '#3AA3DA', 600: '#3F86AE', 800: '#136A99' },
  green: { 100: '#DFF3E6', 200: '#C3E6CF', 500: '#3DAE74', 600: '#468C67', 800: '#1F7A4B' },
  yellow: { 100: '#FCF1D6', 200: '#F3E0B0', 500: '#E0A82E', 600: '#9F7C34', 800: '#8A6410' },
  stone: { 100: '#EEEDEA', 200: '#DEDCD6', 500: '#8F8C82', 600: '#7A7870', 800: '#4A4944' },
  coral: { 100: '#FCE7E0', 200: '#F4CFC3', 500: '#E0704F', 600: '#BF644A', 800: '#A2452B' },
  rose: { 100: '#FBE6EE', 200: '#F8DDE6', 500: '#C56B8E', 800: '#A33A62' },
  olive: { 100: '#EEF3D9', 500: '#7E9A3C', 800: '#5C6F14' },
  tan: { 500: '#A9805C' },
  red: { 500: '#F03E3E', 600: '#E5342B' },
} as const;

export type Family = keyof typeof PALETTE;
/** 'gray-1000', 'sky-100' 같은 팔레트 참조 */
export type PaletteRef = {
  [F in Family]: `${F}-${Extract<keyof (typeof PALETTE)[F], number>}`;
}[Family];

/** 팔레트 참조를 색 값으로 바꾼다. 없는 참조는 명세 오류이므로 던진다. */
export function resolve(ref: string): string {
  const cut = ref.lastIndexOf('-');
  const family = PALETTE[ref.slice(0, cut) as Family] as Record<string, string> | undefined;
  const value = family?.[ref.slice(cut + 1)];
  if (!value) throw new Error(`팔레트에 없는 색: ${ref}`);
  return value;
}

/** 글자·아이콘 색. 클래스는 `text-<이름>`. */
export const FG = {
  strong: 'gray-1000',
  default: 'gray-700',
  muted: 'gray-500',
  faint: 'gray-400',
  disabled: 'gray-300',
  'on-ink': 'gray-0',
  warning: 'yellow-800',
  positive: 'green-800',
  critical: 'red-600',
} as const satisfies Record<string, PaletteRef>;

/** 바탕 색. 클래스는 `bg-<이름>`. 주 행동은 검정(ink)이다. */
export const BG = {
  page: 'gray-0',
  /** 목록 행과 묶음 상자의 가장 옅은 면. 올리면 subtle로 한 단계 진해진다. */
  faint: 'gray-50',
  subtle: 'gray-100',
  muted: 'gray-200',
  ink: 'gray-1000',
  'ink-pressed': 'gray-900',
  /** 화면 위에 떠서 알리는 어두운 면 — 토스트, 말풍선. */
  'ink-soft': 'gray-900',
  'warning-weak': 'yellow-100',
  /** 아쉬운 후보를 알리는 점. */
  warning: 'yellow-800',
  positive: 'green-800',
  alert: 'red-500',
} as const satisfies Record<string, PaletteRef>;

/** 선 색. 클래스는 `border-<이름>`, `ring-<이름>`, `divide-<이름>`. */
export const STROKE = {
  default: 'gray-200',
  strong: 'gray-300',
  /** 점선 테두리처럼 선만으로 자리를 알릴 때. */
  faint: 'gray-400',
  ink: 'gray-1000',
  /** 겹친 아바타와 배지를 바탕색으로 갈라 주는 선. */
  page: 'gray-0',
} as const satisfies Record<string, PaletteRef>;

/** 일정 종류 → 색 계열. 종류는 색으로 구분한다. */
export const KIND_FAMILY = {
  meeting: 'sky',
  focus: 'green',
  lunch: 'yellow',
  personal: 'stone',
  offsite: 'coral',
} as const satisfies Record<string, Family>;

/** 일정 블록의 부위 → 계열 안의 단계. 옅은 바탕에 같은 계열의 짙은 글자를 올린다. */
export const KIND_STEP = { bg: 100, border: 200, bar: 500, fgMuted: 600, fg: 800 } as const;

/** 사람 색 — 시간 찾기의 타임라인에서 누가 언제 바쁜지를 구분한다. */
export const PERSON = [
  'sky-500',
  'green-500',
  'coral-500',
  'yellow-500',
  'stone-500',
  'rose-500',
  'olive-500',
  'tan-500',
] as const satisfies readonly PaletteRef[];

/** 아바타 바탕 — 옅은 바탕과 같은 계열의 짙은 글자 여섯 쌍. */
export const AVATAR_FAMILIES = ['green', 'sky', 'olive', 'yellow', 'coral', 'rose'] as const satisfies readonly Family[];
