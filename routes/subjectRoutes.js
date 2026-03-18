const router  = require('express').Router();
const protect = require('../middleware/authMiddleware');
const {
  createSubject,
  getSubjects,
  getMySubjects,
  deleteSubject,
  getStudentsForClass,
} = require('../controllers/subjectController');

// ⚠️ Specific routes BEFORE /:id wildcard!
router.get('/my',                       protect(['teacher']),          getMySubjects);
router.get('/students/:class/:section', protect(['admin', 'teacher']), getStudentsForClass);
router.get('/',                         protect(['admin', 'teacher']), getSubjects);
router.post('/',                        protect(['admin']),             createSubject);
router.delete('/:id',                   protect(['admin']),             deleteSubject);

module.exports = router;