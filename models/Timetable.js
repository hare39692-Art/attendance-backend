const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  day:       { type: String, required: true,
               enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] },
  period:    { type: String, required: true },
  startTime: { type: String, required: true },
  endTime:   { type: String, required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  className: { type: String, required: true },
  section:   { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
