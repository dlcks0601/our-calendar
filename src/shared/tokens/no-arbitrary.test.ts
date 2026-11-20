import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * 화면 코드에 값이 직접 들어오지 못하게 지키는 검사.
 * 색, 글자 크기, 줄 높이, 자간, 모서리, 그림자는 토큰으로만 쓴다.
 * 배치에 쓰는 임의값(`w-[calc(...)]`, `max-w-[1200px]`, `grid-cols-[...]`)은 대상이 아니다.
 */

const SRC = path.resolve(__dirname, '../..');

/** 검사하지 않는 곳과 그 이유 */
const EXEMPT: { test: (file: string) => boolean; reason: string }[] = [
  { test: (f) => f.includes('/shared/tokens/'), reason: '토큰 명세와 생성물, 이 검사 자신' },
  { test: (f) => f.endsWith('.test.ts'), reason: '테스트' },
  { test: (f) => f.endsWith('/entities/member/ui/Avatar.tsx'), reason: '아바타 일러스트의 피부·머리 색은 그림의 일부' },
];

const FORBIDDEN: { name: string; pattern: RegExp }[] = [
  { name: '직접 쓴 색(#RRGGBB)', pattern: /#[0-9a-fA-F]{6}\b/ },
  { name: '직접 쓴 색(rgb)', pattern: /\brgba?\(/ },
  { name: '임의 글자 크기', pattern: /\btext-\[[\d.]+px\]/ },
  { name: '임의 줄 높이', pattern: /\bleading-\[/ },
  { name: '임의 자간', pattern: /\btracking-\[/ },
  { name: '임의 모서리', pattern: /\brounded(?:-[a-z]{1,2})?-\[[\d.]+px\]/ },
  { name: '임의 그림자', pattern: /\bshadow-\[/ },
  { name: '옛 토큰 클래스', pattern: /(?<![\w-])(?:text-text-|bg-section\b|bg-primary\b|text-primary\b|bg-bg\b|rounded-card\b)/ },
  { name: 'Tailwind 기본 모서리 이름', pattern: /(?<![\w-])rounded(?:-[trblxyse]{1,2})?-(?:xs|sm|md|lg|xl|2xl|3xl)\b/ },
  { name: 'Tailwind 기본 색 이름', pattern: /(?<![\w-])(?:bg|text|border|ring|from|via|to)-(?:white|black)\b/ },
];

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

const files = walk(SRC).filter((file) => !EXEMPT.some((e) => e.test(file)));

describe('화면 코드에 임의값이 없다', () => {
  it('검사 대상이 비어 있지 않다', () => {
    expect(files.length).toBeGreaterThan(30);
  });

  it.each(FORBIDDEN.map((rule) => [rule.name, rule] as const))('%s', (_name, rule) => {
    const hits = files.flatMap((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .flatMap((line, i) => (rule.pattern.test(line) ? [`${path.relative(SRC, file)}:${i + 1}  ${line.trim().slice(0, 100)}`] : [])),
    );
    expect(hits).toEqual([]);
  });
});
