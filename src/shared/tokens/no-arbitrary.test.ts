import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { __unstable__loadDesignSystem } from '@tailwindcss/node';
import { Scanner } from '@tailwindcss/oxide';
import { describe, expect, it } from 'vitest';

/**
 * 화면 코드에 값이 직접 들어오지 못하게 지키는 검사.
 *
 * 클래스는 정규식으로 짐작하지 않고 Tailwind로 실제로 컴파일해 본다. Tailwind 기본값을 지웠기 때문에
 * `text-sm`, `shadow-md` 같은 익숙한 이름은 오류 없이 아무 스타일도 내지 않는다. 그래서
 *   1. 색·글자·모서리·그림자 유틸리티처럼 보이는데 컴파일 결과가 없는 클래스 (죽은 클래스)
 *   2. 임의값으로 토큰이 정하는 속성(색, 글자 크기, 줄 높이, 자간, 굵기, 모서리, 그림자)을 정하는 클래스
 *   3. 무채색 팔레트를 역할 이름 없이 직접 쓰는 클래스
 * 를 잡는다. 배치에 쓰는 임의값(`w-[calc(...)]`, `max-w-[1200px]`, `grid-cols-[...]`)과
 * 투명도 수식어(`bg-ink/[.92]`)는 대상이 아니다.
 * 클래스 밖에서는 직접 쓴 색(`#fff`, `rgb()`, `oklch()` …)과 인라인 스타일의 글자 크기·색 값을 잡는다.
 */

const ROOT = path.resolve(__dirname, '../../..');
const GLOBALS = path.join(ROOT, 'src/app/styles/globals.css');

const designSystem = await __unstable__loadDesignSystem(readFileSync(GLOBALS, 'utf8'), { base: path.dirname(GLOBALS) });
const scanner = new Scanner({});

interface Finding {
  rule: string;
  line: number;
  what: string;
}

// ── 클래스 규칙 ─────────────────────────────────────────────────────────

/** 테마 토큰으로 값이 정해지는 유틸리티의 머리말 */
const THEME_ROOT =
  /^(?:text|bg|border|ring|ring-offset|inset-ring|divide|outline|fill|stroke|decoration|caret|accent|from|via|to|shadow|inset-shadow|drop-shadow|rounded|leading|tracking|font)-/;

