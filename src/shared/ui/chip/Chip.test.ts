import { describe, expect, it } from 'vitest';
import { chip } from './Chip';

describe('chip — 선택형 칩', () => {
  it('선택되면 검정 면에 흰 글자다', () => {
    const cls = chip({ selected: true });
    expect(cls).toContain('bg-ink');
    expect(cls).toContain('text-on-ink');
  });

  it('선택되지 않으면 옅은 면에 본문 글자다', () => {
    const cls = chip({ selected: false });
    expect(cls).toContain('bg-subtle');
    expect(cls).toContain('text-default');
    expect(cls).not.toContain('bg-ink');
  });

  it('종류색 칩(tinted)은 선택돼도 검정 면을 쓰지 않는다 — 색은 인라인으로 준다', () => {
    const cls = chip({ selected: true, tinted: true });
    expect(cls).not.toContain('bg-ink');
    expect(cls).not.toContain('text-on-ink');
  });
});
