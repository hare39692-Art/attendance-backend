const express = require('express');
const router  = express.Router();
const { login, createAdmin, changePassword, getProfile } = require('../controllers/authController');
const { saveFcmToken } = require('../controllers/notificationController');
const protect = require('../middleware/authMiddleware');

router.post('/login',           login);
router.post('/create-admin',    protect(['admin']), createAdmin);
router.put('/change-password',  protect(['admin', 'teacher', 'student']), changePassword);
router.get('/profile',          protect(['admin', 'teacher', 'student']), getProfile);
router.post('/save-fcm-token',  protect(['admin', 'teacher', 'student']), saveFcmToken);

module.exports = router;