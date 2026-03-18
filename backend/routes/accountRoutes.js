const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getTransactions,
  getSummary,
  createTransaction,
  updateTransaction,
  deleteTransaction
} = require('../controllers/accountController');

const router = express.Router();

router.get('/', protect, getTransactions);
router.get('/summary', protect, getSummary);
router.post('/', protect, createTransaction);
router.put('/:id', protect, updateTransaction);
router.delete('/:id', protect, deleteTransaction);

module.exports = router;
