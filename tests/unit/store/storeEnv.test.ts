import { afterEach, describe, expect, it } from 'vitest';

describe('store - settings environment variables', () => {
  afterEach(() => {
    delete process.env.EXPO_PUBLIC_UPDATE_INTERVAL;
  });

  it('parses the update interval from the environment', async () => {
    process.env.EXPO_PUBLIC_UPDATE_INTERVAL = '5000';

    const { store } = await import('@/store/store');

    expect(store.getState().settings.updateInterval).toBe(5_000);
  });
});
