'use client';

import type { ReactNode } from 'react';
import { recipe } from '@/shared/lib/recipe';

/**
 * 선택형 칩 변형 — 기한(이번 주/다음 주/여유)·길이(30분/1시간…) 선택에 쓴다.
 * 선택 시 검정 면 + 흰 글자, 평시 옅은 회색 + 본문색.
 * tinted는 종류색 칩: 선택 색을 검정 대신 일정 종류 색으로 준다(색 값은 인라인 스타일).
 */
export const chip = recipe({
  base: 'pressable inline-flex h-9 items-center rounded-full px-4 text-body transition-colors',
  variants: {
    selected: { true: 'font-semibold', false: 'bg-subtle font-medium text-default hover:bg-muted' },
    tinted: { true: '', false: '' },
  },
  compoundVariants: [{ selected: true, tinted: false, class: 'bg-ink text-on-ink' }],
  defaultVariants: { selected: false, tinted: false },
});

export interface ChipProps {
  selected?: boolean;
  onClick?: () => void;
  /** 선택 시 색 오버라이드 — 종류색 칩용(bg + 글자색). */
  tint?: { bg: string; text: string };
  children: ReactNode;
}

export default function Chip({ selected = false, onClick, tint, children }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      style={selected && tint ? { backgroundColor: tint.bg, color: tint.text } : undefined}
      className={chip({ selected, tinted: !!tint })}
    >
      {children}
    </button>
  );
}
