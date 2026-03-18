const mongoose = require('mongoose');

const seHubTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [140, 'Task title cannot exceed 140 characters']
  },
  category: {
    type: String,
    enum: ['Frontend', 'Backend', 'DevOps', 'Interview Prep', 'System Design', 'Project', 'Core CS', 'Other'],
    default: 'Other'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  details: {
    type: String,
    trim: true,
    maxlength: [220, 'Details cannot exceed 220 characters']
  },
  completedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

const seHubSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  tasks: [seHubTaskSchema]
}, { timestamps: true });

module.exports = mongoose.model('SEHub', seHubSchema);
