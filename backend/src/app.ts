import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import http from 'http';

// ── Crash guards ──────────────────────────────────────────────────────────────
process.on('uncaughtException',  (err) => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', (err) => console.error('Unhandled Rejection:', err));

import routes from './routes/index';

const app    = express();
const PORT   = process.env.PORT || 5000;
const server = http.createServer(app);

// ── CORS ──────────────────────────────────────────────────────────────────────
// In production set CORS_ORIGIN=https://your-frontend.vercel.app
// Multiple origins: CORS_ORIGIN=https://app1.vercel.app,https://app2.vercel.app
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman) or matching origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Database ──────────────────────────────────────────────────────────────────
const connectDB = async () => {
    try {
        await (mongoose.connect as any)(
            process.env.MONGODB_URI || 'mongodb://localhost:27017/dog-adoption-platform'
        );
        console.log('✅ Connected to MongoDB Atlas');
    } catch (err: any) {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    }
};
connectDB();

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));
app.use('/api', routes());

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Express error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
server.listen(PORT, () => console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`));
