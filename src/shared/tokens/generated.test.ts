import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderThemeCss } from './render';
import { TOKENS } from './spec/index';

describe('생성물은 명세와 같아야 한다', () => {
  it('__generated__/theme.css가 지금 명세로 만든 결과와 같다 (다르면 npm run tokens:generate)', () => {
    const file = readFileSync(path.join(__dirname, '__generated__/theme.css'), 'utf8');
    expect(file).toBe(renderThemeCss(TOKENS));
  });
});
