import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  platform: 'web',
  navigatorLanguage: 'en-US',
  hasNavigator: true,
  appleLocale: undefined as string | undefined,
  appleLanguages: undefined as string[] | undefined,
  i18nLocale: undefined as string | undefined,
  settingsThrow: false,
}));

vi.mock('react-native', () => ({
  Platform: {
    get OS() {
      return state.platform;
    },
  },
  NativeModules: {
    SettingsManager: {
      get settings() {
        if (state.settingsThrow) {
          throw new Error('settings unavailable');
        }
        return {
          AppleLocale: state.appleLocale,
          AppleLanguages: state.appleLanguages,
        };
      },
    },
    I18nManager: {
      get localeIdentifier() {
        return state.i18nLocale;
      },
    },
  },
}));

const load = async () => {
  vi.resetModules();

  const g = globalThis as Record<string, unknown>;
  Object.defineProperty(g, 'navigator', {
    value: state.hasNavigator ? { language: state.navigatorLanguage } : undefined,
    configurable: true,
    writable: true,
  });

  return import('@/i18n/messages');
};

describe('i18n - language resolution', () => {
  beforeEach(() => {
    state.platform = 'web';
    state.hasNavigator = true;
    state.navigatorLanguage = 'en-US';
    state.appleLocale = undefined;
    state.appleLanguages = undefined;
    state.i18nLocale = undefined;
    state.settingsThrow = false;
  });

  afterEach(() => {
    delete (globalThis as Record<string, unknown>).navigator;
  });

  it('defaults to English', async () => {
    const messages = await load();

    expect(messages.isFrench).toBe(false);
    expect(messages.messages).toBe(messages.en);
  });

  it('picks French on the web through navigator.language', async () => {
    state.navigatorLanguage = 'fr-BE';
    const messages = await load();

    expect(messages.isFrench).toBe(true);
    expect(messages.messages.common.back).toBe('Retour');
    expect(messages.messages.settings.title).toBe('Réglages');
  });

  it('ignores the region but not the language', async () => {
    state.navigatorLanguage = 'de-DE';
    const messages = await load();

    expect(messages.isFrench).toBe(false);
    expect(messages.messages).toBe(messages.en);
  });

  it('falls back to English when navigator is missing', async () => {
    state.hasNavigator = false;
    const messages = await load();

    expect(messages.isFrench).toBe(false);
    expect(messages.messages).toBe(messages.en);
  });

  it('reads AppleLocale on iOS', async () => {
    state.platform = 'ios';
    state.appleLocale = 'fr_FR';
    const messages = await load();

    expect(messages.isFrench).toBe(true);
    expect(messages.messages.common.back).toBe('Retour');
  });

  it('reads AppleLanguages when AppleLocale is missing on iOS', async () => {
    state.platform = 'ios';
    state.appleLanguages = ['fr-BE'];
    const messages = await load();

    expect(messages.isFrench).toBe(true);
    expect(messages.messages.common.back).toBe('Retour');
  });

  it('falls back to English on iOS without any locale settings', async () => {
    state.platform = 'ios';
    state.appleLanguages = [];
    const messages = await load();

    expect(messages.isFrench).toBe(false);
    expect(messages.messages).toBe(messages.en);
  });

  it('falls back to English when reading the native settings fails', async () => {
    state.platform = 'ios';
    state.settingsThrow = true;
    const messages = await load();

    expect(messages.isFrench).toBe(false);
    expect(messages.messages).toBe(messages.en);
  });

  it('reads localeIdentifier on Android', async () => {
    state.platform = 'android';
    state.i18nLocale = 'fr_FR';
    const messages = await load();

    expect(messages.isFrench).toBe(true);
    expect(messages.messages.common.back).toBe('Retour');
  });

  it('falls back to English on Android without a locale identifier', async () => {
    state.platform = 'android';
    const messages = await load();

    expect(messages.isFrench).toBe(false);
    expect(messages.messages).toBe(messages.en);
  });

  it('keeps detecting French when the navigator is present', async () => {
    state.navigatorLanguage = 'fr';
    const messages = await load();

    expect(messages.isFrench).toBe(true);
  });
});

describe('i18n - en/fr translation parity', () => {
  const loadLocale = async (language: string) => {
    state.platform = 'web';
    state.hasNavigator = true;
    state.navigatorLanguage = language;

    return (await load()).messages;
  };

  it('defines exactly the same keys in both locales', async () => {
    const en = await loadLocale('en-US');
    const fr = await loadLocale('fr-FR');
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
    const en = await loadLocale('en-US');
    const fr = await loadLocale('fr-FR');
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
