const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getSEHub, addTask, updateTask, deleteTask } = require('../controllers/seHubController');

const router = express.Router();

router.use(protect);
router.get('/', getSEHub);
router.post('/tasks', addTask);
router.put('/tasks/:taskId', updateTask);
router.delete('/tasks/:taskId', deleteTask);

module.exports = router;
