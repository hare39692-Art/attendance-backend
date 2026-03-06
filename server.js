require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/analytics',  require('./routes/analyticsRoutes'));
app.use('/api/subjects',   require('./routes/subjectRoutes'));   // NEW
app.use('/api/students',   require('./routes/studentRoutes'));   // NEW

app.get('/', (req, res) => res.send('Attendance Analyzer API Running 🚀'));

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);
