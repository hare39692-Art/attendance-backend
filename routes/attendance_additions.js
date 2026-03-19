// ADD THESE to your attendanceController.js

// ── Get class attendance report (teacher) ─────────────────────────────────────
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

// ── Reset ALL attendance (admin only) ─────────────────────────────────────────
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
    