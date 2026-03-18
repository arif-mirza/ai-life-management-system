const Goal = require('../models/Goal');

// @GET /api/goals
const getGoals = async (req, res) => {
  try {
    const { year, category, status, search } = req.query;
    const filter = { user: req.user._id };

    if (year) filter.year = parseInt(year);
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const goals = await Goal.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: goals.length, data: goals });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/goals
const createGoal = async (req, res) => {
  try {
    const goal = await Goal.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: goal });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @GET /api/goals/:id
const getGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, data: goal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/goals/:id
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, data: goal });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @DELETE /api/goals/:id
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.json({ success: true, message: 'Goal deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PATCH /api/goals/:id/target/:targetId
const toggleTarget = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    const target = goal.monthlyTargets.id(req.params.targetId);
    if (!target) return res.status(404).json({ success: false, message: 'Target not found' });

    target.completed = !target.completed;
    target.completedAt = target.completed ? new Date() : null;
    await goal.save();

    res.json({ success: true, data: goal });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/goals/stats/yearly
const getYearlyStats = async (req, res) => {
  try {
    const stats = await Goal.aggregate([
      { $match: { user: req.user._id } },
      { $group: {
        _id: '$year',
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        avgProgress: { $avg: '$progress' }
      }},
      { $sort: { _id: 1 } }
    ]);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getGoals, createGoal, getGoal, updateGoal, deleteGoal, toggleTarget, getYearlyStats };
