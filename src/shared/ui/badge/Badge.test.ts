import { describe, expect, it } from 'vitest';
import { BADGE_TONE_CLASS, badge, type BadgeTone } from './Badge';

describe('BADGE_TONE_CLASS', () => {
  it('rec = 회색 면 + 강조 글자', () => {
    expect(BADGE_TONE_CLASS.rec).toBe('bg-muted text-strong');
  });

  it('ok = 옅은 면 + 본문 글자', () => {
    expect(BADGE_TONE_CLASS.ok).toBe('bg-subtle text-default');
  });

  it('warn = 경고 바탕 + 경고 글자', () => {
    expect(BADGE_TONE_CLASS.warn).toBe('bg-warning-weak text-warning');
  });

  it('info = 하늘 바탕 + 하늘 글자 (부분 참석)', () => {
    expect(BADGE_TONE_CLASS.info).toBe('bg-sky-100 text-sky-800');
  });

  it('모든 톤에 클래스가 있다', () => {
    const tones: BadgeTone[] = ['rec', 'ok', 'warn', 'info'];
    for (const tone of tones) expect(BADGE_TONE_CLASS[tone]).toBeTruthy();
  });

  it('크기는 sm(행 안의 작은 배지)과 md 두 가지다', () => {
    expect(badge({ tone: 'rec', size: 'sm' })).toContain('text-caption');
    expect(badge({ tone: 'rec', size: 'md' })).toContain('text-label');
    expect(badge({ tone: 'warn' })).toContain('text-label');
  });
});
