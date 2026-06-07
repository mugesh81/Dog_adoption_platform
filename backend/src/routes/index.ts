import { Router } from 'express';
import authRoutes from './auth.routes';
import dogRoutes from './dog.routes';
import applicationRoutes from './application.routes';
import legacyRoutes from './legacy.routes';

const router = Router();

// ── Health ──────────────────────────────────────────────────────────────
router.get('/health', (req, res) => res.json({ status: 'API is running, V2 Upgrade Active' }));

// ── Mount Routes ────────────────────────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/dogs-v2', dogRoutes); // Rename v2 dog routes so it doesn't conflict with legacy `/dogs` if needed, or mount legacyRoutes on root
router.use('/applications', applicationRoutes);
router.use('/', legacyRoutes); // Mount legacy routes at root since they have paths like /donors, /adopters, /dogs

export default () => router;
