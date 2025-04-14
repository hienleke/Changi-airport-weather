import express from 'express';
import cors from 'cors';
import weatherRouter from './routes/weather';
import authRouter from './routes/auth';
const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/weather', weatherRouter);
app.use('/api/auth', authRouter);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app; 