import { Request, Response } from 'express';
import { Notification, NotificationType } from '../models/Notification';
import { AdoptionApplication } from '../models/AdoptionApplication';
import { Dog } from '../models/Dog';

export class NotificationController {
  // Get all notifications for logged-in user
  async getMyNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { unreadOnly } = req.query;

      const filter: any = { userId };
      if (unreadOnly === 'true') {
        filter.read = false;
      }

      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(50);

      const unreadCount = await Notification.countDocuments({ userId, read: false });

      res.status(200).json({
        success: true,
        data: notifications,
        unreadCount,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Mark notification as read
  async markAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const notification = await Notification.findOne({ _id: id, userId });
      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      notification.read = true;
      await notification.save();

      res.status(200).json({ success: true, data: notification });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      await Notification.updateMany(
        { userId, read: false },
        { read: true }
      );

      res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Delete a notification
  async deleteNotification(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const notification = await Notification.findOneAndDelete({ _id: id, userId });
      if (!notification) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      res.status(200).json({ success: true, message: 'Notification deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Helper method to create notifications (used by other controllers)
  static async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    relatedApplication?: string,
    relatedDog?: string
  ) {
    try {
      await Notification.create({
        userId,
        type,
        title,
        message,
        relatedApplication,
        relatedDog,
        read: false,
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }
}
