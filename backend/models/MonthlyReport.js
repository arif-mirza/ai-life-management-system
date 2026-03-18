const mongoose = require('mongoose');

const monthlyReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  year: { type: Number, required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  goalsCompleted: { type: Number, default: 0 },
  goalsTotal: { type: Number, default: 0 },
  habitsTracked: { type: Number, default: 0 },
  habitCompletionRate: { type: Number, default: 0 }, // percentage
  productivityScore: { type: Number, default: 0 }, // 0-100
  notes: { type: String, trim: true },
  highlights: [{ type: String }],
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

monthlyReportSchema.index({ user: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyReport', monthlyReportSchema);
