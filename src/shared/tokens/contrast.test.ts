import { describe, expect, it } from 'vitest';
import { CONTRAST_PAIRS, contrastRatio } from './spec/contrast';
import { TOKENS } from './spec/index';

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
  const measured = CONTRAST_PAIRS.map((pair) => ({ ...pair, ratio: contrastRatio(pair.fg, pair.bg) }));

  it('글자 역할은 하나도 빠짐없이 대비표에 있다', () => {
    const covered = new Set(CONTRAST_PAIRS.map((p) => p.role));
    expect(Object.keys(TOKENS.fg).filter((role) => !covered.has(role))).toEqual([]);
  });

  it.each(measured.filter((p) => !p.waiver).map((p) => [p.label, p] as const))('%s 는 기준을 지킨다', (_label, pair) => {
    expect(pair.ratio).toBeGreaterThanOrEqual(pair.min);
  });

  it('기준을 지키지 않는 조합은 숨기지 않고 이유와 함께 적는다', () => {
    const waived = measured.filter((p) => p.waiver);
    // 옅은 안내 글자와 비활성 글자는 지금 기준에 못 미친다. 표에서 빠지면 문서 화면에서도 사라진다.
    expect(waived.map((p) => p.role)).toEqual(expect.arrayContaining(['faint', 'disabled']));
    for (const pair of waived) expect(pair.waiver!.reason.length).toBeGreaterThan(10);
  });

  it('면제는 실제로 못 미칠 때만 둔다 — 값을 고쳐 기준을 넘으면 면제를 지운다', () => {
    expect(measured.filter((p) => p.waiver && p.ratio >= p.min).map((p) => p.label)).toEqual([]);
  });

  it('본문 글자의 기준은 4.5:1, 보조 글자의 기준은 3:1이다', () => {
    expect(new Set(CONTRAST_PAIRS.map((p) => p.min))).toEqual(new Set([4.5, 3]));
    expect(CONTRAST_PAIRS.filter((p) => p.role === 'strong' || p.role === 'default').every((p) => p.min === 4.5)).toBe(true);
  });
});
