import axios, { AxiosError } from 'axios';

export interface LapData {
  carNumber: number;
  lapTimeMs?: number;
  position?: number;
  lap?: number;
}

class ApiService {
  private timeout: number = 10000;

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

      const response = await axios.get(apiUrl, {
        params: { uuid },
        headers,
        timeout: this.timeout,
      });

      const payload = response.data;

      if (!payload.cars || !Array.isArray(payload.cars)) {
        console.error('Invalid API response structure');
        return null;
      }

      for (const car of payload.cars) {
        if (car.car_number === carNumber) {
          const lap = car.lap || {};
          return lap.lap_time_ms || null;
        }
      }

      console.info(`Car number ${carNumber} not found in API response`);
      return null;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('API Error:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      return null;
    }
  }

  async getAllCarsData(
    apiUrl: string,
    uuid: string
  ): Promise<LapData[] | null> {
    try {
      const headers = {
        'User-Agent': 'Mozilla/5.0',
        Accept: '*/*',
        Referer: 'https://live.ris-timing.be/moto',
        Origin: 'https://live.ris-timing.be',
      };

      const response = await axios.get(apiUrl, {
        params: { uuid },
        headers,
        timeout: this.timeout,
      });

      const payload = response.data;

      if (!payload.cars || !Array.isArray(payload.cars)) {
        console.error('Invalid API response structure');
        return null;
      }

      return payload.cars.map((car: any) => ({
        carNumber: car.car_number,
        lapTimeMs: car.lap?.lap_time_ms || null,
        position: car.position || null,
        lap: car.lap?.number || null,
      }));
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('API Error:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
      return null;
    }
  }
}

export default new ApiService();