/** 토큰이 정하는 CSS 속성. 임의값으로 이 속성을 정하면 안 된다. */
const GOVERNED =
  /(?:^|[\s;{])(?:color|background-color|border(?:-[a-z-]+)?-color|outline-color|text-decoration-color|caret-color|accent-color|fill|stroke|font-size|line-height|letter-spacing|font-weight|border(?:-[a-z-]+)?-radius|--tw-shadow|--tw-inset-shadow|--tw-drop-shadow|--tw-(?:shadow|inset-shadow|drop-shadow|ring|inset-ring|ring-offset)-color|--tw-gradient-(?:from|via|to))\s*:/;

/** `[속성:값]` 꼴로 직접 정하면 안 되는 속성 */
const GOVERNED_PROPERTY = /^\[(?:color|background(?:-color)?|border(?:-[a-z-]+)?-(?:color|radius)|outline-color|fill|stroke|font-size|line-height|letter-spacing|font-weight|box-shadow):/;

/** 허용하는 예외와 그 이유 */
const ALLOWED: Record<string, string> = {
  'rounded-[inherit]': '부모의 모서리를 그대로 따른다. 단계가 아니라 상속이다',
  'to-gray-500': '스캔 화면 진행 막대의 그라디언트 끝색. 이 한 곳에만 쓴다',
};

/** 대괄호와 괄호 밖에 있는 구분자에서만 자른다. */
function splitTop(text: string, separator: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '[' || ch === '(') depth++;
    else if (ch === ']' || ch === ')') depth--;
    else if (ch === separator && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts;
}

/** 후보에서 변형(`hover:`, `lg:`)과 투명도 수식어(`/60`)를 떼고 유틸리티만 남긴다. */
function utilityOf(candidate: string): string {
  const base = splitTop(candidate, ':').at(-1)!.replace(/^!|!$/g, '').replace(/^-/, '');
  return splitTop(base, '/')[0];
}

const cssCache = new Map<string, string | null>();
function compile(candidates: string[]): (string | null)[] {
  const missing = [...new Set(candidates.filter((c) => !cssCache.has(c)))];
  if (missing.length > 0) designSystem.candidatesToCss(missing).forEach((css, i) => cssCache.set(missing[i], css));
  return candidates.map((c) => cssCache.get(c) ?? null);
}

function checkClasses(file: string, content: string): Finding[] {
  // 스캐너가 주는 위치는 바이트가 아니라 글자 순번이다.
  const lineAt = (position: number) => content.slice(0, position).split('\n').length;
  const found = scanner.getCandidatesWithPositions({ content, extension: path.extname(file).slice(1) });
  const compiled = compile(found.map((f) => f.candidate));
  const findings: Finding[] = [];
  found.forEach(({ candidate, position }, i) => {
    const css = compiled[i];
    const utility = utilityOf(candidate);
    if (ALLOWED[utility]) return;
    const arbitrary = /[\])]$/.test(utility);
    const report = (rule: string) => findings.push({ rule, line: lineAt(position), what: candidate });
    if (css == null) {
      if (THEME_ROOT.test(utility) && !arbitrary) report('죽은 클래스 (테마에 없는 이름)');
      return;
    }
    if (arbitrary && (GOVERNED.test(css) || GOVERNED_PROPERTY.test(utility))) report('임의값으로 정한 색·글자·모서리·그림자');
    else if (/-gray-\d+$/.test(utility)) report('무채색 팔레트 직접 사용 (역할 이름으로 쓴다)');
  });
  return findings;
}

// ── 글자 그대로 찾는 규칙 ────────────────────────────────────────────────

