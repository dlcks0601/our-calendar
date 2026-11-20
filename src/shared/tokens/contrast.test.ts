import { describe, expect, it } from 'vitest';
import { CONTRAST_PAIRS, contrastRatio } from './spec/contrast';

describe('contrastRatio — WCAG 대비', () => {
  it('검정과 흰색은 21:1이다', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
  });

  it('같은 색은 1:1이고 순서를 바꿔도 같다', () => {
    expect(contrastRatio('#8C8C8C', '#8C8C8C')).toBeCloseTo(1, 5);
    expect(contrastRatio('#136A99', '#DDF0FB')).toBeCloseTo(contrastRatio('#DDF0FB', '#136A99'), 5);
  });
});

describe('명세의 글자·바탕 조합', () => {
  it('검사할 조합이 비어 있지 않다', () => {
    expect(CONTRAST_PAIRS.length).toBeGreaterThan(10);
  });

  it.each(CONTRAST_PAIRS.map((p) => [p.label, p] as const))('%s', (_label, pair) => {
    expect(contrastRatio(pair.fg, pair.bg)).toBeGreaterThanOrEqual(pair.min);
  });
});
