const Student = require('../models/Student');
const User    = require('../models/User');
const bcrypt  = require('bcryptjs');

// Create student
exports.createStudent = async (req, res) => {
  try {
    const { name, rollNo, class: cls, section, email, parentEmail, password } = req.body;

    const dupRoll  = await Student.findOne({ rollNo });
    if (dupRoll) return res.status(400).json({ message: 'Roll number already exists' });

    const dupEmail = await User.findOne({ email });
    if (dupEmail) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(String(password || '123456'), 10);
    const user   = await User.create({ name, email, password: hashed, role: 'student' });

    const student = await Student.create({ name, rollNo, class: cls, section, userId: user._id, parentEmail });
    res.status(201).json({ student, userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all students
exports.getStudents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.class)   filter.class   = req.query.class;
    if (req.query.section) filter.section = req.query.section;
    const students = await Student.find(filter).sort({ rollNo: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (student?.userId) await User.findByIdAndDelete(student.userId);
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all teachers
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }, 'name email _id');
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get dashboard stats
exports.getStats = async (req, res) => {
  try {
    const [students, teachers, subjects] = await Promise.all([
      Student.countDocuments(),
      User.countDocuments({ role: 'teacher' }),
      require('../models/Subject').countDocuments(),
    ]);
    res.json({ students, teachers, subjects });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Bulk import students from Excel
exports.bulkImportStudents = async (req, res) => {
  try {
    const { students } = req.body;
    const results = { success: 0, failed: 0, errors: [] };

    for (const s of students) {
      try {
        const exists = await User.findOne({ email: s.email });
        if (exists) {
          results.failed++;
          results.errors.push(`${s.email} already exists`);
          continue;
        }

        const hashed = await bcrypt.hash(String(s.password || '123456'), 10);
        const user = await User.create({
          name:     s.name,
          email:    s.email,
          password: hashed,
          role:     'student',
        });

        await Student.create({
          userId:  user._id,
          name:    s.name,
          rollNo:  s.rollNo,
          class:   s.class,
          section: s.section,
        });

        results.success++;
      } catch (err) {
        results.failed++;
        results.errors.push(`${s.name}: ${err.message}`);
      }
    }

    res.status(201).json({
      message: `✅ Imported ${results.success} students, ${results.failed} failed`,
      ...results,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};