const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true,
    maxlength: [150, 'Title too long']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['General', 'Goal', 'Reflection', 'Idea', 'Journal', 'Quote'],
    default: 'General'
  },
  relatedGoal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    default: null
  },
  tags: [{ type: String, trim: true }],
  isPinned: { type: Boolean, default: false },
  color: { type: String, default: '#FFFFFF' }
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
