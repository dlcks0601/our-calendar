// 화면 코드에 디자인 값이 얼마나 흩어져 있는지 센다. README와 문서 화면의 전후 수치는 이 스크립트의 출력이다.
//   node scripts/measure-design-values.mjs <src 폴더> [<src 폴더> ...]
// 폴더를 둘 주면 나란히 놓은 표가 나온다 (이전 트리의 src, 지금의 src).
//
// 세는 규칙: src의 ts·tsx에서 테스트, 토큰 명세(shared/tokens), 디자인 시스템 문서 화면을 뺀 나머지를
// 정규식으로 센다. 클래스 조합은 className 문자열이 글자 그대로 같은 것을 한 종으로 본다.
import fs from 'node:fs';
import path from 'node:path';

const dirs = process.argv.slice(2);
if (dirs.length === 0) {
  console.error('사용법: node scripts/measure-design-values.mjs <src 폴더> [<src 폴더> ...]');
  process.exit(1);
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

/** 정규식의 첫 캡처(없으면 전체)를 세어 { 종 수, 곳 수 }로 */
function tally(pattern, text) {
  const counts = new Map();
  for (const m of text.matchAll(pattern)) {
    const key = m[1] ?? m[0];
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return { kinds: counts.size, places: [...counts.values()].reduce((a, b) => a + b, 0) };
}
const both = ({ kinds, places }) => `${kinds}종, ${places}곳`;

function measure(src) {
  const all = walk(src).map((f) => f.split(path.sep).join('/'));
  const code = all.filter((f) => /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f) && !f.includes('/shared/tokens/') && !f.includes('/pages/design-system/'));
  const read = (files) => files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  const T = read(code.filter((f) => f.endsWith('.tsx')));
  const A = read(code);
  const withoutAvatar = read(code.filter((f) => !f.endsWith('/Avatar.tsx')));

  const classNames = new Set([...T.matchAll(/className=(?:"|\{`)([^"`]*pressable[^"`]*)/g)].map((m) => m[1]));
  const primary = [...classNames].filter((c) => /\bbg-(?:primary|ink)\b/.test(c) && /\btext-(?:white|on-ink)\b/.test(c));
  const springs = tally(/stiffness: (\d+, damping: \d+)/g, A);
  const presets = tally(/SPRING\.(\w+)/g, A);

  const cssFiles = all.filter((f) => f.endsWith('/app/styles/globals.css') || f.endsWith('/shared/tokens/__generated__/theme.css'));
  const themeVars = cssFiles.reduce((n, f) => n + (fs.readFileSync(f, 'utf8').match(/^\s+--[a-z0-9-]+:/gm) ?? []).length, 0);

  const count = (pattern) => (T.match(pattern) ?? []).length;
  return [
    ['글자 크기 임의값', both(tally(/text-\[([0-9.]+)px\]/g, T))],
    ['글자 크기 단계', both(tally(/(?<![\w-])text-(micro|caption-s|caption|label|body-s|body-l|body|title-s|title-l|title|heading-l|heading|display)(?![\w-])/g, T))],
    ['줄 높이 임의값', both(tally(/leading-\[([^\]]+)\]/g, T))],
    ['줄 높이 단계', both(tally(/(?<![\w-])leading-(dense|snug|normal|loose)(?![\w-])/g, T))],
    ['자간 임의값', both(tally(/tracking-\[([^\]]+)\]/g, T))],
    ['모서리 값', both(tally(/(?<![\w-])rounded(?:-(?:tl|tr|bl|br|ss|se|es|ee|t|r|b|l|s|e))?-(\[[^\]]+\]|[a-z0-9]+)(?![\w-])/g, T))],
    ['그림자 임의값', both(tally(/shadow-\[([^\]]+)\]/g, T))],
    ['그림자 단계', both(tally(/(?<![\w-])shadow-(s[1-4])(?![\w-])/g, T))],
    ['코드에 직접 쓴 색(#RRGGBB)', both(tally(/#[0-9A-Fa-f]{6}/g, A.toUpperCase()))],
    ['  그중 아바타 일러스트 밖', both(tally(/#[0-9A-Fa-f]{6}/g, withoutAvatar.toUpperCase()))],
    ['button 요소 (직접 쓴 것)', `${count(/<(?:motion\.)?button\b/g)}곳`],
    ['컴포넌트 사용', `ActionButton ${count(/<ActionButton\b/g)}, IconButton ${count(/<IconButton\b/g)}, SelectRow ${count(/<SelectRow\b/g)}, Badge ${count(/<Badge\b/g)}, Chip ${count(/<Chip\b/g)}`],
    ['누르는 요소의 클래스 조합', `${classNames.size}종`],
    ['  그중 검정 주 버튼', `${primary.length}종`],
    ['스프링 직접 설정', both(springs)],
    ['스프링 프리셋 사용', presets.kinds === 0 ? '없음' : `${presets.kinds}개, ${presets.places}곳`],
    ['테마 CSS 변수', `${themeVars}개`],
  ];
}

const columns = dirs.map(measure);
if (dirs.length === 1) {
  for (const [label, value] of columns[0]) console.log(`${label}: ${value}`);
} else {
  console.log(`| 항목 | ${dirs.join(' | ')} |`);
  console.log(`| --- | ${dirs.map(() => '---').join(' | ')} |`);
  columns[0].forEach(([label], i) => console.log(`| ${label.trim()} | ${columns.map((c) => c[i][1]).join(' | ')} |`));
}
