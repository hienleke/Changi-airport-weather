import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
  
});


// Create tables if they don't exist
Promise.all([
  pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `),
  pool.query(`
    CREATE TABLE IF NOT EXISTS weather_reports (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMPTZ NOT NULL,
      temp FLOAT NOT NULL,
      pressure FLOAT NOT NULL,
      humidity FLOAT NOT NULL,
      clouds FLOAT NOT NULL
    )
  `)
]).catch(err => console.error('Error creating tables:', err));

export default pool; 