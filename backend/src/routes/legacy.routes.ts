// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  DEPRECATED LEGACY ROUTES (V1) — DO NOT USE IN NEW CODE
// ─────────────────────────────────────────────────────────────────────────────
// These routes use legacy v1 models and are kept ONLY for backward compatibility.
// 
// New frontend code should use:
//   - POST /api/auth/register (instead of /api/donors/register or /api/adopters/register)
//   - POST /api/auth/login
//   - GET/POST /api/dogs-v2 (instead of /api/dogs)
//   - GET/POST /api/applications (instead of /api/adopters/adopt)
// ─────────────────────────────────────────────────────────────────────────────

import { Router } from 'express';
import { DonorController, AdopterController } from '../controllers/index';
import multer from 'multer';
import path from 'path';

const router = Router();
const donorController   = new DonorController();
const adopterController = new AdopterController();

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, path.join(__dirname, '../../uploads/')); },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + '-' + Math.random().toString(36).slice(2) + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only image files allowed'));
  }
});

// ── Stats (legacy — use v2 /stats from routes/index.ts) ───────────────────

// ── Dogs ──────────────────────────────────────────────────────────────────────
router.get('/dogs',     (req, res) => donorController.listDogs(req, res));
router.get('/dogs/:id', (req, res) => donorController.getDogDetails(req, res));

// ── Donors ────────────────────────────────────────────────────────────────────
router.post('/donors/register',         (req, res) => donorController.registerDonor(req, res));
router.get('/donors/:donorId/dogs',     (req, res) => donorController.getDonorDogs(req, res));
router.post('/donors/:donorId/dogs',    upload.single('image'), (req, res) => donorController.addDog(req, res));

// ── Adopters ──────────────────────────────────────────────────────────────────
router.post('/adopters/register',                    (req, res) => adopterController.registerAdopter(req, res));
router.get('/adopters/browse',                       (req, res) => adopterController.browseDogs(req, res));
router.post('/adopters/adopt',                       (req, res) => adopterController.sendAdoptionRequest(req, res));
router.get('/adopters/requests/dog/:dogId',          (req, res) => adopterController.getRequestsByDog(req, res));

export default router;
