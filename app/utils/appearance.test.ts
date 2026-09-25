import { describe, expect, it } from 'vitest';
import { runInNewContext } from 'node:vm';
import { appearanceBootstrap, normalizeAppearance } from './appearance';

describe('appearance bootstrap', () => {
  it.each(['light', 'dark', 'system'] as const)('restores Refined before paint in %s mode', theme => {
    const root = { dataset: {} as Record<string, string>, classList: { toggle: (name: string, enabled: boolean) => { dark = enabled; } } };
    let dark = false;
    runInNewContext(appearanceBootstrap, { localStorage: { getItem: (key: string) => key === 'themePreference' ? theme : 'refined' },
      document: { documentElement: root }, matchMedia: () => ({ matches: true }) });
    expect(root.dataset.themeCollection).toBe('refined');
    expect(dark).toBe(theme !== 'light');
  });
  it('normalizes unknown or absent settings to the existing collection', () => {
    expect(normalizeAppearance()).toEqual({ theme: 'system', theme_collection: 'vivid' });
    expect(normalizeAppearance({ theme: 'invalid', theme_collection: 'invalid' } as any)).toEqual(normalizeAppearance());
  });
  it.each([false, true])('defaults to Vivid and device dark=%s with no saved choice', deviceDark => {
    const root = { dataset: {} as Record<string, string>, classList: { toggle: (_name: string, enabled: boolean) => { dark = enabled; } } };
    let dark = !deviceDark;
    runInNewContext(appearanceBootstrap, { localStorage: { getItem: () => null },
      document: { documentElement: root }, matchMedia: () => ({ matches: deviceDark }) });
    expect(root.dataset.themeCollection).toBe('vivid');
    expect(dark).toBe(deviceDark);
  });
  it.each([false, true])('follows device dark=%s even when storage is blocked', deviceDark => {
    const root = { dataset: {} as Record<string, string>, classList: { toggle: (_name: string, enabled: boolean) => { dark = enabled; } } };
    let dark = !deviceDark;
    runInNewContext(appearanceBootstrap, { localStorage: { getItem: () => { throw new Error('blocked'); } },
      document: { documentElement: root }, matchMedia: () => ({ matches: deviceDark }) });
    expect(root.dataset.themeCollection).toBe('vivid');
    expect(dark).toBe(deviceDark);
  });
});
