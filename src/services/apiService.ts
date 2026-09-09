import {CarTelemetry} from '@/types/telemetry/carTelemetry';
import sessionManager from '@/services/sessionManager';

class ApiService {
  private readonly timeout = 10000;

  private async fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async retrieveData(
    carNumber: number,
    apiUrl: string,
    uuid: string,
    isRetry = false
  ): Promise<CarTelemetry | null> {
    try {
      const url = new URL(apiUrl);
      url.searchParams.set('uuid', uuid);

      await sessionManager.ensureSession(apiUrl, isRetry);

      const response = await this.fetchWithTimeout(url.toString(), {
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });

      if (response.status === 401 || response.status === 403) {
        await sessionManager.ensureSession(
          apiUrl,
          isRetry || response.status === 401
        )
        if (!isRetry) {
          return this.retrieveData(carNumber, apiUrl, uuid, true);
        }
        return null;
      }

      if (!response.ok) {
        return null;
      }

      const payload = await response.json() as any;

      if (!payload.cars || !Array.isArray(payload.cars)) {
        return null;
      }

      const cars = payload.cars;
      const sortedCars = [...cars].sort((a, b) => (a.position || 0) - (b.position || 0));

      const carIndex = sortedCars.findIndex(car => car.car_number === carNumber);

      if (carIndex === -1) {
        return null;
      }

      const car = sortedCars[carIndex];
      const leader = sortedCars[0];
      const carAhead = carIndex > 0 ? sortedCars[carIndex - 1] : null;
      const carBehind = carIndex < sortedCars.length - 1 ? sortedCars[carIndex + 1] : null;

      return {
        position: car.position ?? null,
        bestLapTime: car.lap?.best_lap_ms ?? null,
        lastLapTime: car.lap?.lap_time_ms ?? null,
        deltaToLeader: car.gaps?.toLeader?.ms !== undefined ? {
          carNumber: leader?.car_number?.toString() ?? null,
          ms: car.gaps.toLeader.ms ?? null,
          laps: car.gaps.toLeader.laps ?? null,
        } : null,
        gapAhead: car.ints?.toAhead?.ms !== undefined ? {
          carNumber: carAhead?.car_number?.toString() ?? null,
          ms: car.ints.toAhead.ms ?? null,
          laps: car.ints.toAhead.laps ?? null,
        } : null,
        gapBehind: carBehind?.ints?.toAhead?.ms !== undefined ? {
          carNumber: carBehind?.car_number?.toString() ?? null,
          ms: carBehind.ints.toAhead.ms ?? null,
          laps: carBehind.ints.toAhead.laps ?? null,
        } : null,
      };
    } catch (error) {
      console.warn('[apiService] retrieveData failed:', error);
      return null;
    }
  }

}

export default new ApiService();
