const mongoose = require('mongoose');

const diaryEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: { type: Date, required: true },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [120, 'Title cannot exceed 120 characters']
  },
  mood: {
    type: String,
    enum: ['Neutral', 'Focused', 'Calm', 'Energetic', 'Tired', 'Happy', 'Grateful', 'Stressed', 'Sad'],
    default: 'Neutral'
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [5000, 'Content too long']
  }
}, { timestamps: true });

module.exports = mongoose.model('DiaryEntry', diaryEntrySchema);
