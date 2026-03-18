const mongoose = require('mongoose');

const monthlyTargetSchema = new mongoose.Schema({
  month: { type: Number, min: 1, max: 12, required: true },
  target: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date }
});

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['Career', 'Health', 'Finance', 'Learning', 'Personal Growth', 'Relationships', 'Travel', 'Other'],
    default: 'Other'
  },
  year: {
    type: Number,
    required: true,
    min: 2020,
    max: 2050
  },
  monthlyTargets: [monthlyTargetSchema],
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
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  dueDate: { type: Date },
  completedAt: { type: Date },
  tags: [{ type: String, trim: true }]
}, { timestamps: true });

// Auto-calculate progress from monthly targets
goalSchema.pre('save', function(next) {
  if (this.monthlyTargets && this.monthlyTargets.length > 0) {
    const completed = this.monthlyTargets.filter(t => t.completed).length;
    this.progress = Math.round((completed / this.monthlyTargets.length) * 100);
  }
  if (this.progress === 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.completedAt = new Date();
  } else if (this.progress > 0 && this.status === 'not-started') {
    this.status = 'in-progress';
  }
  next();
});

module.exports = mongoose.model('Goal', goalSchema);
