import type { ReactNode } from 'react';
import { recipe } from '@/shared/lib/recipe';

/**
 * 상태 배지 — 추천(rec) / 일부 아쉬움(ok) / 주의(warn) / 부분 참석(info).
 * 항상 글자를 함께 쓴다(색만으로 상태를 말하지 않는다). 누를 수 없다 — 눌러야 하면 Chip을 쓴다.
 */
export type BadgeTone = 'rec' | 'ok' | 'warn' | 'info';

/** tone → 클래스. 테스트가 계약을 지킨다. */
export const BADGE_TONE_CLASS: Record<BadgeTone, string> = {
  rec: 'bg-muted text-strong',
  ok: 'bg-subtle text-default',
  warn: 'bg-warning-weak text-warning',
  info: 'bg-sky-100 text-sky-800',
};

/** sm = 목록 행 제목 옆의 작은 배지, md = 단독으로 놓이는 배지 */
export const badge = recipe({
  base: 'inline-flex shrink-0 items-center',
  variants: {
    tone: BADGE_TONE_CLASS,
    size: {
      sm: 'rounded-r2 px-2 py-1 text-caption font-bold',
      md: 'h-5.5 rounded-r1 px-1.5 text-label font-semibold',
    },
  },
  defaultVariants: { size: 'md' },
});

export interface BadgeProps {
  tone: BadgeTone;
  size?: 'sm' | 'md';
  children: ReactNode;
}

export default function Badge({ tone, size, children }: BadgeProps) {
  return <span className={badge({ tone, size })}>{children}</span>;
}
