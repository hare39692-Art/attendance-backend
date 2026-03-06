const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  date:      { type: Date, required: true },
  status:    { type: String, enum: ['present', 'absent', 'late'], required: true },
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);