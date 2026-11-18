import cors from 'cors';
import express from 'express';
import morgan from 'morgan';

import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const app = express();

app.disable('x-powered-by');

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : true;

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend Data Siswa siap',
    data: { status: 'ok' },
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
