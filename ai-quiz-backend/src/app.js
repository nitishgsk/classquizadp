import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();

// --- Core Middlewares ---
app.use(cors({ 
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.CORS_ORIGIN
    ].filter(Boolean);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Middleware for handling file uploads
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

// --- Route Imports ---
import authRouter from './api/auth.routes.js';
import quizRouter from './api/quiz.routes.js';
import testRouter from './api/test.routes.js';


// --- Route Declarations ---
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/quiz', quizRouter);
app.use('/api/v1/test', testRouter);


// --- Healthcheck Route ---
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'Backend is healthy' });
});

// --- Centralized Error Handler ---
app.use(errorMiddleware);

export { app };