const express = require('express');
const router  = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  createStudent, createTeacher,
  getStudents,   getTeachers,
  updateStudent, deleteStudent, deleteTeacher,
  getStats,      bulkImportStudents,
} = require('../controllers/studentController');

router.get('/stats',        protect(['admin']),                  getStats);
router.get('/teachers',     protect(['admin', 'teacher']),       getTeachers);
router.post('/teachers',    protect(['admin']),                  createTeacher);
router.delete('/teachers/:id', protect(['admin']),               deleteTeacher);
router.get('/',             protect(['admin', 'teacher']),       getStudents);
router.post('/',            protect(['admin', 'teacher']),       createStudent);
router.put('/:id',          protect(['admin']),                  updateStudent);
router.delete('/:id',       protect(['admin', 'teacher']),       deleteStudent);
router.post('/bulk-import', protect(['admin', 'teacher']),       bulkImportStudents);

module.exports = router;
