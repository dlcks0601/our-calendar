import { describe, expect, it } from 'vitest';
import { iconButton } from './IconButton';

describe('iconButton — 아이콘 버튼 변형', () => {
  it('기본은 40px 원형, 강조 글자색이다', () => {
    const cls = iconButton().split(' ');
    for (const expected of ['h-10', 'w-10', 'rounded-full', 'text-strong']) expect(cls).toContain(expected);
  });

  it('크기는 xs 28 · sm 32 · md 40', () => {
    expect(iconButton({ size: 'xs' }).split(' ')).toEqual(expect.arrayContaining(['h-7', 'w-7']));
    expect(iconButton({ size: 'sm' }).split(' ')).toEqual(expect.arrayContaining(['h-8', 'w-8']));
    expect(iconButton({ size: 'md' }).split(' ')).toEqual(expect.arrayContaining(['h-10', 'w-10']));
  });

  it('색조는 strong · default · muted · faint — 글자색 클래스는 하나만 붙는다', () => {
    for (const tone of ['strong', 'default', 'muted', 'faint'] as const) {
      const colors = iconButton({ tone }).split(' ').filter((c) => /^text-(strong|default|muted|faint)$/.test(c));
      expect(colors).toEqual([`text-${tone}`]);
    }
  });
});
