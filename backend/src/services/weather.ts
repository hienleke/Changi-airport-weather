import axios from "axios";
import {
  WeatherReport,
  WeatherComparison,
  OpenWeatherResponse,
  WeatherHistoryParams,
} from "../types/weather";
import pool from "../config/database";
import { redisClient } from "../config/redis";
import moment from "moment-timezone";
const CHANGI_LAT = 1.3586;
const CHANGI_LON = 103.9899;
const CACHE_TTL = 1000;
const TIMEZONE = "Asia/Singapore";

export const getCurrentWeather = async (): Promise<WeatherReport> => {
  const cachedWeather = await redisClient.get("current_weather");
  if (cachedWeather) {
    return JSON.parse(cachedWeather);
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENWEATHER_API_KEY not set");
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${CHANGI_LAT}&lon=${CHANGI_LON}&appid=${apiKey}&units=metric`;
  const response = await axios.get<OpenWeatherResponse>(url);
  const data = response.data;

  const report: WeatherReport = {
    timestamp: new Date().toISOString(),
    temp: data.main.temp,
    pressure: data.main.pressure,
    humidity: data.main.humidity,
    clouds: data.clouds.all,
  } as WeatherReport;

  const result = await pool.query(
    "INSERT INTO weather_reports (timestamp, temp, pressure, humidity, clouds) VALUES ($1, $2, $3, $4, $5) RETURNING id",
    [
      report.timestamp,
      report.temp,
      report.pressure,
      report.humidity,
      report.clouds,
    ]
  );

  report.id = result.rows[0].id;

  // Cache the result
  redisClient.set("current_weather", JSON.stringify(report), { EX: CACHE_TTL });

  return report;
};

export const getWeatherHistory = async (params: WeatherHistoryParams) => {
  const {
    page,
    limit,
    sortBy,
    sortOrder,
    date,
    temp,
    humidity,
    pressure,
    clouds,
  } = params;
  const offset = (page - 1) * limit;

  let query = "SELECT * FROM weather_reports";
  const conditions = [];
  const values = [];
  let valueIndex = 1;

  if (date) {
    conditions.push(
      `DATE(timestamp AT TIME ZONE '${TIMEZONE}') = $${valueIndex}`
    );
    values.push(date);
    valueIndex++;
  }

  if (temp) {
    conditions.push(`temp = $${valueIndex}`);
    values.push(Number(temp));
    valueIndex++;
  }

  if (humidity) {
    conditions.push(`humidity = $${valueIndex}`);
    values.push(Number(humidity));
    valueIndex++;
  }

  if (pressure) {
    conditions.push(`pressure = $${valueIndex}`);
    values.push(Number(pressure));
    valueIndex++;
  }

  if (clouds) {
    conditions.push(`clouds = $${valueIndex}`);
    values.push(Number(clouds));
    valueIndex++;
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT $${valueIndex} OFFSET $${
    valueIndex + 1
  }`;
  values.push(limit, offset);

  const countQuery = `SELECT COUNT(*) FROM weather_reports${
    conditions.length > 0 ? " WHERE " + conditions.join(" AND ") : ""
  }`;
  const countResult = await pool.query(countQuery, values.slice(0, -2));
  const total = parseInt(countResult.rows[0].count);

  const result = await pool.query(query, values);
  return { data: result.rows, total };
};

export const getWeatherReportById = async (
  id: number
): Promise<WeatherReport> => {
  const result = await pool.query(
    "SELECT id, timestamp, temp, pressure, humidity, clouds FROM weather_reports WHERE id = $1",
    [id]
  );

  if (result.rows.length === 0) {
    throw new Error("Weather report not found");
  }

  return result.rows[0];
};

export const compareWeatherReports = async (
  report1Id: number,
  report2Id: number
): Promise<WeatherComparison> => {
  const result = await pool.query(
    "SELECT * FROM weather_reports WHERE id IN ($1, $2)",
    [report1Id, report2Id]
  );

  if (result.rows.length !== 2) {
    throw new Error("One or both reports not found");
  }

  const [report1, report2] = result.rows;
  const deviation = {
    temp: report1.temp - report2.temp,
    pressure: report1.pressure - report2.pressure,
    humidity: report1.humidity - report2.humidity,
    clouds: report1.clouds - report2.clouds,
  };

  return {
    report1: {
      id: report1.id,
      timestamp: report1.timestamp,
      temp: report1.temp,
      pressure: report1.pressure,
      humidity: report1.humidity,
      clouds: report1.clouds,
    },
    report2: {
      id: report2.id,
      timestamp: report2.timestamp,
      temp: report2.temp,
      pressure: report2.pressure,
      humidity: report2.humidity,
      clouds: report2.clouds,
    },
    deviation,
  };
};

export const getWeatherByDate = async (
  date: string
): Promise<WeatherReport[] | null> => {
  try {
    // First try to get from database
    const dbResult = await pool.query(
      `SELECT * FROM weather_reports 
       WHERE DATE(timestamp AT TIME ZONE '${TIMEZONE}') = $1 
       ORDER BY timestamp DESC`,
      [date]
    );

    // If data exists in database, return it
    if (dbResult.rows.length > 0) {
      return dbResult.rows;
    }

    // If no data in database, fetch from OpenWeather API
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENWEATHER_API_KEY not set");
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${CHANGI_LAT}&lon=${CHANGI_LON}&units=metric&appid=${apiKey}`;
    const response = await axios.get(url);

    if (!response.data || !response.data.list) {
      throw new Error("No weather data available for the specified date");
    }

    // Get the forecasts for the target date
    const forecasts = response.data.list.filter((item: any) =>
      item.dt_txt.startsWith(date)
    );

    if (forecasts.length === 0) {
      throw new Error("No forecasts found for the specified date");
    }

    // Save all forecasts to database
    const savedReports: WeatherReport[] = [];

    for (const forecast of forecasts) {
      const insertResult = await pool.query(
        `INSERT INTO weather_reports (timestamp, temp, pressure, humidity, clouds) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
        [
          new Date(forecast.dt_txt).toISOString(),
          forecast.main.temp,
          forecast.main.pressure,
          forecast.main.humidity,
          forecast.clouds.all,
        ]
      );

      savedReports.push(insertResult.rows[0]);
    }

    return savedReports;
  } catch (error) {
    console.error("Error in getWeatherByDate:", error);
    return null;
  }
};

export const getWeatherByTimeRange = async (
  from: string,
  to: string
): Promise<WeatherReport[]> => {
  const fromDate = moment.tz(from, TIMEZONE).utc().format();
  const toDate = moment.tz(to, TIMEZONE).utc().format();

  if (!moment(fromDate).isValid() || !moment(toDate).isValid()) {
    throw new Error("Invalid date format provided");
  }

  if (moment(fromDate).isAfter(toDate)) {
    throw new Error("From date cannot be after to date");
  }

  const result = await pool.query(
    `SELECT * FROM weather_reports 
     WHERE (timestamp  AT TIME ZONE $3) 
     BETWEEN $1 AND $2 
     ORDER BY timestamp ASC`,
    [fromDate, toDate, TIMEZONE]
  );

  return result.rows;
};
