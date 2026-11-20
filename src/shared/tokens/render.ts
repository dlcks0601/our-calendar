import { resolve } from './spec/color.ts';
import type { TokenSpec } from './spec/index.ts';

const HEADER = `/* 생성물 — 직접 고치지 않는다. 명세(src/shared/tokens/spec)를 고친 뒤 \`npm run tokens:generate\`. */`;

/**
 * 명세를 Tailwind 4 테마 CSS로 바꾼다. 순수 함수 — 같은 명세에는 항상 같은 문자열.
 * 역할 색은 유틸리티별 이름공간(--text-color-*, --background-color-* …)으로 내서
 * 클래스가 `text-strong`, `bg-ink`, `border-default`처럼 역할 이름 그대로 읽힌다.
 * `static`으로 내서 유틸리티로 쓰이지 않는 변수도 항상 CSS 변수로 남는다(인라인 스타일과 문서 화면이 읽는다).
 */
export function renderThemeCss(spec: TokenSpec): string {
  const lines: string[] = [];
  const section = (title: string) => lines.push('', `  /* ${title} */`);
  const put = (name: string, value: string | number) => lines.push(`  --${name}: ${value};`);

  section('팔레트');
  for (const [family, steps] of Object.entries(spec.palette))
    for (const [step, value] of Object.entries(steps)) put(`color-${family}-${step}`, value);

  section('글자 색');
  for (const [name, ref] of Object.entries(spec.fg)) put(`text-color-${name}`, resolve(ref));

  section('바탕 색');
  for (const [name, ref] of Object.entries(spec.bg)) put(`background-color-${name}`, resolve(ref));

  section('선 색');
  for (const namespace of ['border-color', 'ring-color', 'divide-color'])
    for (const [name, ref] of Object.entries(spec.stroke)) put(`${namespace}-${name}`, resolve(ref));

  section('글꼴과 굵기');
  for (const [name, value] of Object.entries(spec.font)) put(`font-${name}`, value);
  for (const [name, value] of Object.entries(spec.weight)) put(`font-weight-${name}`, value);

  section('글자 단계 (크기와 줄 높이)');
  for (const [name, step] of Object.entries(spec.text)) {
    put(`text-${name}`, `${step.size}px`);
    put(`text-${name}--line-height`, step.lineHeight);
  }

  section('줄 높이와 자간');
  for (const [name, value] of Object.entries(spec.leading)) put(`leading-${name}`, value);
  for (const [name, value] of Object.entries(spec.tracking)) put(`tracking-${name}`, value);

  section('모서리와 그림자');
  for (const [name, value] of Object.entries(spec.radius)) put(`radius-${name}`, `${value}px`);
  for (const [name, value] of Object.entries(spec.shadow)) put(`shadow-${name}`, value);

  const easing = Object.entries(spec.easing).map(([name, value]) => `  --bezier-${name}: ${value};`);

  return [HEADER, '@theme static {' + lines.join('\n'), '}', '', '/* 가속 곡선 */', ':root {', ...easing, '}', ''].join('\n');
}
