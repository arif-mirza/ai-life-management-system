const mongoose = require('mongoose');

const accountTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  category: {
    type: String,
    trim: true,
    maxlength: [60, 'Category too long'],
    default: 'General'
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount must be positive']
  },
  date: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    trim: true,
    maxlength: [300, 'Note too long']
  }
}, { timestamps: true });

module.exports = mongoose.model('AccountTransaction', accountTransactionSchema);
