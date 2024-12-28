const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');

// Get user's notifications
router.get('/', auth, getUserNotifications);

// Mark notification as read
router.put('/:id/read', auth, markAsRead);

// Mark all notifications as read
router.put('/read-all', auth, markAllAsRead);

module.exports = router;
