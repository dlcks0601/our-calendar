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
      xs: 'h-7 rounded-full px-2.5 text-label',
      sm: 'h-9 rounded-r3 px-3 text-body',
      md: 'h-11 rounded-r4 px-4 text-body-l',
      lg: 'h-13.5 rounded-r5 px-5 text-title-s',
    },
    fullWidth: { true: 'w-full', false: '' },
  },
  defaultVariants: { variant: 'solid', size: 'md', fullWidth: false },
});

export type ActionButtonVariant = 'solid' | 'weak' | 'ghost';
export type ActionButtonSize = 'xs' | 'sm' | 'md' | 'lg';
