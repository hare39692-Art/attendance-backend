const Subject = require('../models/Subject');
const Student = require('../models/Student');
const User    = require('../models/User');

// Create subject (admin only)
exports.createSubject = async (req, res) => {
  try {
    const { name, code, teacherId, class: cls, section } = req.body;
    if (!name || !code || !teacherId || !cls || !section)
      return res.status(400).json({ message: 'All fields are required' });

    let teacher;
    try { teacher = await User.findById(teacherId); } catch (_) {
      return res.status(400).json({ message: 'Invalid teacherId format' });
    }
    if (!teacher || teacher.role !== 'teacher')
      return res.status(400).json({ message: 'Invalid teacher ID' });

    const existing = await Subject.findOne({ code });
    if (existing) return res.status(400).json({ message: 'Subject code already exists' });

    const subject = await Subject.create({ name, code, teacherId, class: cls, section });
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all subjects (admin) or filtered
exports.getSubjects = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'teacher') filter.teacherId = req.user.id;
    if (req.query.class)   filter.class   = req.query.class;
    if (req.query.section) filter.section = req.query.section;
    const subjects = await Subject.find(filter).populate('teacherId', 'name email');
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get MY subjects (teacher only)
exports.getMySubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ teacherId: req.user.id })
        .populate('teacherId', 'name email');
    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get students for a class/section
exports.getStudentsForClass = async (req, res) => {
  try {
    const { class: cls, section } = req.params;
    const students = await Student.find({
      class: cls, section
    }).sort({ rollNo: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update subject
exports.updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
        req.params.id, req.body, { new: true });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete subject
exports.deleteSubject = async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 