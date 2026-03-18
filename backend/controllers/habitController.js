const Habit = require('../models/Habit');

// @GET /api/habits
const getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id, isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: habits });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/habits
const createHabit = async (req, res) => {
  try {
    const habit = await Habit.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: habit });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @PUT /api/habits/:id
const updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });
    res.json({ success: true, data: habit });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @DELETE /api/habits/:id
const deleteHabit = async (req, res) => {
  try {
    await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isActive: false }
    );
    res.json({ success: true, message: 'Habit archived' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/habits/:id/log
const logHabit = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });

    const { date, value, note } = req.body;
    const logDate = new Date(date || new Date());
    logDate.setHours(0, 0, 0, 0);

    // Check if already logged today
    const existingLog = habit.logs.find(l => {
      const d = new Date(l.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === logDate.getTime();
    });

    if (existingLog) {
      existingLog.value = value || 1;
      existingLog.note = note || '';
    } else {
      habit.logs.push({ date: logDate, value: value || 1, note: note || '' });
    }

    // Recalculate streak
    habit.streak = calculateStreak(habit.logs);
    if (habit.streak > habit.longestStreak) habit.longestStreak = habit.streak;

    await habit.save();
    res.json({ success: true, data: habit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/habits/:id/log
const removeLog = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ success: false, message: 'Habit not found' });

    const { date } = req.body;
    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    habit.logs = habit.logs.filter(l => {
      const d = new Date(l.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() !== logDate.getTime();
    });

    habit.streak = calculateStreak(habit.logs);
    await habit.save();
    res.json({ success: true, data: habit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/habits/stats
const getHabitStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const habits = await Habit.find({ user: req.user._id, isActive: true });

    const now = new Date();
    const targetMonth = parseInt(month) || now.getMonth() + 1;
    const targetYear = parseInt(year) || now.getFullYear();

    const stats = habits.map(habit => {
      const monthLogs = habit.logs.filter(l => {
        const d = new Date(l.date);
        return d.getMonth() + 1 === targetMonth && d.getFullYear() === targetYear;
      });

      const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
      return {
        habitId: habit._id,
        name: habit.name,
        icon: habit.icon,
        color: habit.color,
        logsCount: monthLogs.length,
        completionRate: Math.round((monthLogs.length / daysInMonth) * 100),
        streak: habit.streak,
        longestStreak: habit.longestStreak
      };
    });

    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

function calculateStreak(logs) {
  if (!logs.length) return 0;
  const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);

  for (const log of sorted) {
    const logDate = new Date(log.date);
    logDate.setHours(0, 0, 0, 0);
    const diff = (current - logDate) / (1000 * 60 * 60 * 24);
    if (diff === 0 || diff === 1) {
      streak++;
      current = logDate;
    } else break;
  }
  return streak;
}

module.exports = { getHabits, createHabit, updateHabit, deleteHabit, logHabit, removeLog, getHabitStats };
