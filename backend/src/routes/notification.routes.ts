import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { protect } from '../middlewares/auth';

const router = Router();
const notificationController = new NotificationController();

router.use(protect); // All notification routes require authentication

router.get('/', (req, res) => notificationController.getMyNotifications(req, res));
router.put('/:id/read', (req, res) => notificationController.markAsRead(req, res));
router.put('/read-all', (req, res) => notificationController.markAllAsRead(req, res));
router.delete('/:id', (req, res) => notificationController.deleteNotification(req, res));

export default router;
