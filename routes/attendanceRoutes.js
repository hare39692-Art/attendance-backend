const router  = require('express').Router();
const protect = require('../middleware/authMiddleware');
const {
  markAttendance,
  markAttendanceByQR,
  getStudentReport,
  getSmartAnalytics,
  setCollegeLocation,
  getCollegeLocation,
} = require('../controllers/attendanceController');

router.post('/mark',                protect(['teacher', 'admin']),            markAttendance);
router.post('/mark-qr',             protect(['student']),                      markAttendanceByQR);
router.get('/report/:studentId',    protect(['admin', 'teacher', 'student']), getStudentReport);
router.get('/analytics/:studentId', protect(['admin', 'teacher', 'student']), getSmartAnalytics);
router.post('/location',            protect(['admin']),                        setCollegeLocation);
router.get('/location',             protect(['admin', 'teacher', 'student']), getCollegeLocation);

module.exports = router;