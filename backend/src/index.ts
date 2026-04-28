import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupDatabase } from './setup';
import { seedDatabase } from './seed';
import authRoutes from './routes/auth';
import collegesRoutes from './routes/colleges';
import userRoutes from './routes/user';
import questionsRoutes from './routes/questions';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? true  // allow all origins in production (Vercel/Render)
    : (process.env.FRONTEND_URL || 'http://localhost:3000'),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/colleges', collegesRoutes);
app.use('/api/user', userRoutes);
app.use('/api/questions', questionsRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  try {
    await setupDatabase();
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
