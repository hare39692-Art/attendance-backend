require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');
const { initFirebase } = require('./controllers/notificationController');

const app = express();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected ✅'))
  .catch((err) => console.log('DB Connection Failed ❌', err.message));

initFirebase();

app.use(cors());
app.use(express.json());

app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/analytics',  require('./routes/analyticsRoutes'));
app.use('/api/subjects',   require('./routes/subjectRoutes'));
app.use('/api/students',   require('./routes/studentRoutes'));
app.use('/api/timetable',  require('./routes/timetableRoutes')); // ← NEW

app.get('/', (req, res) => res.send('Attendance Analyzer API 🚀'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`Server running on port ${PORT}`)
);
