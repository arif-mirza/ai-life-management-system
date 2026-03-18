const express = require('express');
const router = express.Router();
const { getHabits, createHabit, updateHabit, deleteHabit, logHabit, removeLog, getHabitStats } = require('../controllers/habitController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/stats', getHabitStats);
router.route('/').get(getHabits).post(createHabit);
router.route('/:id').put(updateHabit).delete(deleteHabit);
router.post('/:id/log', logHabit);
router.delete('/:id/log', removeLog);

module.exports = router;
