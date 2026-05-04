import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/authRoutes';
import feedbackRoutes from './routes/feedbackRoutes';
import analysisRoutes from './routes/analysisRoutes';

const app = express();

app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Multilingual Feedback Analyzer API' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', feedbackRoutes);
app.use('/api/v1/analysis', analysisRoutes);

app.use(errorHandler);

export default app;
