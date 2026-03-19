const express = require('express');
const router  = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  markAttendance, markAttendanceByQR,
  getStudentReport, getSmartAnalytics,
  setCollegeLocation, getCollegeLocation,
  getClassReport, resetAllAttendance,
} = require('../controllers/attendanceController');

router.post('/mark',                protect(['teacher', 'admin']),           markAttendance);
router.post('/mark-qr',             protect(['student']),                    markAttendanceByQR);
router.get('/report/:studentId',    protect(['admin', 'teacher', 'student']),getStudentReport);
router.get('/analytics/:studentId', protect(['admin', 'teacher', 'student']),getSmartAnalytics);
router.post('/location',            protect(['admin']),                      setCollegeLocation);
router.get('/location',             protect(['admin', 'teacher', 'student']),getCollegeLocation);
router.get('/class-report/:subjectId', protect(['teacher', 'admin']),        getClassReport);
router.delete('/reset-all',         protect(['admin']),                      resetAllAttendance);

module.exports = router;
