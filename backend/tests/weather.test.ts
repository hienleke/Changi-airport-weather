import request from 'supertest';
import { app } from '../src/app';
import  pool  from '../src/config/database';

describe('Weather Routes', () => {
  beforeAll(async () => {
    // Setup test database
    await pool.query(`
      CREATE TABLE IF NOT EXISTS weather_reports (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL,
        temperature DECIMAL NOT NULL,
        humidity DECIMAL NOT NULL,
        pressure DECIMAL NOT NULL,
        clouds DECIMAL NOT NULL
      )
    `);
  });

  afterAll(async () => {
    // Cleanup test database
    await pool.query('DROP TABLE IF EXISTS weather_reports');
    await pool.end();
  });

  describe('GET /weather/current', () => {
    it('should return current weather data', async () => {
      const response = await request(app)
        .get('/weather/current')
        .expect(200);

      expect(response.body).toHaveProperty('temperature');
      expect(response.body).toHaveProperty('humidity');
      expect(response.body).toHaveProperty('pressure');
      expect(response.body).toHaveProperty('clouds');
    });
  });

  describe('GET /weather/history', () => {
    it('should return historical weather data', async () => {
      const response = await request(app)
        .get('/weather/history')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('total');
    });
  });

  describe('GET /weather/compare', () => {
    it('should return weather comparison data', async () => {
      const response = await request(app)
        .get('/weather/compare')
        .query({
          date1: '2024-01-01',
          date2: '2024-01-02'
        })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
}); 