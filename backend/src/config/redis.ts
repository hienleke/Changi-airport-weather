import { createClient } from 'redis';

const redisConfig = {
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`,
  username: process.env.REDIS_USERNAME || '',
  password: process.env.REDIS_PASSWORD || '',
  port: Number(process.env.REDIS_PORT) || 6379,
  socket: {
    reconnectStrategy: (retries: number) => {
      if (retries > 10) {
        return new Error('Max reconnection attempts reached');
      }
      return Math.min(retries * 100, 3000);
    }
  }
};

export const redisClient = createClient(redisConfig);

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Successfully connected to Redis'));

redisClient.connect().catch(console.error); 