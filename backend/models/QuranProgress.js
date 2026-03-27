const mongoose = require('mongoose');

const quranProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  surahId: {
    type: Number,
    required: true,
    min: 1,
    max: 114
  },
  status: {
    type: String,
    enum: ['pending', 'reading', 'done'],
    default: 'pending'
  }
}, { timestamps: true });

// One status entry per surah per user
quranProgressSchema.index({ user: 1, surahId: 1 }, { unique: true });

module.exports = mongoose.model('QuranProgress', quranProgressSchema);
