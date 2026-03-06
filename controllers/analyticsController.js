const Attendance = require('../models/Attendance');
const Student    = require('../models/Student');

// Get students with attendance below threshold (default 75%)
exports.getLowAttendance = async (req, res) => {
  try {
    const threshold = parseFloat(req.query.threshold) || 75;

    const students = await Student.find();
    const alerts = [];

    for (const student of students) {
      const records = await Attendance.find({ studentId: student._id });
      if (records.length === 0) continue;

      const present = records.filter(r => r.status === 'present').length;
      const percentage = (present / records.length) * 100;

      if (percentage < threshold) {
        alerts.push({
          studentId: student._id,
          name: student.name,
          rollNo: student.rollNo,
          class: student.class,
          section: student.section,
          percentage: percentage.toFixed(1),
        });
      }
    }

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};