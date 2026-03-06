const router  = require('express').Router();
const protect = require('../middleware/authMiddleware');
const {
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent,
  getTeachers,
  getStats,
  bulkImportStudents,
} = require('../controllers/studentController');

router.post('/',            protect(['admin']),                  createStudent);
router.get('/',             protect(['admin', 'teacher']),       getStudents);
router.put('/:id',          protect(['admin']),                  updateStudent);
router.delete('/:id',       protect(['admin']),                  deleteStudent);
router.get('/teachers',     protect(['admin']),                  getTeachers);
router.get('/stats',        protect(['admin']),                  getStats);
router.post('/bulk-import', protect(['admin', 'teacher']),       bulkImportStudents);

module.exports = router;