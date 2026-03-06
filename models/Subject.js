const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  code:      { type: String, required: true, unique: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  class:     { type: String, required: true },
  section:   { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);