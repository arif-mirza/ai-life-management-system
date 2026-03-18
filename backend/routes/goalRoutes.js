const express = require('express');
const router = express.Router();
const { getGoals, createGoal, getGoal, updateGoal, deleteGoal, toggleTarget, getYearlyStats } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/stats/yearly', getYearlyStats);
router.route('/').get(getGoals).post(createGoal);
router.route('/:id').get(getGoal).put(updateGoal).delete(deleteGoal);
router.patch('/:id/target/:targetId', toggleTarget);

module.exports = router;
