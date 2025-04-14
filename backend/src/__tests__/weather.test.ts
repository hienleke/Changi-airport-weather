import { getCurrentWeather, getWeatherHistory, compareWeatherReports } from '../services/weather';
import pool from '../config/database';

jest.mock('../config/database', () => ({
  query: jest.fn(),
}));

describe('Weather Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentWeather', () => {
    it('should fetch current weather data', async () => {
      const mockWeatherData = {
        main: {
          temp: 25,
          pressure: 1013,
          humidity: 80,
        },
        clouds: {
          all: 20,
        },
      };

      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ id: 1 }],
      });

      const result = await getCurrentWeather();
      
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('temp');
      expect(result).toHaveProperty('pressure');
      expect(result).toHaveProperty('humidity');
      expect(result).toHaveProperty('clouds');
    });
  });

  describe('getWeatherHistory', () => {
    it('should fetch weather history', async () => {
      const mockHistory = [
        { id: 1, temp: 25, pressure: 1013, humidity: 80, clouds: 20 },
        { id: 2, temp: 26, pressure: 1012, humidity: 75, clouds: 30 },
      ];

      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: mockHistory,
      });

      const result = await getWeatherHistory();
      
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('temp');
    });
  });

  describe('compareWeatherReports', () => {
    it('should compare two weather reports', async () => {
      const mockReport1 = { id: 1, temp: 25, pressure: 1013, humidity: 80, clouds: 20 };
      const mockReport2 = { id: 2, temp: 26, pressure: 1012, humidity: 75, clouds: 30 };

      (pool.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [mockReport1] })
        .mockResolvedValueOnce({ rows: [mockReport2] });

      const result = await compareWeatherReports(1, 2);
      
      expect(result).toHaveProperty('report1');
      expect(result).toHaveProperty('report2');
      expect(result).toHaveProperty('deviation');
      expect(result.deviation.temp).toBe(1); // 26 - 25
    });
  });
}); 