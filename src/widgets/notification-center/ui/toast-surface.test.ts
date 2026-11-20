import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { contrastRatio, resolveColor, TOKENS } from '@/shared/tokens';

const source = readFileSync(path.join(__dirname, 'ToastStack.tsx'), 'utf8');

describe('피드백 토스트의 면', () => {
  it('바탕은 검정보다 한 단계 옅은 면이고 체크 원판은 검정이다 — 둘이 같으면 원판이 사라진다', () => {
    const toast = source.match(/<div className="([^"]*backdrop-blur[^"]*)">\s*<span aria-hidden className="([^"]*)"/);
    expect(toast).not.toBeNull();
    const [, surface, disc] = toast!;
    expect(surface).toMatch(/(?<![\w-])bg-ink-soft\//);
    expect(disc).toMatch(/(?<![\w-])bg-ink(?![\w-])/);
  });

  it('두 면의 색 값이 실제로 구분된다', () => {
    expect(contrastRatio(resolveColor(TOKENS.bg['ink-soft']), resolveColor(TOKENS.bg.ink))).toBeGreaterThan(1.3);
  });
});
