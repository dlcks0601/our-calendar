import type { ButtonHTMLAttributes } from 'react';
import { recipe } from '@/shared/lib/recipe';

/** 아이콘 버튼 변형 — 원형, 바탕 없음. sm 32 · md 40 (px). */
export const iconButton = recipe({
  base:
    'pressable inline-flex shrink-0 items-center justify-center rounded-full transition-colors ' +
    'hover:bg-subtle disabled:cursor-not-allowed disabled:text-disabled',
  variants: {
    size: { sm: 'h-8 w-8', md: 'h-10 w-10' },
    tone: { strong: 'text-strong', muted: 'text-muted hover:text-strong' },
  },
  defaultVariants: { size: 'md', tone: 'strong' },
});

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  /** 글자가 없으므로 이름은 반드시 준다. */
  'aria-label': string;
  size?: 'sm' | 'md';
  tone?: 'strong' | 'muted';
}

/** 아이콘만 있는 버튼(뒤로, 닫기, 빼기). */
export default function IconButton({ size, tone, className, type = 'button', ...rest }: IconButtonProps) {
  return <button type={type} className={iconButton({ size, tone, className })} {...rest} />;
}
