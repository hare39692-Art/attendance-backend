const Timetable  = require('../models/Timetable');
const Attendance = require('../models/Attendance');

// Get all timetable slots
exports.getTimetable = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'teacher') filter.teacherId = req.user.id;
    const slots = await Timetable.find(filter)
        .populate('subjectId', 'name code class section')
        .sort({ day: 1, startTime: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get today's timetable for teacher
exports.getTodayTimetable = async (req, res) => {
  try {
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const today = days[new Date().getDay()];
    const slots = await Timetable.find({ teacherId: req.user.id, day: today })
        .populate('subjectId', 'name code class section')
        .sort({ startTime: 1 });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add slot
exports.addSlot = async (req, res) => {
  try {
    const { day, period, startTime, endTime, subjectId, teacherId, className, section } = req.body;
    const slot = await Timetable.create({
      day, period, startTime, endTime, subjectId, teacherId, className, section
    });
    const populated = await Timetable.findById(slot._id)
        .populate('subjectId', 'name code class section');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete slot
exports.deleteSlot = async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ message: 'Slot deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Check if teacher can mark attendance for subject today
// Returns: { allowed: true/false, markedCount: 0, allowedCount: 2, message: '...' }
exports.checkAttendanceAllowed = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const today = new Date();
    const days  = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const dayName = days[today.getDay()];
    const dateStr = today.toISOString().split('T')[0];

    // How many periods for this subject today in timetable?
    const timetableCount = await Timetable.countDocuments({
      subjectId, teacherId: req.user.id, day: dayName
    });

    if (timetableCount === 0) {
      return res.json({
        allowed: false, markedCount: 0, allowedCount: 0,
        message: `No ${dayName} period scheduled for this subject today`,
      });
    }

    // How many times attendance already marked today?
    const Student = require('../models/Student');
    const Subject = require('../models/Subject');
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    // Count unique attendance sessions today (by counting distinct dates with same subjectId)
    // We use a workaround: count records for one student today
    const students = await Student.find({ class: subject.class, section: subject.section });
    if (students.length === 0) {
      return res.json({
        allowed: true, markedCount: 0, allowedCount: timetableCount,
        message: `You can mark attendance ${timetableCount} time(s) today`,
      });
    }

    // Count how many sessions were marked today for this subject
    // Each session marks ALL students, so count = total records / students count
    const totalRecordsToday = await Attendance.countDocuments({
      subjectId,
      date: {
        $gte: new Date(dateStr + 'T00:00:00.000Z'),
        $lte: new Date(dateStr + 'T23:59:59.999Z'),
      }
    });

    const markedCount = students.length > 0
        ? Math.floor(totalRecordsToday / students.length)
        : 0;

    const allowed = markedCount < timetableCount;

    res.json({
      allowed,
      markedCount,
      allowedCount: timetableCount,
      message: allowed
          ? `You can mark attendance ${timetableCount - markedCount} more time(s) today`
          : `Already marked ${markedCount}/${timetableCount} periods today. No more allowed!`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
