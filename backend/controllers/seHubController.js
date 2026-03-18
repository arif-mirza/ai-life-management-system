const SEHub = require('../models/SEHub');

const TASK_CATEGORIES = ['Frontend', 'Backend', 'DevOps', 'Interview Prep', 'System Design', 'Project', 'Core CS', 'Other'];
const TASK_STATUSES = ['pending', 'in-progress', 'completed'];
const TASK_PRIORITIES = ['low', 'medium', 'high'];

const buildSummary = (tasks = []) => {
  const total = tasks.length;
  const completed = tasks.filter(task => task.status === 'completed').length;
  const inProgress = tasks.filter(task => task.status === 'in-progress').length;
  const pending = tasks.filter(task => task.status === 'pending').length;

  return {
    total,
    completed,
    inProgress,
    pending,
    progress: total ? Math.round((completed / total) * 100) : 0
  };
};

const normalizeTaskPayload = (payload = {}, existingTask = null) => {
  const next = {};

  if (payload.title !== undefined) next.title = String(payload.title).trim();
  if (payload.category !== undefined) next.category = TASK_CATEGORIES.includes(payload.category) ? payload.category : 'Other';
  if (payload.status !== undefined) next.status = TASK_STATUSES.includes(payload.status) ? payload.status : 'pending';
  if (payload.priority !== undefined) next.priority = TASK_PRIORITIES.includes(payload.priority) ? payload.priority : 'medium';
  if (payload.details !== undefined) next.details = String(payload.details || '').trim();

  const resolvedStatus = next.status ?? existingTask?.status;
  if (resolvedStatus === 'completed') {
    next.completedAt = existingTask?.completedAt || new Date();
  } else if (payload.status !== undefined) {
    next.completedAt = null;
  }

  return next;
};

const serializeHub = (hub, userId) => {
  const tasks = [...(hub?.tasks || [])].sort((a, b) => {
    const aDate = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const bDate = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return bDate - aDate;
  });

  return {
    user: hub?.user || userId,
    tasks,
    summary: buildSummary(tasks)
  };
};

const ensureHub = async (userId) => {
  let hub = await SEHub.findOne({ user: userId });
  if (!hub) {
    hub = await SEHub.create({ user: userId, tasks: [] });
  }
  return hub;
};

const getSEHub = async (req, res) => {
  try {
    const hub = await SEHub.findOne({ user: req.user._id });
    res.json({ success: true, data: serializeHub(hub, req.user._id) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const addTask = async (req, res) => {
  try {
    const taskPayload = normalizeTaskPayload(req.body);
    if (!taskPayload.title) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    const hub = await ensureHub(req.user._id);
    hub.tasks.unshift(taskPayload);
    await hub.save();

    res.status(201).json({ success: true, data: serializeHub(hub, req.user._id) });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const hub = await SEHub.findOne({ user: req.user._id });
    if (!hub) return res.status(404).json({ success: false, message: 'SE Hub record not found' });

    const task = hub.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const updates = normalizeTaskPayload(req.body, task);
    Object.entries(updates).forEach(([key, value]) => {
      task[key] = value;
    });

    await hub.save();
    res.json({ success: true, data: serializeHub(hub, req.user._id) });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const hub = await SEHub.findOne({ user: req.user._id });
    if (!hub) return res.status(404).json({ success: false, message: 'SE Hub record not found' });

    const task = hub.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.deleteOne();
    await hub.save();

    res.json({ success: true, data: serializeHub(hub, req.user._id) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  buildSummary,
  getSEHub,
  addTask,
  updateTask,
  deleteTask
};
