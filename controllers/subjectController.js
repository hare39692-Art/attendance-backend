const Subject = require('../models/Subject');
const User    = require('../models/User');

// Create a new subject (admin only)
exports.createSubject = async (req, res) => {
  try {
    const { name, code, teacherId, class: cls, section } = req.body;

    if (!name || !code || !teacherId || !cls || !section) {
      return res.status(400).json({ message: 'All fields are required: name, code, teacherId, class, section' });
    }

    // Validate teacher exists
    let teacher;
    try {
      teacher = await User.findById(teacherId);
    } catch (_) {
      return res.status(400).json({ message: 'Invalid teacherId format' });
    }
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'Invalid teacher ID — make sure the teacher is registered' });
    }

    const existing = await Subject.findOne({ code });
    if (existing) return res.status(400).json({ message: 'Subject code already exists' });

    const subject = await Subject.create({ name, code, teacherId, class: cls, section });
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all subjects (admin) or subjects for a specific teacher
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

// Update subject
exports.updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
exports.bulkImportStudents = async (req, res) => {
  try {
    const { students } = req.body;
    const results = { success: 0, failed: 0, errors: [] };
    const bcrypt = require('bcryptjs');
    const User = require('../models/User');
    const Student = require('../models/Student');

    for (const s of students) {
      try {
        const exists = await User.findOne({ email: s.email });
        if (exists) {
          results.failed++;
          results.errors.push(`${s.email} already exists`);
          continue;
        }

        const hashed = await bcrypt.hash(s.password || '123456', 10);
        const user = await User.create({
          name: s.name,
          email: s.email,
          password: hashed,
          role: 'student'
        });

        await Student.create({
          userId: user._id,
          name: s.name,
          rollNo: s.rollNo,
          class: s.class,
          section: s.section,
          email: s.email,
        });

        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push(`${s.name}: ${err.message}`);
      }
    }

    res.status(201).json({
      message: `✅ Imported ${results.success} students, ${results.failed} failed`,
      ...results
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};