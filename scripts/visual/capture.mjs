// 화면을 헤드리스 Chrome으로 캡처한다.
//   node scripts/visual/capture.mjs <이름>   →  .visual/<이름>/<화면>.png
// 대상 서버는 BASE_URL(기본 http://localhost:4318). 개발 서버가 아니라 `next start`로 띄운 빌드를 쓴다.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { SCREENS } from './screens.mjs';

const name = process.argv[2];
if (!name) {
  console.error('사용법: node scripts/visual/capture.mjs <이름>');
  process.exit(1);
}
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4318';
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const outDir = path.resolve('.visual', name);
fs.mkdirSync(outDir, { recursive: true });

/**
 * 모바일 배치는 폭 500으로 찍는다. 헤드리스 Chrome 창은 500px 아래로 줄지 않고,
 * 390px iframe으로 감싸 찍으면 안쪽 화면의 그리기 시점이 매번 달라 대조에 쓸 수 없었다.
 * 배치가 바뀌는 지점은 1024px이라 500px에서도 모바일 배치가 그대로 나온다.
 */
const VIEWPORT = { pc: [1440, 900], mo: [500, 844] };
const SCALE = 2;

function shoot(url, file, width, height) {
  execFileSync(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-prefers-reduced-motion',
      `--force-device-scale-factor=${SCALE}`,
      `--window-size=${width},${height}`,
      '--virtual-time-budget=9000',
      `--screenshot=${file}`,
      url,
    ],
    { stdio: 'ignore' },
  );
}

for (const screen of SCREENS) {
  const [width, height] = VIEWPORT[screen.viewport];
  shoot(BASE_URL + screen.path, path.join(outDir, `${screen.name}.png`), width, height);
  console.log(`captured ${screen.name}`);
}
