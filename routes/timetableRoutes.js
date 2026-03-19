const express = require('express');
const router  = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getTimetable, getTodayTimetable,
  addSlot, deleteSlot, checkAttendanceAllowed,
} = require('../controllers/timetableController');

router.get('/',                         protect(['admin', 'teacher']), getTimetable);
router.get('/today',                    protect(['teacher']),          getTodayTimetable);
router.get('/check/:subjectId',         protect(['teacher']),          checkAttendanceAllowed);
router.post('/',                        protect(['admin']),             addSlot);
router.delete('/:id',                   protect(['admin']),             deleteSlot);

module.exports = router;
