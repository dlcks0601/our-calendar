import { describe, expect, it } from 'vitest';
import { recipe } from './recipe';

const button = recipe({
  base: 'inline-flex items-center',
  variants: {
    variant: { solid: 'bg-ink text-on-ink', weak: 'bg-subtle text-default' },
    size: { sm: 'h-9', lg: 'h-13.5' },
    fullWidth: { true: 'w-full', false: '' },
  },
  compoundVariants: [{ variant: 'solid', size: 'lg', class: 'shadow-s3' }],
  defaultVariants: { variant: 'solid', size: 'sm', fullWidth: false },
});

describe('recipe — 변형 조합표', () => {
  it('아무것도 고르지 않으면 base와 기본 변형이 붙는다', () => {
    expect(button()).toBe('inline-flex items-center bg-ink text-on-ink h-9');
  });

  it('고른 변형의 클래스가 기본값을 대신한다', () => {
    expect(button({ variant: 'weak', size: 'lg' })).toBe('inline-flex items-center bg-subtle text-default h-13.5');
  });

  it('boolean으로 true/false 변형을 고른다', () => {
    expect(button({ fullWidth: true })).toContain('w-full');
    expect(button({ fullWidth: false })).not.toContain('w-full');
  });

  it('compoundVariants는 조건이 전부 맞을 때만 붙는다', () => {
    expect(button({ variant: 'solid', size: 'lg' })).toContain('shadow-s3');
    expect(button({ variant: 'weak', size: 'lg' })).not.toContain('shadow-s3');
    expect(button({ variant: 'solid', size: 'sm' })).not.toContain('shadow-s3');
  });

  it('compoundVariants는 기본 변형으로 정해진 값에도 반응한다', () => {
    expect(button({ size: 'lg' })).toContain('shadow-s3');
  });

  it('className은 맨 뒤에 붙는다', () => {
    expect(button({ className: 'mt-6' }).endsWith(' mt-6')).toBe(true);
  });

  it('빈 문자열, undefined, 겹친 공백이 결과에 섞이지 않는다', () => {
    const out = button({ fullWidth: false, className: undefined });
    expect(out).not.toMatch(/undefined|false| {2}/);
    expect(out).toBe(out.trim());
  });

  it('base가 없어도 동작한다', () => {
    const plain = recipe({ variants: { tone: { ok: 'text-default', warn: 'text-warning' } } });
    expect(plain({ tone: 'warn' })).toBe('text-warning');
    expect(plain()).toBe('');
  });
});
