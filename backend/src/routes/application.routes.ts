import { Router } from 'express';
import { ApplicationController } from '../controllers/application.controller';
import { protect, authorize } from '../middlewares/auth';
import { UserRole } from '../models/User';

const router = Router();
const applicationController = new ApplicationController();

router.use(protect); // All application routes require authentication

router.post('/', authorize(UserRole.ADOPTER), (req, res) => applicationController.applyForAdoption(req, res));
router.get('/', (req, res) => applicationController.getMyApplications(req, res));
router.put('/:id/status', authorize(UserRole.SHELTER, UserRole.DONOR, UserRole.ADMIN), (req, res) => applicationController.updateApplicationStatus(req, res));

export default router;
