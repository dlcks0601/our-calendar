// 두 캡처를 픽셀 단위로 대조한다.
//   node scripts/visual/compare.mjs <기준> <비교>
// 화면별로 달라진 픽셀 비율을 출력하고, 차이 이미지를 .visual/diff-<기준>-<비교>/ 에 남긴다.
// 통과 여부는 판단하지 않는다. 의도한 변화인지는 사람이 차이 이미지를 보고 정한다.
import fs from 'node:fs';
import path from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const [a, b] = process.argv.slice(2);
if (!a || !b) {
  console.error('사용법: node scripts/visual/compare.mjs <기준> <비교>');
  process.exit(1);
}
const dirA = path.resolve('.visual', a);
const dirB = path.resolve('.visual', b);
const diffDir = path.resolve('.visual', `diff-${a}-${b}`);
fs.mkdirSync(diffDir, { recursive: true });

const rows = [];
for (const file of fs.readdirSync(dirA).filter((f) => f.endsWith('.png')).sort()) {
  const other = path.join(dirB, file);
  if (!fs.existsSync(other)) {
    rows.push([file, '없음']);
    continue;
  }
  const imgA = PNG.sync.read(fs.readFileSync(path.join(dirA, file)));
  const imgB = PNG.sync.read(fs.readFileSync(other));
  if (imgA.width !== imgB.width || imgA.height !== imgB.height) {
    rows.push([file, '크기 다름']);
    continue;
  }
  const diff = new PNG({ width: imgA.width, height: imgA.height });
  const changed = pixelmatch(imgA.data, imgB.data, diff.data, imgA.width, imgA.height, { threshold: 0.1 });
  fs.writeFileSync(path.join(diffDir, file), PNG.sync.write(diff));
  rows.push([file, `${((changed / (imgA.width * imgA.height)) * 100).toFixed(2)}%`]);
}
const width = Math.max(...rows.map(([f]) => f.length));
for (const [file, result] of rows) console.log(`${file.padEnd(width)}  ${result}`);
