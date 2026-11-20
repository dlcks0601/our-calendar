import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { actionButton } from './action-button.recipe';

describe('actionButton — 버튼 변형 조합표', () => {
  it('기본값은 검정 면(solid), 중간 크기(md)다', () => {
    const cls = actionButton();
    expect(cls).toContain('bg-ink');
    expect(cls).toContain('text-on-ink');
    expect(cls).toContain('h-11');
    expect(cls).not.toContain('w-full');
  });

  it('solid · lg는 가장 큰 주 버튼이다', () => {
    const cls = actionButton({ variant: 'solid', size: 'lg' });
    for (const expected of ['bg-ink', 'text-on-ink', 'h-13.5', 'rounded-r5', 'text-title-s']) expect(cls).toContain(expected);
  });

  it('weak는 옅은 회색 면, ghost는 바탕이 없다', () => {
    expect(actionButton({ variant: 'weak' })).toContain('bg-subtle');
    const ghost = actionButton({ variant: 'ghost' });
    expect(ghost).toContain('text-strong');
    expect(ghost).not.toMatch(/(^| )bg-(ink|subtle)( |$)/);
  });

  it('크기마다 높이, 글자 단계, 모서리가 정해져 있다', () => {
    expect(actionButton({ size: 'xs' })).toMatch(/h-7 .*rounded-full .*text-label/);
    expect(actionButton({ size: 'sm' })).toMatch(/h-9 .*rounded-r3 .*text-body/);
    expect(actionButton({ size: 'md' })).toMatch(/h-11 .*rounded-r4 .*text-body-l/);
  });

  it('fullWidth면 가로를 채운다', () => {
    expect(actionButton({ fullWidth: true })).toContain('w-full');
  });

  it('비활성일 때는 어떤 변형이든 옅은 면과 흐린 글자가 된다', () => {
    for (const variant of ['solid', 'weak', 'ghost'] as const) {
      const cls = actionButton({ variant });
      expect(cls).toContain('disabled:bg-subtle');
      expect(cls).toContain('disabled:text-faint');
      expect(cls).toContain('disabled:cursor-not-allowed');
    }
  });

  it('비활성 버튼은 눌려도 줄어들지 않는다 (눌림 축소는 전역 .pressable 규칙이 맡는다)', () => {
    const css = readFileSync(path.resolve(__dirname, '../../../app/styles/globals.css'), 'utf8');
    expect(css).toContain('.pressable:not(:disabled):active');
    expect(css).not.toMatch(/\.pressable:active\s*\{/);
  });
});
