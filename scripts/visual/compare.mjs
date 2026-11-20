// 두 캡처를 픽셀 단위로 대조한다.
//   node scripts/visual/compare.mjs <기준> <비교>
// 화면별로 달라진 픽셀 비율을 출력하고, 차이 이미지를 .visual/diff-<기준>-<비교>/ 에 남긴다.
//
// 기준은 엄격하게 잡는다. 색 차이 허용치는 0.02(THRESHOLD로 바꿀 수 있다)이고,
// 글자 가장자리처럼 계단 현상을 줄이려고 섞인 픽셀도 차이로 센다(INCLUDE_AA=0이면 뺀다).
// 느슨한 기준(0.1, 가장자리 제외)은 글자 색이 한 단계 바뀐 것도 0%로 내서 쓰지 않는다.
//
// 비율이 몇 %여야 통과인지는 판단하지 않는다. 의도한 변화인지는 사람이 차이 이미지를 보고 정한다.
// 다만 짝이 없거나 크기가 다른 화면이 있으면 대조 자체가 성립하지 않으므로 실패로 끝낸다.
import fs from 'node:fs';
import path from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const [a, b] = process.argv.slice(2);
if (!a || !b) {
  console.error('사용법: node scripts/visual/compare.mjs <기준> <비교>');
  process.exit(1);
}
const THRESHOLD = Number(process.env.THRESHOLD ?? 0.02);
const INCLUDE_AA = process.env.INCLUDE_AA !== '0';
const dirA = path.resolve('.visual', a);
const dirB = path.resolve('.visual', b);
const diffDir = path.resolve('.visual', `diff-${a}-${b}`);
fs.mkdirSync(diffDir, { recursive: true });

const pngs = (dir) => fs.readdirSync(dir).filter((f) => f.endsWith('.png'));
const files = [...new Set([...pngs(dirA), ...pngs(dirB)])].sort();

const rows = [];
let broken = 0;
for (const file of files) {
  const fileA = path.join(dirA, file);
  const fileB = path.join(dirB, file);
  if (!fs.existsSync(fileA) || !fs.existsSync(fileB)) {
    rows.push([file, fs.existsSync(fileA) ? '비교 쪽에 없음' : '기준 쪽에 없음']);
    broken++;
    continue;
  }
  const imgA = PNG.sync.read(fs.readFileSync(fileA));
  const imgB = PNG.sync.read(fs.readFileSync(fileB));
  if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
    rows.push([file, `크기 다름 (${imgA.width}×${imgA.height} / ${imgB.width}×${imgB.height})`]);
    broken++;
    continue;
  }
  const diff = new PNG({ width: imgA.width, height: imgA.height });
  const changed = pixelmatch(imgA.data, imgB.data, diff.data, imgA.width, imgA.height, {
    threshold: THRESHOLD,
    includeAA: INCLUDE_AA,
  });
  fs.writeFileSync(path.join(diffDir, file), PNG.sync.write(diff));
  rows.push([file, `${((changed / (imgA.width * imgA.height)) * 100).toFixed(2)}%`]);
}
const width = Math.max(...rows.map(([f]) => f.length));
console.log(`허용치 ${THRESHOLD}, 가장자리 픽셀 ${INCLUDE_AA ? '포함' : '제외'}`);
for (const [file, result] of rows) console.log(`${file.padEnd(width)}  ${result}`);
if (broken > 0) {
  console.error(`대조할 수 없는 화면 ${broken}개`);
  process.exit(1);
}
