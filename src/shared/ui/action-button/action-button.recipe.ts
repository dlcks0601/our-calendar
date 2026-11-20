import { recipe } from '@/shared/lib/recipe';

/**
 * 버튼 변형 조합표.
 *  - variant: solid(검정 면, 화면의 주 행동) / weak(옅은 회색 면, 보조 행동) / ghost(바탕 없음)
 *  - size: xs 28 · sm 36 · md 44 · lg 54 (높이 px)
 * 비활성은 변형과 상관없이 옅은 면과 흐린 글자가 된다. 눌림 축소는 전역 `.pressable`이 맡는다.
 */
export const actionButton = recipe({
  base:
    'pressable inline-flex shrink-0 items-center justify-center gap-1 font-semibold transition-colors ' +
    'disabled:cursor-not-allowed disabled:bg-subtle disabled:text-faint',
  variants: {
    variant: {
      solid: 'bg-ink text-on-ink hover:bg-ink-pressed active:bg-ink-pressed',
      weak: 'bg-subtle text-default hover:bg-muted',
      ghost: 'text-strong hover:bg-subtle',
    },
    size: {
      xs: 'h-7 px-2.5 text-label',
      sm: 'h-9 px-3 text-body',
      md: 'h-11 px-4 text-body-l',
      lg: 'h-13.5 px-5 text-title-s',
    },
    fullWidth: { true: 'w-full', false: '' },
    /** 양끝을 둥글게. 가장 작은 xs는 항상 둥글다. */
    pill: { true: '', false: '' },
  },
  // 모서리는 크기와 pill이 함께 정한다 — 같은 속성의 클래스가 둘 붙지 않도록 조합으로만 준다.
  compoundVariants: [
    { size: 'xs', class: 'rounded-full' },
    { size: 'sm', pill: false, class: 'rounded-r3' },
    { size: 'md', pill: false, class: 'rounded-r4' },
    { size: 'lg', pill: false, class: 'rounded-r5' },
    { size: 'sm', pill: true, class: 'rounded-full' },
    { size: 'md', pill: true, class: 'rounded-full' },
    { size: 'lg', pill: true, class: 'rounded-full' },
  ],
  defaultVariants: { variant: 'solid', size: 'md', fullWidth: false, pill: false },
});

export type ActionButtonVariant = 'solid' | 'weak' | 'ghost';
export type ActionButtonSize = 'xs' | 'sm' | 'md' | 'lg';
