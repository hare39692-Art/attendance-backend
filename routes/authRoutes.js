const express = require('express');
const router  = express.Router();
const { login, createAdmin, changePassword, getProfile } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

router.post('/login',           login);
router.post('/create-admin',    protect(['admin']), createAdmin);
router.put('/change-password',  protect(['admin', 'teacher', 'student']), changePassword);
router.get('/profile',          protect(['admin', 'teacher', 'student']), getProfile);

module.exports = router;
