const Attendance = require('../models/Attendance');
const Student    = require('../models/Student');
const { sendToMany } = require('./notificationController');

// Mark bulk attendance for a class
exports.markAttendance = async (req, res) => {
  try {
    const { subjectId, date, records } = req.body;
    // records = [{ studentId, status }]
    const docs = records.map(r => ({
      studentId: r.studentId,
      subjectId,
      teacherId: req.user.id,
      date: new Date(date),
      status: r.status,
    }));

    await Attendance.insertMany(docs);
    
    // Send notifications to all marked students
    const studentIds = records.map(r => r.studentId);
    const students = await Student.find({ _id: { $in: studentIds } })
      .populate('userId', 'name');
    
    const userIds = students
      .filter(s => s.userId)
      .map(s => s.userId._id);
    
    if (userIds.length > 0) {
      await sendToMany(
        userIds,
        '📋 Attendance Marked',
        `Your attendance for today has been marked.`,
        { type: 'attendance', subjectId }
      );
      console.log(`✅ Notifications sent to ${userIds.length} students`);
    }
    
    res.status(201).json({ 
      message: 'Attendance marked successfully ✅',
      notificationsSent: userIds.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get attendance report for a student
exports.getStudentReport = async (req, res) => {
  try {
    const { studentId } = req.params;

    // First try finding student by _id directly
    let student = null;
    try {
      student = await Student.findById(studentId);
    } catch (_) {}

    // If not found, try finding by userId (login account id)
    if (!student) {
      student = await Student.findOne({ userId: studentId });
    }

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const records = await Attendance.find({ studentId: student._id })
      .populate('subjectId', 'name code');

    const summary = {};
    records.forEach(r => {
      if (!r.subjectId) return;
      const key = r.subjectId.code;
      if (!summary[key]) {
        summary[key] = { name: r.subjectId.name, total: 0, present: 0 };
      }
      summary[key].total++;
      if (r.status === 'present') summary[key].present++;
    });

    const result = Object.entries(summary).map(([code, val]) => ({
      code,
      name: val.name,
      total: val.total,
      present: val.present,
      percentage: ((val.present / val.total) * 100).toFixed(1),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Smart Analytics - Classes needed + prediction
exports.getSmartAnalytics = async (req, res) => {
  try {
    const { studentId } = req.params;
    const threshold = parseFloat(req.query.threshold) || 75;

    let student = null;
    try { student = await Student.findById(studentId); } catch (_) {}
    if (!student) student = await Student.findOne({ userId: studentId });
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const records = await Attendance.find({ studentId: student._id })
      .populate('subjectId', 'name code');

    const summary = {};
    records.forEach(r => {
      if (!r.subjectId) return;
      const key = r.subjectId.code;
      if (!summary[key]) summary[key] = { name: r.subjectId.name, total: 0, present: 0 };
      summary[key].total++;
      if (r.status === 'present') summary[key].present++;
    });

    const result = Object.entries(summary).map(([code, val]) => {
      const percentage = (val.present / val.total) * 100;

      // Classes needed to reach threshold
      let classesNeeded = 0;
      if (percentage < threshold) {
        // Formula: (present + x) / (total + x) = threshold/100
        // Solving: x = (threshold*total - 100*present) / (100 - threshold)
        classesNeeded = Math.ceil(
          (threshold * val.total - 100 * val.present) / (100 - threshold)
        );
      }

      // Classes can afford to miss
      let canMiss = 0;
      if (percentage >= threshold) {
        // Formula: (present) / (total + x) = threshold/100
        // Solving: x = (100*present/threshold) - total
        canMiss = Math.floor(
          (100 * val.present / threshold) - val.total
        );
      }

      return {
        code,
        name: val.name,
        total: val.total,
        present: val.present,
        percentage: parseFloat(percentage.toFixed(1)),
        classesNeeded,
        canMiss,
        status: percentage >= threshold ? 'safe' : 'danger',
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Mark attendance via QR code scan
exports.markAttendanceByQR = async (req, res) => {
  try {
    const { subjectId, date, studentUserId } = req.body;

    // Find student profile using userId
    let student = await Student.findOne({ userId: studentUserId });
    if (!student) {
      try { student = await Student.findById(studentUserId); } catch (_) {}
    }
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Check if already marked today
    const existing = await Attendance.findOne({
      studentId: student._id,
      subjectId,
      date: new Date(date),
    });
    if (existing) {
      return res.status(400).json({ message: 'Attendance already marked for today!' });
    }

    await Attendance.create({
      studentId: student._id,
      subjectId,
      teacherId: req.user.id,
      date: new Date(date),
      status: 'present',
    });

    // Send notification to this student
    const user = await Student.findById(student._id).populate('userId');
    if (user?.userId) {
      await sendToMany(
        [user.userId._id],
        '✅ Attendance Marked',
        `Attendance marked present for today`,
        { type: 'attendance_qr', subjectId }
      );
    }

    res.status(201).json({ message: `✅ Attendance marked for ${student.name}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Save college location (admin only)
exports.setCollegeLocation = async (req, res) => {
  try {
    const { latitude, longitude, radius, name } = req.body;
    const Setting = require('../models/Setting');
    await Setting.findOneAndUpdate(
      { key: 'college_location' },
      { key: 'college_location', value: { latitude, longitude, radius, name } },
      { upsert: true, new: true }
    );
    res.json({ message: '✅ College location saved!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get college location
exports.getCollegeLocation = async (req, res) => {
  try {
    const Setting = require('../models/Setting');
    const setting = await Setting.findOne({ key: 'college_location' });
    if (!setting) return res.status(404).json({ message: 'Location not set yet' });
    res.json(setting.value);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ── Get class attendance report ───────────────────────────────────────────────
exports.getClassReport = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    const Student = require('../models/Student');
    const students = await Student.find({
      class: subject.class, section: subject.section
    }).sort({ rollNo: 1 });

    const report = [];
    for (const student of students) {
      const total   = await Attendance.countDocuments({ studentId: student._id, subjectId });
      const present = await Attendance.countDocuments({ studentId: student._id, subjectId, status: 'present' });
      const percentage = total > 0 ? Math.round((present / total) * 1000) / 10 : 0;
      report.push({
        studentId:  student._id,
        name:       student.name,
        rollNo:     student.rollNo,
        total, present, percentage,
        status: percentage >= 75 ? 'safe' : 'danger',
      });
    }
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Reset ALL attendance ──────────────────────────────────────────────────────
exports.resetAllAttendance = async (req, res) => {
  try {
    const result = await Attendance.deleteMany({});
    res.json({
      message: `✅ Successfully reset! Deleted ${result.deletedCount} attendance records.`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};