// 대조할 화면 목록. 참석자와 조건이 주소에 담겨 있어 같은 장면을 그대로 다시 연다.
// 홈의 달력과 확정 화면의 날짜는 오늘을 기준으로 그려진다. 기준과 비교는 같은 날에 찍어야 대조가 성립한다.

/** 다음 주 수요일 09:00 슬롯 — 확정 화면을 열 때 고른 시간으로 쓴다. */
function nextWednesdaySlot() {
  const now = new Date(Date.now() + 9 * 3600_000); // KST
  const mondayOffset = (now.getUTCDay() + 6) % 7;
  const wed = new Date(now.getTime() + (7 - mondayOffset + 2) * 86_400_000);
  return `${wed.toISOString().slice(0, 10)}T540`;
}

const THREE = 'p=ichan.r,junho.o,seoyeon.r&d=60&dl=nw';
const SIX_REQUIRED = 'p=ichan.r,junho.r,seoyeon.r,sehun.r,jiwoo.r,daon.r&d=60';

const PATHS = [
  ['home', '/'],
  ['setup', '/?p=ichan.r,junho.r,seoyeon.r,minsu.r,haneul.o,sehun.o&d=60&dl=nw&s=setup'],
  ['find', `/?${THREE}&s=find`],
  ['find-tradeoff', `/?${SIX_REQUIRED}&dl=nw&s=find`],
  ['find-none', `/?${SIX_REQUIRED}&dl=tw&s=find`],
  ['confirm', `/?${THREE}&s=confirm&slot=${nextWednesdaySlot()}`],
  ['done', `/?${THREE}&s=done&slot=${nextWednesdaySlot()}`],
  ['invite', '/?s=invite'],
  ['notifications', '/?s=notifications'],
];

export const SCREENS = PATHS.flatMap(([name, path]) => [
  { name: `${name}-pc`, path, viewport: 'pc' },
  { name: `${name}-mo`, path, viewport: 'mo' },
]);
