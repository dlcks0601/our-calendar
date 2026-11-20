import { describe, expect, it } from 'vitest';
import { renderThemeCss } from './render';
import { TOKENS } from './spec/index';

describe('renderThemeCss — 명세를 Tailwind 테마 CSS로', () => {
  const css = renderThemeCss(TOKENS);

  it('@theme 블록 하나로 시작한다', () => {
    expect(css.startsWith('/* 생성물')).toBe(true);
    expect(css.match(/@theme static \{/g)).toHaveLength(1);
  });

  it('역할 색을 유틸리티별 이름공간으로 낸다', () => {
    expect(css).toContain('--background-color-ink: #000000;');
    expect(css).toContain('--text-color-strong: #000000;');
    expect(css).toContain('--border-color-default: #E6E6E6;');
    expect(css).toContain('--ring-color-default: #E6E6E6;');
  });

  it('팔레트를 계열-단계 이름으로 낸다', () => {
    expect(css).toContain('--color-gray-1000: #000000;');
    expect(css).toContain('--color-sky-100: #DDF0FB;');
  });

  it('글자 단계는 크기와 줄 높이를 함께 낸다', () => {
    expect(css).toContain('--text-body: 14px;');
    expect(css).toContain('--text-body--line-height: 1.5;');
    expect(css).toContain('--text-display: 28px;');
  });

  it('모서리와 그림자 단계를 낸다', () => {
    expect(css).toContain('--radius-r5: 16px;');
    expect(css).toContain('--shadow-s1: 0 1px 3px rgb(0 0 0 / 0.06);');
  });

  it('Tailwind 기본 색·모서리·그림자·글자 단계를 지운다 — 명세에 있는 값만 클래스가 된다', () => {
    for (const namespace of ['color', 'radius', 'shadow', 'text', 'leading', 'tracking'])
      expect(css).toContain(`--${namespace}-*: initial;`);
  });

  it('같은 명세에서는 항상 같은 결과가 나온다', () => {
    expect(renderThemeCss(TOKENS)).toBe(css);
  });
});
