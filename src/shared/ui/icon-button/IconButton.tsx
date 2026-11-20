import type { ButtonHTMLAttributes } from 'react';
import { recipe } from '@/shared/lib/recipe';

/** 아이콘 버튼 변형 — 원형, 바탕 없음. xs 28 · sm 32 · md 40 (px). */
export const iconButton = recipe({
  base:
    'pressable inline-flex shrink-0 items-center justify-center rounded-full transition-colors ' +
    'hover:bg-subtle disabled:cursor-not-allowed disabled:text-disabled',
  variants: {
    size: { xs: 'h-7 w-7', sm: 'h-8 w-8', md: 'h-10 w-10' },
    tone: { strong: 'text-strong', default: 'text-default', muted: 'text-muted', faint: 'text-faint' },
  },
  defaultVariants: { size: 'md', tone: 'strong' },
});

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  /** 글자가 없으므로 이름은 반드시 준다. */
  'aria-label': string;
  size?: 'xs' | 'sm' | 'md';
  tone?: 'strong' | 'default' | 'muted' | 'faint';
}

/** 아이콘만 있는 버튼(뒤로, 닫기, 빼기). */
export default function IconButton({ size, tone, className, type = 'button', ...rest }: IconButtonProps) {
  return <button type={type} className={iconButton({ size, tone, className })} {...rest} />;
}
