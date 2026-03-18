const Student = require('../models/Student');
const User    = require('../models/User');
const bcrypt  = require('bcryptjs');

// ── Create Student (teacher + admin) ─────────────────────────────────────────
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

// ── Create Teacher (admin only) ───────────────────────────────────────────────
exports.createTeacher = async (req, res) => {
  try {
    const { name, email, password, subject, phone } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(String(password || '123456'), 10);
    const user = await User.create({
      name, email, password: hashed, role: 'teacher',
      subject: subject || '', phone: phone || ''
    });
    res.status(201).json({
      message: 'Teacher created successfully!',
      teacher: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Get Students ──────────────────────────────────────────────────────────────
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

// ── Update Student ────────────────────────────────────────────────────────────
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Delete Student ────────────────────────────────────────────────────────────
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (student?.userId) await User.findByIdAndDelete(student.userId);
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Delete Teacher ────────────────────────────────────────────────────────────
exports.deleteTeacher = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Teacher deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Get Teachers ──────────────────────────────────────────────────────────────
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }, 'name email subject phone _id');
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Get Stats ─────────────────────────────────────────────────────────────────
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

// ── Bulk Import Students ──────────────────────────────────────────────────────
exports.bulkImportStudents = async (req, res) => {
  try {
    const { students } = req.body;
    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ message: 'No students data provided' });
    }
    const results = { success: 0, failed: 0, errors: [] };
    for (const s of students) {
      try {
        const name    = String(s.name    || '').trim();
        const rollNo  = String(s.rollNo  || '').trim();
        const cls     = String(s.class   || '').trim();
        const section = String(s.section || '').trim();
        const email   = String(s.email   || '').trim().toLowerCase();
        const password = String(s.password || '123456').trim();

        if (!name || !email) {
          results.failed++;
          results.errors.push('Missing name or email');
          continue;
        }
        const exists = await User.findOne({ email });
        if (exists) {
          results.failed++;
          results.errors.push(`${email} already exists`);
          continue;
        }
        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashed, role: 'student' });
        await Student.create({ userId: user._id, name, rollNo, class: cls, section });
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
