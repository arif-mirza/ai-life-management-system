const DailyTask = require('../models/DailyTask');

// GET /api/daily-tasks  (optional ?date=YYYY-MM-DD)
const getTasks = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.date) filter.date = req.query.date;
    const tasks = await DailyTask.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/daily-tasks
const createTask = async (req, res) => {
  try {
    const { title, date, category, status, priority, notes } = req.body;
    const task = await DailyTask.create({
      user: req.user._id, title, date, category, status, priority, notes
    });
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT /api/daily-tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await DailyTask.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/daily-tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await DailyTask.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
