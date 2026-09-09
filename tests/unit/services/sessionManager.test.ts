import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import sessionManager from '@/services/sessionManager';

const session = vi.hoisted(() => ({
  platform: 'ios',
  cookies: {} as Record<string, { rt_session?: { value: string } }>,
  setFromResponse: vi.fn(async () => {}),
}));

vi.mock('react-native', () => ({
  Platform: {
    get OS() {
      return session.platform;
    },
  },
}));

vi.mock('react-native-nitro-cookies', () => ({
  default: {
    get: vi.fn(async (origin: string) => session.cookies[origin]),
    setFromResponse: session.setFromResponse,
  },
}));

const API_URL = 'https://api.ris-timing.be/live/v2/';
const ORIGIN = 'https://api.ris-timing.be';

const encodeBase64Url = (input: string): string =>
  Buffer.from(input, 'utf-8')
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/, '');

const makeJwt = (expiresInSeconds: number): string => {
  const payload = { iat: Date.now() / 1000, exp: Date.now() / 1000 + expiresInSeconds };
  return `header.${encodeBase64Url(JSON.stringify(payload))}.signature`;
};

const setCookie = (value: string): string => `rt_session=${value}; Path=/; HttpOnly`;

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  session.platform = 'ios';
  session.cookies = {};
  session.setFromResponse.mockClear();
  session.setFromResponse.mockImplementation(((
    origin: string,
    header: string,
  ) => {
    const match = header.match(/rt_session=([^;]+)/);
    session.cookies[origin] = match
      ? { rt_session: { value: match[1] } }
      : {};
  }) as never);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const respondWithSetCookie = (value: string) =>
  new Response('{}', {
    status: 200,
    headers: { 'set-cookie': setCookie(value) },
  });

