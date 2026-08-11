
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

  async getLapTime(
    carNumber: number,
    apiUrl: string,
    uuid: string
  ): Promise<number | null> {
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0',
        Accept: '*/*',
        Referer: 'https://live.ris-timing.be/moto',
        Origin: 'https://live.ris-timing.be',
      };

      const url = new URL(apiUrl);
      url.searchParams.append('uuid', uuid);

      const response = await this.fetchWithTimeout(url.toString(), { headers });

      if (!response.ok) {
        console.error(`API Error: HTTP ${response.status}`);
        return null;
      }

      const payload = await response.json() as any;

      if (!payload.cars || !Array.isArray(payload.cars)) {
        console.error('Invalid API response structure');
        return null;
      }

      for (const car of payload.cars) {
        if (car.car_number === carNumber) {
          const lap = car.lap || {};
          return lap.lap_time_ms ?? null;
        }
      }

      console.info(`Car number ${carNumber} not found in API response`);
      return null;
    } catch (error) {
      console.error('API Error:', error instanceof Error ? error.message : String(error));
      return null;
    }
  }

}

export default new ApiService();
