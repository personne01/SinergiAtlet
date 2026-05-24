import express from 'express';
import cors from 'cors';
import { errorHandler, notFound } from './middleware/errorHandler';
import { logger } from './middleware/logger';
import jobsRouter from './routes/jobs';
import careerRouter from './routes/career';
import kysRouter from './routes/kys';
import authRouter from './routes/auth';

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/jobs', jobsRouter);
app.use('/api/career', careerRouter);
app.use('/api/kys', kysRouter);
app.use('/api/auth', authRouter);

app.use('/api/*', notFound);
app.use(errorHandler);

export default app;
