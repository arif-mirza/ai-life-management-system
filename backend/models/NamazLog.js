const mongoose = require('mongoose');

const prayerStatusEnum = ['Present', 'Absent', 'Kaza'];

const namazLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String, // "YYYY-MM-DD"
    required: [true, 'Date is required'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD']
  },
  fajr:   { type: String, enum: prayerStatusEnum, default: 'Absent' },
  zuhar:  { type: String, enum: prayerStatusEnum, default: 'Absent' },
  asar:   { type: String, enum: prayerStatusEnum, default: 'Absent' },
  magrib: { type: String, enum: prayerStatusEnum, default: 'Absent' },
  isha:   { type: String, enum: prayerStatusEnum, default: 'Absent' }
}, { timestamps: true });

// One entry per user per day
namazLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('NamazLog', namazLogSchema);