const COLOR_LITERAL = '직접 쓴 색';
const TEXT_RULES: { rule: string; pattern: RegExp; css: boolean }[] = [
  { rule: COLOR_LITERAL, pattern: /(?<![\w&])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/, css: true },
  { rule: COLOR_LITERAL, pattern: /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/, css: true },
  {
    rule: COLOR_LITERAL,
    pattern: /\b(?:color|background|backgroundColor|borderColor|outlineColor|fill|stroke)\s*:\s*(['"`])(?!(?:transparent|currentColor|inherit|none)\1)[^'"`$]*\1/,
    css: false,
  },
  { rule: COLOR_LITERAL, pattern: /\b(?:fill|stroke)=(['"])(?!(?:none|currentColor|transparent)\1)[^'"]*\1/, css: false },
  { rule: '인라인 스타일의 글자 크기', pattern: /\bfontSize\s*:\s*['"`]?\d/, css: false },
];

function checkText(file: string, content: string): Finding[] {
  const isCss = file.endsWith('.css');
  return content.split('\n').flatMap((line, i) =>
    TEXT_RULES.filter((r) => (!isCss || r.css) && r.pattern.test(line)).map((r) => ({
      rule: r.rule,
      line: i + 1,
      what: line.trim().slice(0, 90),
    })),
  );
}

// ── 대상과 예외 ─────────────────────────────────────────────────────────

/** 검사하지 않는 곳과 그 이유. `only`가 있으면 그 규칙만 뺀다. */
const EXEMPT: { test: (file: string) => boolean; only?: string; reason: string }[] = [
  { test: (f) => f.includes('/shared/tokens/'), reason: '토큰 명세와 생성물. 값이 있어야 하는 유일한 곳이다' },
  { test: (f) => /\.test\.tsx?$/.test(f), reason: '테스트. 규칙을 시험하려고 일부러 어긴 값을 적는다' },
  { test: (f) => f.endsWith('/entities/member/ui/Avatar.tsx'), only: COLOR_LITERAL, reason: '아바타 일러스트의 피부·머리 색은 그림의 일부' },
  { test: (f) => f.endsWith('/app/apple-icon.tsx'), only: COLOR_LITERAL, reason: '이미지로 그려지는 아이콘은 CSS 변수를 읽지 못한다' },
];

function check(file: string, content: string): Finding[] {
  const exempt = EXEMPT.filter((e) => e.test(file));
  if (exempt.some((e) => !e.only)) return [];
  const findings = file.endsWith('.css') ? checkText(file, content) : [...checkClasses(file, content), ...checkText(file, content)];
  return findings.filter((f) => !exempt.some((e) => e.only === f.rule));
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(ts|tsx|css)$/.test(entry.name) ? [full] : [];
  });
}

const files = [...walk(path.join(ROOT, 'src')), ...walk(path.join(ROOT, 'app'))];
const rulesOf = (snippet: string) => [...new Set(check('probe.tsx', snippet).map((f) => f.rule))];

describe('검사 규칙이 실제로 잡는다', () => {
  it.each([
    ['text-sm', '죽은 클래스 (테마에 없는 이름)'],
    ['shadow-md', '죽은 클래스 (테마에 없는 이름)'],
    ['leading-tight', '죽은 클래스 (테마에 없는 이름)'],
    ['tracking-wide', '죽은 클래스 (테마에 없는 이름)'],
    ['bg-slate-100', '죽은 클래스 (테마에 없는 이름)'],
    ['bg-white', '죽은 클래스 (테마에 없는 이름)'],
    ['fill-white', '죽은 클래스 (테마에 없는 이름)'],
    ['rounded-4xl', '죽은 클래스 (테마에 없는 이름)'],
    ['hover:lg:text-primary', '죽은 클래스 (테마에 없는 이름)'],
    ['bg-[#fff]', '임의값으로 정한 색·글자·모서리·그림자'],
    ['text-[#00000080]', '임의값으로 정한 색·글자·모서리·그림자'],
    ['bg-[hsl(0_0%_50%)]', '임의값으로 정한 색·글자·모서리·그림자'],
    ['bg-[oklch(0.5_0.1_20)]', '임의값으로 정한 색·글자·모서리·그림자'],
    ['text-[1rem]', '임의값으로 정한 색·글자·모서리·그림자'],
    ['text-[13px]', '임의값으로 정한 색·글자·모서리·그림자'],
    ['rounded-[1rem]', '임의값으로 정한 색·글자·모서리·그림자'],
    ['leading-[1.2]', '임의값으로 정한 색·글자·모서리·그림자'],
    ['tracking-[-0.01em]', '임의값으로 정한 색·글자·모서리·그림자'],
    ['font-[550]', '임의값으로 정한 색·글자·모서리·그림자'],
    ['shadow-[0_1px_2px_black]', '임의값으로 정한 색·글자·모서리·그림자'],
    ['from-[#fff]', '임의값으로 정한 색·글자·모서리·그림자'],
    ['[color:red]', '임의값으로 정한 색·글자·모서리·그림자'],
    ['bg-(--color-sky-500)', '임의값으로 정한 색·글자·모서리·그림자'],
    ['bg-gray-100', '무채색 팔레트 직접 사용 (역할 이름으로 쓴다)'],
    ['hover:ring-gray-0/60', '무채색 팔레트 직접 사용 (역할 이름으로 쓴다)'],
  ])('클래스 %s → %s', (className, rule) => {
    expect(rulesOf(`<p className="${className}" />`)).toContain(rule);
  });

  it.each([
    ["const dot = '#fff';", COLOR_LITERAL],
    ["const dot = '#00000080';", COLOR_LITERAL],
    ["const dot = 'hsl(0 0% 50%)';", COLOR_LITERAL],
    ["const dot = 'oklch(0.5 0.1 20)';", COLOR_LITERAL],
    ["const dot = 'rgba(0, 0, 0, 0.6)';", COLOR_LITERAL],
    ["<p style={{ color: 'red' }} />", COLOR_LITERAL],
    ['<p style={{ backgroundColor: "tomato" }} />', COLOR_LITERAL],
    ['<path fill="tomato" />', COLOR_LITERAL],
    ['<p style={{ fontSize: 13 }} />', '인라인 스타일의 글자 크기'],
    ["<p style={{ fontSize: '13px' }} />", '인라인 스타일의 글자 크기'],
  ])('%s → %s', (snippet, rule) => {
    expect(rulesOf(snippet)).toContain(rule);
  });

  it.each([
    'text-strong',
    'hover:bg-subtle/60',
    'bg-ink/[.92]',
    'ring-page',
    'from-page',
    'via-page/85',
    'w-[calc(100%-2rem)]',
    'max-w-[1200px]',
    'h-[22px]',
    'grid-cols-[72px_1fr]',
    'z-[65]',
    'border-[1.5px]',
    'backdrop-blur-[6px]',
    'after:rounded-[inherit]',
    '[mask-image:linear-gradient(black,transparent)]',
    'bg-sky-100',
    'text-coral-800',
  ])('클래스 %s 는 허용한다', (className) => {
    expect(check('probe.tsx', `<p className="${className}" />`)).toEqual([]);
  });

  it.each([
    '<p style={{ fontSize: step.size, lineHeight: step.lineHeight }} />',
    '<p style={{ color: KIND_COLOR[kind].fg, backgroundColor: `${item.color}59` }} />',
    '<path fill="none" stroke="currentColor" />',
    "const halo = 'color-mix(in srgb, var(--color-gray-1000) 17%, transparent)';",
    'const href = `#${id}`;',
  ])('%s 는 허용한다', (snippet) => {
    expect(check('probe.tsx', snippet)).toEqual([]);
  });

  it('CSS 파일에서는 직접 쓴 색만 본다', () => {
    expect(check('probe.css', '.a { outline: 2px solid rgba(0, 0, 0, 0.6); }').map((f) => f.rule)).toEqual([COLOR_LITERAL]);
    expect(check('probe.css', '.a { color: #6b6b6b; }').map((f) => f.rule)).toEqual([COLOR_LITERAL]);
    expect(check('probe.css', '.a { color: var(--color-gray-600); font-size: 13px; }')).toEqual([]);
  });

  it('찾은 줄 번호를 알려 준다 (한글이 섞여 있어도)', () => {
    expect(check('probe.tsx', '// 첫 줄은 한글 주석\n// 둘째 줄도 한글\n\n<p className="text-sm" />')).toEqual([
      { rule: '죽은 클래스 (테마에 없는 이름)', line: 4, what: 'text-sm' },
    ]);
  });

  it('예외는 이유가 있는 것만 둔다', () => {
    for (const reason of [...Object.values(ALLOWED), ...EXEMPT.map((e) => e.reason)]) expect(reason.length).toBeGreaterThan(5);
  });
});

describe('화면 코드에 임의값이 없다', () => {
  const targets = files.filter((file) => !EXEMPT.some((e) => !e.only && e.test(file)));

  it('검사 대상에 src와 app, CSS가 들어 있다', () => {
    expect(targets.length).toBeGreaterThan(40);
    expect(targets.some((f) => f.startsWith(path.join(ROOT, 'app') + path.sep))).toBe(true);
    expect(targets.some((f) => f.endsWith('globals.css'))).toBe(true);
  });

  it('죽은 클래스, 임의값, 직접 쓴 색, 무채색 팔레트 직접 사용이 없다', () => {
    const hits = targets.flatMap((file) =>
      check(file, readFileSync(file, 'utf8')).map((f) => `${path.relative(ROOT, file)}:${f.line}  [${f.rule}]  ${f.what}`),
    );
    expect(hits).toEqual([]);
  });
});
