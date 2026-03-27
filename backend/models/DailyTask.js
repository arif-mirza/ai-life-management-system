const mongoose = require('mongoose');

const dailyTaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [300, 'Title too long']
  },
  date: {
    type: String, // stored as "YYYY-MM-DD"
    required: [true, 'Date is required'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD']
  },
  category: {
    type: String,
    enum: ['Career', 'Learning', 'Health', 'Finance', 'Personal Growth', 'Other'],
    default: 'Other'
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'paused'],
    default: 'not-started'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes too long'],
    default: ''
  }
}, { timestamps: true });

// Compound index for fast per-user per-day queries
dailyTaskSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('DailyTask', dailyTaskSchema);
