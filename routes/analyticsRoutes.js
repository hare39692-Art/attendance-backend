const router  = require('express').Router();
const protect = require('../middleware/authMiddleware');
const { getLowAttendance } = require('../controllers/analyticsController');

router.get('/low-attendance', protect(['admin', 'teacher']), getLowAttendance);

module.exports = router;