import { Router, Response } from 'express';
import { db } from '../db';
import { authenticateToken, AuthRequest } from '../auth';

const router = Router();

// GET notifications for current user
router.get('/', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const notifications = db.getNotifications(req.user.id, req.user.student_id);
    const unreadCount = notifications.filter(n => !n.is_read).length;

    res.json({ success: true, count: notifications.length, unreadCount, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching notifications' });
  }
});

// Mark single notification as read
router.put('/:id/read', authenticateToken, (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const success = db.markNotificationAsRead(id);
  if (!success) {
    res.status(404).json({ success: false, message: 'Notification not found' });
    return;
  }
  res.json({ success: true, message: 'Notification marked as read' });
});

// Mark all as read
router.put('/read-all', authenticateToken, (req: AuthRequest, res: Response) => {
  if (req.user) {
    db.markAllNotificationsAsRead(req.user.id);
  }
  res.json({ success: true, message: 'All notifications marked as read' });
});

export default router;
