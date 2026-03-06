const router  = require('express').Router();
const protect = require('../middleware/authMiddleware');
const {
  createSubject,
  getSubjects,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');

router.post('/',         protect(['admin']),                    createSubject);
router.get('/',          protect(['admin', 'teacher']),         getSubjects);
router.put('/:id',       protect(['admin']),                    updateSubject);
router.delete('/:id',    protect(['admin']),                    deleteSubject);

module.exports = router;
