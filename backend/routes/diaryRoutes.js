const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getEntries, createEntry, updateEntry, deleteEntry } = require('../controllers/diaryController');

const router = express.Router();

router.get('/', protect, getEntries);
router.post('/', protect, createEntry);
router.put('/:id', protect, updateEntry);
router.delete('/:id', protect, deleteEntry);

module.exports = router;
