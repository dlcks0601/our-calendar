import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { SPRING } from './spec/motion';

const SRC = path.resolve(__dirname, '../..');
const source = (file: string) => readFileSync(path.join(SRC, file), 'utf8');

/** 감쇠비(질량 1). 1이면 넘치지 않고 멈추고, 작을수록 목표를 지나쳤다가 돌아온다. */
const dampingRatio = ({ stiffness, damping }: { stiffness: number; damping: number }) => damping / (2 * Math.sqrt(stiffness));

describe('스프링 프리셋', () => {
  it('프리셋은 넷이다 — 자리 이동, 튀어나옴, 팝오버, 바닥 시트', () => {
    expect(Object.keys(SPRING).sort()).toEqual(['pop', 'popover', 'position', 'sheet']);
  });

  it('바닥에 붙는 시트는 넘치지 않는다 (감쇠비 0.9 이상)', () => {
    // 시트가 목표를 지나치면 화면 바닥과 시트 사이가 벌어져 뒤 배경이 비친다.
    expect(dampingRatio(SPRING.sheet)).toBeGreaterThanOrEqual(0.9);
  });

  it('튀어나오는 것만 눈에 띄게 넘친다', () => {
    expect(dampingRatio(SPRING.pop)).toBeLessThan(0.5);
    expect(dampingRatio(SPRING.position)).toBeGreaterThan(0.7);
    expect(dampingRatio(SPRING.popover)).toBeGreaterThan(0.7);
  });
});

describe('바닥에서 올라오는 패널은 시트 프리셋을 쓴다', () => {
  it('MobileSheet의 세로 이동', () => {
    expect(source('shared/ui/mobile-sheet/MobileSheet.tsx')).toMatch(/\by: SPRING\.sheet\b/);
  });

  it('AttendeePicker의 모바일 패널', () => {
    expect(source('pages/setup/ui/AttendeePicker.tsx')).toMatch(/initial: \{ y: '100%' \},[\s\S]{0,120}transition: SPRING\.sheet\b/);
  });
});
