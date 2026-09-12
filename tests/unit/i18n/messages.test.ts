import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  localeCode: 'en',
  platform: 'web',
}));

vi.mock('expo-localization', () => ({
  getLocales: () => {
    if (state.platform === 'ios') {
      return [{ languageCode: state.localeCode }];
    }

    if (state.platform === 'android') {
      return [{ languageCode: state.localeCode }];
    }

    if (state.platform === 'web') {
      return [{ languageCode: state.localeCode }];
    }

    return [];
  },
}));

const load = async () => {
  vi.resetModules();
  return import('@/i18n/messages');
};

describe('i18n - language resolution', () => {
  beforeEach(() => {
    state.platform = 'web';
    state.localeCode = 'en';
  });

  it('defaults to English', async () => {
    const messages = await load();

    expect(messages.isFrench).toBe(false);
    expect(messages.messages).toBe(messages.en);
  });

  it('picks French on the web through locale code', async () => {
    state.localeCode = 'fr';
    const messages = await load();

    expect(messages.isFrench).toBe(true);
    expect(messages.messages.common.back).toBe('Retour');
    expect(messages.messages.settings.title).toBe('Réglages');
  });

  it('ignores the region but not the language', async () => {
    state.localeCode = 'de';
    const messages = await load();

    expect(messages.isFrench).toBe(false);
    expect(messages.messages).toBe(messages.en);
  });

  it('keeps detecting French when the locale is fr', async () => {
    state.localeCode = 'fr';
    const messages = await load();

    expect(messages.isFrench).toBe(true);
  });
});

describe('i18n - en/fr translation parity', () => {
  const loadLocale = async (language: string) => {
    state.platform = 'web';
    state.localeCode = language;

    return (await load()).messages;
  };

  it('defines exactly the same keys in both locales', async () => {
    const en = await loadLocale('en');
    const fr = await loadLocale('fr');

    const leaves = (obj: Record<string, unknown>, prefix = ''): string[] =>
        Object.entries(obj).flatMap(([key, value]) => {
          const path = prefix ? `${prefix}.${key}` : key;

          return value && typeof value === 'object'
              ? leaves(value as Record<string, unknown>, path)
              : [path];
        });

    expect(leaves(fr).sort()).toEqual(leaves(en).sort());
  });

  it('keeps every translation value non-empty', async () => {
    const en = await loadLocale('en');
    const fr = await loadLocale('fr');

    const collect = (obj: Record<string, unknown>): unknown[] =>
        Object.values(obj).flatMap((value) =>
            value && typeof value === 'object'
                ? collect(value as Record<string, unknown>)
                : [value],
        );

    for (const value of [...collect(en), ...collect(fr)]) {
      expect(String(value).trim().length).toBeGreaterThan(0);
    }
  });
});

describe('i18n - formatMessage', () => {
  it('replaces {name} placeholders', async () => {
    const { formatMessage } = await import('@/i18n/messages');

    expect(formatMessage('Car #{car} live', { car: 12 })).toBe('Car #12 live');
    expect(formatMessage('{count} devices found', { count: 3 })).toBe('3 devices found');
  });

  it('replaces every occurrence of the same placeholder', async () => {
    const { formatMessage } = await import('@/i18n/messages');

    expect(formatMessage('{a}-{a}-{a}', { a: 'x' })).toBe('x-x-x');
  });

  it('leaves unknown placeholders untouched', async () => {
    const { formatMessage } = await import('@/i18n/messages');

    expect(formatMessage('Hello {firstName} #{car}', { car: 5 })).toBe(
        'Hello {firstName} #5',
    );
  });

  it('handles empty values without crashing', async () => {
    const { formatMessage } = await import('@/i18n/messages');

    expect(formatMessage('#{car}', { car: '' })).toBe('#');
    expect(formatMessage('text {x}', undefined)).toBe('text {x}');
  });
});