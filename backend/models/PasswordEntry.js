const mongoose = require('mongoose');

const passwordEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    required: [true, 'Platform is required'],
    trim: true,
    maxlength: [120, 'Platform too long']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    maxlength: [120, 'Username too long']
  },
  password: {
    type: String,
    trim: true,
    maxlength: [500, 'Password too long']
  }
}, { timestamps: true });

module.exports = mongoose.model('PasswordEntry', passwordEntrySchema);
