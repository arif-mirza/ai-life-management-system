const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  totalLectures: { type: Number, default: 0, min: 0 },
  covered: { type: Number, default: 0, min: 0 },
  examDate: { type: Date },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  notes: { type: String, trim: true, maxlength: 500 }
}, { timestamps: true });

const semesterSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 80 },
  year: { type: Number, required: true, min: 2000, max: 2100 },
  examDate: { type: Date },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed'],
    default: 'not-started'
  },
  courses: [courseSchema]
}, { timestamps: true });

const educationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  semesters: [semesterSchema]
}, { timestamps: true });

module.exports = mongoose.model('Education', educationSchema);
