import express from 'express';
import { getCurrentWeather, getWeatherHistory, getWeatherByDate, getWeatherByTimeRange } from '../services/weather';

const router = express.Router();

router.get('/current', async (req, res) => {
  try {
    const weather = await getCurrentWeather();
    res.json(weather);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch current weather' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'timestamp', 
      sortOrder = 'desc',
      date,
      temp,
      humidity,
      pressure,
      clouds
    } = req.query;

    const history = await getWeatherHistory({
      page: Number(page),
      limit: Number(limit),
      sortBy: String(sortBy),
      sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
      date: date ? String(date) : undefined,
      temp: temp ? String(temp) : undefined,
      humidity: humidity ? String(humidity) : undefined,
      pressure: pressure ? String(pressure) : undefined,
      clouds: clouds ? String(clouds) : undefined
    });
    res.json(history);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Failed to fetch weather history' });
  }
});

router.get('/date/:date', async (req, res) => {
  try {
    const weather = await getWeatherByDate(req.params.date);
    if (!weather) {
      return res.status(404).json({ error: 'No weather data found for this date' });
    }
    res.json(weather);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

router.get('/time-range', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ error: 'Both from and to parameters are required' });
    }

    const reports = await getWeatherByTimeRange(String(from), String(to));
    res.json({ data: reports });
  } catch (error) {
    console.error('Time range search error:', error);
    res.status(500).json({ error: 'Failed to fetch weather reports by time range' });
  }
});

export default router; 