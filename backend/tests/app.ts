/**
 * Test-only Express app — no DB connection, no server.listen()
 * Reuses the same routes as the real app.
 */
import express from 'express';
import routes from '../src/routes/index';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/health', (_req, res) => res.json({ status: 'API is running' }));
app.use('/api', routes());

export default app;
