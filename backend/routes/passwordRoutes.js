const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getPasswords, createPassword, updatePassword, deletePassword } = require('../controllers/passwordController');

const router = express.Router();

router.get('/', protect, getPasswords);
router.post('/', protect, createPassword);
router.put('/:id', protect, updatePassword);
router.delete('/:id', protect, deletePassword);

module.exports = router;
