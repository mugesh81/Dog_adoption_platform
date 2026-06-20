import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { DogController } from '../controllers/dog.controller';
import { protect, authorize } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = Router();
const dogController = new DogController();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + '-' + Math.random().toString(36).slice(2) + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only image files allowed'));
  },
});

router.get('/', (req, res) => dogController.getDogs(req, res));
router.get('/my-listings', protect, authorize(UserRole.DONOR, UserRole.SHELTER, UserRole.ADMIN), (req, res) => dogController.getMyListings(req, res));
router.get('/:id', (req, res) => dogController.getDogById(req, res));
router.post(
  '/',
  protect,
  authorize(UserRole.DONOR, UserRole.SHELTER, UserRole.ADMIN),
  upload.single('image'),
  (req, res) => dogController.createDog(req, res)
);
router.put(
  '/:id',
  protect,
  authorize(UserRole.DONOR, UserRole.SHELTER, UserRole.ADMIN),
  upload.single('image'),
  (req, res) => dogController.updateDog(req, res)
);
router.delete(
  '/:id',
  protect,
  authorize(UserRole.DONOR, UserRole.SHELTER, UserRole.ADMIN),
  (req, res) => dogController.deleteDog(req, res)
);
router.patch(
  '/:id/adopted',
  protect,
  authorize(UserRole.DONOR, UserRole.SHELTER, UserRole.ADMIN),
  (req, res) => dogController.toggleAdoptedStatus(req, res)
);

export default router;
