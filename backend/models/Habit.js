const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  value: { type: Number, default: 1 }, // hours, reps, or 1 for boolean
  note: { type: String, trim: true }
});

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Habit name is required'],
    trim: true,
    maxlength: [80, 'Name too long']
  },
  description: { type: String, trim: true },
  icon: { type: String, default: '⭐' },
  color: { type: String, default: '#2D6A4F' },
  category: {
    type: String,
    enum: ['Health', 'Learning', 'Productivity', 'Mindfulness', 'Finance', 'Social', 'Other'],
    default: 'Other'
  },
  type: {
    type: String,
    enum: ['boolean', 'quantity'],
    default: 'boolean'
  },
  unit: { type: String, default: '' }, // e.g., 'hours', 'pages', 'km'
  targetValue: { type: Number, default: 1 },
  frequency: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'daily'
  },
  targetDays: [{ type: Number, min: 0, max: 6 }], // 0=Sun, 6=Sat
  logs: [habitLogSchema],
  isActive: { type: Boolean, default: true },
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  startDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