describe('sessionManager - web platform', () => {
  it('does nothing on the web', async () => {
    session.platform = 'web';

    await expect(sessionManager.ensureSession(API_URL)).resolves.toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('sessionManager - valid cookie', () => {
  it('reuses a still-valid cookie without a network request', async () => {
    session.cookies[ORIGIN] = { rt_session: { value: makeJwt(3_600) } };

    await expect(sessionManager.ensureSession(API_URL)).resolves.toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('treats a non-JWT cookie as valid', async () => {
    session.cookies[ORIGIN] = { rt_session: { value: 'not-a-jwt' } };

    await expect(sessionManager.ensureSession(API_URL)).resolves.toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('treats a cookie without a value as valid', async () => {
    session.cookies[ORIGIN] = { rt_session: { value: '' } };

    await expect(sessionManager.ensureSession(API_URL)).resolves.toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('renews when the session expires within the 60s window', async () => {
    session.cookies[ORIGIN] = { rt_session: { value: makeJwt(30) } };
    fetchMock.mockResolvedValueOnce(respondWithSetCookie(makeJwt(3_600)));

    await expect(sessionManager.ensureSession(API_URL)).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reuses the cookie exactly at the renewal boundary', async () => {
    const now = 1_700_000_000_000;
    vi.spyOn(Date, 'now').mockReturnValue(now);
    const payload = { exp: (now + 60_000) / 1000 };
    session.cookies[ORIGIN] = {
      rt_session: {
        value: `header.${encodeBase64Url(JSON.stringify(payload))}.signature`,
      },
    };

    await expect(sessionManager.ensureSession(API_URL)).resolves.toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('ignores a numeric-string expiration on the cookie payload', async () => {
    const payload = {
      iat: Date.now() / 1000,
      exp: String(Date.now() / 1000 - 120),
    };
    session.cookies[ORIGIN] = {
      rt_session: {
        value: `header.${encodeBase64Url(JSON.stringify(payload))}.signature`,
      },
    };

    await expect(sessionManager.ensureSession(API_URL)).resolves.toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('treats a two-part token as a plain cookie value', async () => {
    const payload = { exp: Date.now() / 1000 - 1_000 };
    session.cookies[ORIGIN] = {
      rt_session: {
        value: `header.${encodeBase64Url(JSON.stringify(payload))}`,
      },
    };

    await expect(sessionManager.ensureSession(API_URL)).resolves.toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('pads url-safe payloads before decoding a renewing cookie', async () => {
    const payload = { exp: Math.ceil((Date.now() + 10_000) / 1000), iat: 1 };
    const encodedPayload = encodeBase64Url(JSON.stringify(payload));
    expect(encodedPayload.length % 4).not.toBe(0);
    const strictAtob = vi.fn((input: string) => {
      if (input.length % 4 !== 0) {
        throw new TypeError('invalid base64 length');
      }
      return Buffer.from(input, 'base64').toString('binary');
    });
    vi.stubGlobal('atob', strictAtob);

    session.cookies[ORIGIN] = {
      rt_session: {
        value: `header.${encodedPayload}.signature`,
      },
    };
    fetchMock.mockResolvedValueOnce(respondWithSetCookie(makeJwt(3_600)));

    await expect(sessionManager.ensureSession(API_URL)).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('forces a refresh when requested', async () => {
    session.cookies[ORIGIN] = { rt_session: { value: makeJwt(3_600) } };
    fetchMock.mockResolvedValueOnce(respondWithSetCookie(makeJwt(3_600)));

    await expect(
      sessionManager.ensureSession(API_URL, true),
    ).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('sessionManager - refresh flow', () => {
  it('reads the cookie from set-cookie and stores it', async () => {
    fetchMock.mockResolvedValueOnce(respondWithSetCookie(makeJwt(3_600)));

    await expect(sessionManager.ensureSession(API_URL)).resolves.toBe(true);
    expect(session.setFromResponse).toHaveBeenCalledWith(
      ORIGIN,
      expect.stringContaining('rt_session='),
    );
  });

  it('requests the session with explicit GET, Accept and no-store options', async () => {
    fetchMock.mockResolvedValueOnce(respondWithSetCookie(makeJwt(3_600)));

    await sessionManager.ensureSession(API_URL);

    const [, options] = fetchMock.mock.calls[0];
    expect(options).toEqual({
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
  });

  it('adds a cache-busting parameter to the session request', async () => {
    fetchMock.mockResolvedValueOnce(respondWithSetCookie(makeJwt(3_600)));

    await sessionManager.ensureSession(API_URL);

    const [url] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/_t=\d+/);
    expect(String(url)).toBe(`${ORIGIN}/?_t=${String(url).match(/_t=(\d+)/)?.[1]}`);
  });

  it('fails cleanly when the response has no set-cookie header', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 200 }));

    await expect(sessionManager.ensureSession(API_URL)).resolves.toBe(false);
    expect(session.setFromResponse).not.toHaveBeenCalled();
  });

  it('fails cleanly when the set-cookie header has no session cookie', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('{}', {
        status: 200,
        headers: { 'set-cookie': 'Other=1; Path=/' },
      }),
    );

    await expect(sessionManager.ensureSession(API_URL)).resolves.toBe(false);
  });

  it('fails cleanly on a network error', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));

    await expect(sessionManager.ensureSession(API_URL)).resolves.toBe(false);
    expect(console.warn).toHaveBeenCalledWith(
      '[sessionManager] unable to obtain a session cookie:',
      expect.any(TypeError),
    );
  });

  it('deduplicates concurrent refreshes into a single request', async () => {
    fetchMock.mockResolvedValueOnce(respondWithSetCookie(makeJwt(3_600)));

    await Promise.all([
      sessionManager.ensureSession(API_URL),
      sessionManager.ensureSession(API_URL),
      sessionManager.ensureSession(API_URL),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries a refresh after a failure (the cache is purged)', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Network request failed'));
    fetchMock.mockResolvedValueOnce(respondWithSetCookie(makeJwt(3_600)));

    await expect(sessionManager.ensureSession(API_URL)).resolves.toBe(false);
    await expect(sessionManager.ensureSession(API_URL)).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe('sessionManager - edge cases', () => {
  it('rejects an invalid URL', async () => {
    await expect(sessionManager.ensureSession('not a url')).rejects.toThrow();
  });

  it('treats a cookie whose payload is not valid JSON as valid', async () => {
    session.cookies[ORIGIN] = {
      rt_session: { value: 'header.bm90LWpzb24.signature' },
    };

    await expect(sessionManager.ensureSession(API_URL)).resolves.toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('treats a cookie as valid when the atob global is missing', async () => {
    vi.stubGlobal('atob', undefined);
    session.cookies[ORIGIN] = { rt_session: { value: makeJwt(3_600) } };

    await expect(sessionManager.ensureSession(API_URL)).resolves.toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('renews cookies whose payload uses URL-safe base64 characters', async () => {
    const dashPayload = '{"iat":1,"exp":2,"pad":"~~~"}';
    const underscorePayload =
      '{"iat":1,"exp":2,"pad":"j^[dn:9d_sq9.[H4-g{t\'oT[vqv6r#f*)&:@o%^KZn;e?tGb!w,]vEVi,}BJ?dF%*k/U/GS*$z!=<"}';

    for (const payload of [dashPayload, underscorePayload]) {
      session.cookies[ORIGIN] = {
        rt_session: { value: `header.${encodeBase64Url(payload)}.signature` },
      };
      fetchMock.mockResolvedValueOnce(respondWithSetCookie(makeJwt(3_600)));

      await expect(sessionManager.ensureSession(API_URL)).resolves.toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      fetchMock.mockClear();
      session.cookies[ORIGIN] = {};
    }
  });
});
