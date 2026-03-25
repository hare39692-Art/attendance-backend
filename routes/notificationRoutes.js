const express = require('express');
const router = express.Router();
const { sendToUser, sendToMany } = require('../controllers/notificationController');
const protect = require('../middleware/authMiddleware');

// Test send notification to yourself
router.post('/test-send', protect(['admin', 'teacher', 'student']), async (req, res) => {
  try {
    const { title, body } = req.body;
    await sendToUser(
      req.user.id,
      title || '🔔 Test Notification',
      body || 'This is a test notification from your attendance app!'
    );
    res.json({ message: '✅ Test notification sent to you' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check if user has FCM token
router.get('/check-token', protect(['admin', 'teacher', 'student']), async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    res.json({
      hasToken: !!user.fcmToken,
      token: user.fcmToken ? user.fcmToken.substring(0, 20) + '...' : null,
      message: user.fcmToken 
        ? '✅ FCM token found. Notifications should work!'
        : '❌ No FCM token. Student needs to login on mobile app to register device.'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
