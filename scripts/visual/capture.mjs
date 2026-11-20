// 화면을 헤드리스 Chrome으로 캡처한다. Chrome 하나를 띄워 DevTools 프로토콜로 조종한다.
//   node scripts/visual/capture.mjs <이름>   →  .visual/<이름>/<화면>.png
// 대상 서버는 BASE_URL(기본 http://localhost:4318). 개발 서버가 아니라 `next start`로 띄운 빌드를 쓴다.
// Chrome 위치는 CHROME_PATH로 바꿀 수 있다(기본값은 macOS). Node 22 이상(내장 WebSocket)이 필요하다.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { SCREENS } from './screens.mjs';

const name = process.argv[2];
if (!name) {
  console.error('사용법: node scripts/visual/capture.mjs <이름>');
  process.exit(1);
}
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4318';
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
/** 글꼴까지 그려진 뒤 화면이 가라앉기를 기다리는 시간 */
const SETTLE_MS = Number(process.env.SETTLE_MS ?? 1500);
const outDir = path.resolve('.visual', name);
fs.mkdirSync(outDir, { recursive: true });

/**
 * 모바일은 기기 흉내(390×844, 터치 기기)로 찍는다. 헤드리스 창은 500px 아래로 줄지 않아서,
 * 창 크기가 아니라 프로토콜의 기기 설정으로 폭을 정한다. 둘 다 2배 밀도, 첫 화면(뷰포트)만 찍는다.
 */
const VIEWPORT = {
  pc: { width: 1440, height: 900, mobile: false },
  mo: { width: 390, height: 844, mobile: true },
};
const SCALE = 2;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'our-calendar-visual-'));
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
);

/** Chrome이 완전히 꺼진 뒤에 임시 프로필을 지운다. 꺼지는 중에 지우면 파일이 다시 생겨 실패한다. */
async function cleanup() {
  const exited = new Promise((resolve) => chrome.once('exit', resolve));
  chrome.kill();
  await exited;
  fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}

try {
  // Chrome이 고른 디버깅 포트를 프로필 폴더에서 읽는다.
  let port;
  for (let i = 0; i < 100 && !port; i++) {
    await sleep(100);
    try {
      port = fs.readFileSync(path.join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0];
    } catch {
      // 아직 뜨는 중
    }
  }
  if (!port) throw new Error('Chrome 디버깅 포트를 찾지 못했다');

  const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let nextId = 0;
  const pending = new Map();
  const waiters = new Map();
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(`${message.error.message}`));
      else resolve(message.result);
    } else if (message.method && waiters.has(message.method)) {
      waiters.get(message.method)();
      waiters.delete(message.method);
    }
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  const once = (method) => new Promise((resolve) => waiters.set(method, resolve));

  await send('Page.enable');
  await send('Runtime.enable');
  // 움직임을 줄여 달라는 설정 — 등장 애니메이션 없이 최종 상태를 찍는다.
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });

  for (const screen of SCREENS) {
    const { width, height, mobile } = VIEWPORT[screen.viewport];
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: SCALE, mobile });
    const loaded = once('Page.loadEventFired');
    await send('Page.navigate', { url: BASE_URL + screen.path });
    await loaded;
    await send('Runtime.evaluate', { expression: 'document.fonts.ready.then(() => true)', awaitPromise: true });
    await sleep(SETTLE_MS);
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(outDir, `${screen.name}.png`), Buffer.from(shot.data, 'base64'));
    console.log(`captured ${screen.name}`);
  }
  ws.close();
} finally {
  await cleanup();
}
