import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import apiService from '@/services/apiService';

const api = vi.hoisted(() => ({
  ensureSession: vi.fn(async () => true),
}));

vi.mock('@/services/sessionManager', () => ({
  default: { ensureSession: api.ensureSession },
}));

const API_URL = 'https://api.ris-timing.be/live/v2/';
const UUID = 'a1b2c3';

const makeCar = (overrides: Record<string, unknown> = {}) => ({
  car_number: 12,
  position: 3,
  lap: { best_lap_ms: 128_831, lap_time_ms: 134_914 },
  gaps: { toLeader: { ms: 78_217, laps: 0 } },
  ints: {},
  ...overrides,
});

const makePayload = () => ({
  cars: [
    makeCar({
      car_number: 33,
      position: 4,
      ints: { toAhead: { ms: 10_094, laps: 0 } },
    }),
    makeCar({
      car_number: 12,
      position: 3,
      ints: { toAhead: { ms: 8_145, laps: 0 } },
    }),
    makeCar({
      car_number: 22,
      position: 2,
      gaps: { toLeader: { ms: 12_000, laps: 0 } },
      ints: { toAhead: { ms: 5_000, laps: 0 } },
    }),
    makeCar({
      car_number: 7,
      position: 1,
      lap: { best_lap_ms: 111_000, lap_time_ms: 112_000 },
      gaps: { toLeader: { ms: 0, laps: 0 } },
    }),
  ],
});

const jsonResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  api.ensureSession.mockClear();
  api.ensureSession.mockResolvedValue(true);
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('apiService - data mapping', () => {
  it('sorts cars by position and derives leader/ahead/behind', async () => {
    fetchMock.mockResolvedValue(jsonResponse(makePayload()));

    const data = await apiService.retrieveData(12, API_URL, UUID);

    expect(data).not.toBeNull();
    expect(data?.position).toBe(3);
    expect(data?.bestLapTime).toBe(128_831);
    expect(data?.lastLapTime).toBe(134_914);
    expect(data?.deltaToLeader).toEqual({
      carNumber: '7',
      ms: 78_217,
      laps: 0,
    });
    expect(data?.gapAhead).toEqual({ carNumber: '22', ms: 8_145, laps: 0 });
    expect(data?.gapBehind).toEqual({ carNumber: '33', ms: 10_094, laps: 0 });
  });

  it('keeps the leader without a gap ahead and the last car without a gap behind', async () => {
    fetchMock.mockImplementation(() => Promise.resolve(jsonResponse(makePayload())));

    const leader = await apiService.retrieveData(7, API_URL, UUID);
    const last = await apiService.retrieveData(33, API_URL, UUID);

    expect(leader?.gapAhead).toBeNull();
    expect(last?.gapBehind).toBeNull();
    expect(leader?.deltaToLeader?.ms).toBe(0);
  });

  it('maps missing optional fields to null', async () => {
    const payload = {
      cars: [
        makeCar({ position: 1, car_number: 5, lap: {}, gaps: {}, ints: {} }),
      ],
    };
    fetchMock.mockResolvedValue(jsonResponse(payload));

    const data = await apiService.retrieveData(5, API_URL, UUID);

    expect(data?.bestLapTime).toBeNull();
    expect(data?.lastLapTime).toBeNull();
    expect(data?.deltaToLeader).toBeNull();
    expect(data?.gapAhead).toBeNull();
  });

  it('fills nulls when gap metadata is partial', async () => {
    const payload = {
      cars: [
        {
          car_number: undefined,
          position: 1,
          gaps: { toLeader: { ms: 0, laps: 0 } },
        },
        {
          car_number: 12,
          position: 2,
          gaps: { toLeader: { ms: 5_000 } },
          ints: { toAhead: { ms: 2_000 } },
        },
        {
          car_number: null,
          position: 3,
          gaps: { toLeader: { ms: 9_000, laps: 1 } },
          ints: { toAhead: { ms: 1_000 } },
        },
      ],
    };
    fetchMock.mockResolvedValue(jsonResponse(payload));

    const data = await apiService.retrieveData(12, API_URL, UUID);

    expect(data?.deltaToLeader).toEqual({
      carNumber: null,
      ms: 5_000,
      laps: null,
    });
    expect(data?.gapAhead).toEqual({
      carNumber: null,
      ms: 2_000,
      laps: null,
    });
    expect(data?.gapBehind).toEqual({
      carNumber: null,
      ms: 1_000,
      laps: null,
    });
  });

  it('handles null ms in gap and interval fields', async () => {
    const payload = {
      cars: [
        {
          car_number: 1,
          position: 1,
          gaps: { toLeader: { ms: null, laps: 1 } },
          ints: { toAhead: { ms: null } },
        },
        {
          car_number: 12,
          position: 2,
          gaps: { toLeader: { ms: null, laps: 2 } },
          ints: { toAhead: { ms: null, laps: 1 } },
        },
        {
          car_number: 3,
          position: 3,
          ints: { toAhead: { ms: null, laps: null } },
        },
      ],
    };
    fetchMock.mockResolvedValue(jsonResponse(payload));

    const data = await apiService.retrieveData(12, API_URL, UUID);

    expect(data?.deltaToLeader).toEqual({
      carNumber: '1',
      ms: null,
      laps: 2,
    });
    expect(data?.gapAhead).toEqual({
      carNumber: '1',
      ms: null,
      laps: 1,
    });
    expect(data?.gapBehind).toEqual({
      carNumber: '3',
      ms: null,
      laps: null,
    });
  });

  it('tolerates missing gap and interval sections', async () => {
    const payload = {
      cars: [
        {
          car_number: 9,
          position: 1,
          gaps: { toLeader: { ms: 0, laps: 0 } },
          ints: { toAhead: { ms: 0, laps: 0 } },
        },
        {
          car_number: 12,
          position: 2,
          gaps: null,
          ints: null,
        },
        {
          car_number: 7,
          position: 3,
          gaps: { toLeader: { ms: 100, laps: 0 } },
          ints: null,
        },
      ],
    };
    fetchMock.mockResolvedValue(jsonResponse(payload));

    const data = await apiService.retrieveData(12, API_URL, UUID);

    expect(data).not.toBeNull();
    expect(data?.deltaToLeader).toBeNull();
    expect(data?.gapAhead).toBeNull();
    expect(data?.gapBehind).toBeNull();
  });

  it('maps the leader with an empty gap ahead when it has interval data', async () => {
    const payload = {
      cars: [
        {
          car_number: 5,
          position: 1,
          gaps: { toLeader: { ms: 0, laps: 0 } },
          ints: { toAhead: { ms: 1_000, laps: 0 } },
        },
        {
          car_number: 12,
          position: 2,
          gaps: { toLeader: { ms: 500, laps: 0 } },
          ints: { toAhead: { ms: 900, laps: 0 } },
        },
      ],
    };
    fetchMock.mockResolvedValue(jsonResponse(payload));

    const data = await apiService.retrieveData(5, API_URL, UUID);

    expect(data).not.toBeNull();
    expect(data?.gapAhead).toEqual({ carNumber: null, ms: 1_000, laps: 0 });
  });

  it('appends the uuid as a query parameter and ensures a session first', async () => {
    fetchMock.mockResolvedValue(jsonResponse(makePayload()));

    await apiService.retrieveData(12, API_URL, UUID);

    expect(api.ensureSession).toHaveBeenCalledWith(API_URL, false);
    const [url, options] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('uuid=a1b2c3');
    expect(options).toMatchObject({
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });
    expect(options?.signal).toBeInstanceOf(AbortSignal);
  });
});

