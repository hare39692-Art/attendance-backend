const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  rollNo:      { type: String, required: true, unique: true },
  class:       { type: String, required: true },
  section:     { type: String, required: true },
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parentEmail: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);