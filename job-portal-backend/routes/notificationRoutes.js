import express from 'express';
import Notification from '../models/Notification.js';

const router = express.Router();

// GET /api/notifications/:userId - get notifications for a user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/notifications/:id/read - mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