describe('apiService - error handling', () => {
  it('returns null when the car is not in the standings', async () => {
    fetchMock.mockResolvedValue(jsonResponse(makePayload()));

    expect(await apiService.retrieveData(999, API_URL, UUID)).toBeNull();
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('rejects payloads without a usable cars array without warning', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));
    expect(await apiService.retrieveData(12, API_URL, UUID)).toBeNull();

    fetchMock.mockResolvedValue(jsonResponse({ cars: 'nope' }));
    expect(await apiService.retrieveData(12, API_URL, UUID)).toBeNull();

    fetchMock.mockResolvedValue(jsonResponse({ cars: [] }));
    expect(await apiService.retrieveData(12, API_URL, UUID)).toBeNull();

    fetchMock.mockResolvedValue(jsonResponse({ cars: null }));
    expect(await apiService.retrieveData(12, API_URL, UUID)).toBeNull();

    fetchMock.mockResolvedValue(jsonResponse({ cars: {} }));
    expect(await apiService.retrieveData(12, API_URL, UUID)).toBeNull();

    expect(console.warn).not.toHaveBeenCalled();
  });

  it('returns null for failing server responses', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 500));
    expect(await apiService.retrieveData(12, API_URL, UUID)).toBeNull();

    fetchMock.mockResolvedValue(jsonResponse({}, 404));
    expect(await apiService.retrieveData(12, API_URL, UUID)).toBeNull();
  });

  it('returns null for a failing status even when the body is valid', async () => {
    fetchMock.mockResolvedValue(jsonResponse(makePayload(), 500));

    expect(await apiService.retrieveData(12, API_URL, UUID)).toBeNull();
  });

  it('returns null on a network error', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));

    expect(await apiService.retrieveData(12, API_URL, UUID)).toBeNull();
    expect(console.warn).toHaveBeenCalledWith(
      '[apiService] retrieveData failed:',
      expect.any(TypeError),
    );
  });

  it('returns null on invalid JSON', async () => {
    fetchMock.mockResolvedValue(
      new Response('not json {', { status: 200 }),
    );

    expect(await apiService.retrieveData(12, API_URL, UUID)).toBeNull();
  });

  it('returns null when the request is aborted by the timeout', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_url: string, options: RequestInit) =>
        new Promise((_resolve, reject) => {
          options.signal?.addEventListener('abort', () =>
            reject(new Error('Aborted')),
          );
        }),
    );

    const promise = apiService.retrieveData(12, API_URL, UUID);
    const assertion = expect(promise).resolves.toBeNull();
    await vi.advanceTimersByTimeAsync(11_000);
    await assertion;
  });

  it('clears the request timeout after a fast successful response', async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(jsonResponse(makePayload()));

    await apiService.retrieveData(12, API_URL, UUID);

    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('apiService - session renewal (401/403)', () => {
  it('renews the session and replays the request once', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, 401))
      .mockResolvedValueOnce(jsonResponse(makePayload()));

    const data = await apiService.retrieveData(12, API_URL, UUID);

    expect(data?.position).toBe(3);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(api.ensureSession).toHaveBeenCalledTimes(3);
    expect(api.ensureSession).toHaveBeenNthCalledWith(1, API_URL, false);
    expect(api.ensureSession).toHaveBeenNthCalledWith(2, API_URL, true);
    expect(api.ensureSession).toHaveBeenNthCalledWith(3, API_URL, true);
  });

  it('gives up after a second 401 without looping forever', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, 401));

    const data = await apiService.retrieveData(12, API_URL, UUID);

    expect(data).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('treats 403 like 401', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({}, 403))
      .mockResolvedValueOnce(jsonResponse(makePayload()));

    expect((await apiService.retrieveData(12, API_URL, UUID))?.position).toBe(3);
    expect(api.ensureSession).toHaveBeenNthCalledWith(2, API_URL, false);
    expect(api.ensureSession).toHaveBeenNthCalledWith(3, API_URL, true);
  });
});

describe('apiService - extreme standings', () => {
  it('does not crash when positions are missing or tied', async () => {
    const payload = {
      cars: [
        makeCar({ position: undefined, car_number: 1 }),
        makeCar({ position: 1, car_number: 2 }),
        makeCar({ position: 1, car_number: 3 }),
        makeCar({ car_number: 12, position: undefined, ints: {} }),
      ],
    };
    fetchMock.mockResolvedValue(jsonResponse(payload));

    const data = await apiService.retrieveData(12, API_URL, UUID);

    expect(data).not.toBeNull();
  });
});
