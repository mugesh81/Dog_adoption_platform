import { Router } from 'express';
import authRoutes from './auth.routes';
import dogRoutes from './dog.routes';
import applicationRoutes from './application.routes';
import notificationRoutes from './notification.routes';
import legacyRoutes from './legacy.routes';
import { DogController } from '../controllers/dog.controller';

const router = Router();
const dogController = new DogController();

// ── Health ──────────────────────────────────────────────────────────────
router.get('/health', (req, res) => res.json({ status: 'API is running, V2 Upgrade Active' }));

// ── V2 public stats (before legacy mount) ───────────────────────────────
router.get('/stats', (req, res) => dogController.getPlatformStats(req, res));

// ── V2 Routes (Active) ──────────────────────────────────────────────────
router.use('/auth', authRoutes);
router.use('/dogs-v2', dogRoutes);
router.use('/applications', applicationRoutes);
router.use('/notifications', notificationRoutes);

// ── Legacy V1 Routes (Deprecated, backward compatibility only) ──────────
// Note: Legacy admin endpoints removed — use v2 /api/applications instead
router.use('/', legacyRoutes);

export default () => router;
