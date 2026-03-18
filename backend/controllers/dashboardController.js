const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const Note = require('../models/Note');
const AccountTransaction = require('../models/AccountTransaction');
const SEHub = require('../models/SEHub');

const getSEHubSummary = (tasks = []) => {
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

// @GET /api/dashboard
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // Goals stats
    const [totalGoals, completedGoals, yearGoals] = await Promise.all([
      Goal.countDocuments({ user: userId }),
      Goal.countDocuments({ user: userId, status: 'completed' }),
      Goal.find({ user: userId, year: currentYear })
    ]);

    const yearCompleted = yearGoals.filter(g => g.status === 'completed').length;
    const avgProgress = yearGoals.length
      ? Math.round(yearGoals.reduce((s, g) => s + g.progress, 0) / yearGoals.length)
      : 0;

    // Habit stats for current month
    const habits = await Habit.find({ user: userId, isActive: true });
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const daysPassed = Math.min(now.getDate(), daysInMonth);

    let totalLogs = 0;
    let totalExpected = 0;
    habits.forEach(habit => {
      const monthLogs = habit.logs.filter(l => {
        const d = new Date(l.date);
        return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
      });
      totalLogs += monthLogs.length;
      totalExpected += daysPassed;
    });

    const habitCompletionRate = totalExpected > 0
      ? Math.round((totalLogs / totalExpected) * 100)
      : 0;

    // Monthly progress data (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, now.getMonth() - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();

      const monthGoals = await Goal.find({ user: userId, year: y });
      const monthCompleted = monthGoals.filter(g => {
        if (!g.completedAt) return false;
        const cd = new Date(g.completedAt);
        return cd.getMonth() + 1 === m && cd.getFullYear() === y;
      }).length;

      const monthHabits = habits.reduce((acc, habit) => {
        return acc + habit.logs.filter(l => {
          const ld = new Date(l.date);
          return ld.getMonth() + 1 === m && ld.getFullYear() === y;
        }).length;
      }, 0);

      monthlyData.push({
        month: d.toLocaleString('default', { month: 'short' }),
        year: y,
        goalsCompleted: monthCompleted,
        habitsLogged: monthHabits,
        productivity: Math.min(100, Math.round((monthCompleted * 15) + (monthHabits * 2)))
      });
    }

    // Category breakdown
    const categoryStats = await Goal.aggregate([
      { $match: { user: userId, year: currentYear } },
      { $group: {
        _id: '$category',
        count: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        avgProgress: { $avg: '$progress' }
      }}
    ]);

    // Recent activity (last 5 goals updated)
    const recentGoals = await Goal.find({ user: userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title status progress category year');

    const [notesCount, seHub] = await Promise.all([
      Note.countDocuments({ user: userId }),
      SEHub.findOne({ user: userId })
    ]);

    const seHubTasks = seHub?.tasks || [];
    const seHubSummary = getSEHubSummary(seHubTasks);
    const recentSeHubTasks = [...seHubTasks]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
      .slice(0, 4)
      .map(task => ({
        _id: task._id,
        title: task.title,
        category: task.category,
        status: task.status,
        priority: task.priority,
        details: task.details,
        updatedAt: task.updatedAt || task.createdAt
      }));

    // Accounts summary
    const monthStart = new Date(currentYear, now.getMonth(), 1);
    const monthEnd = new Date(currentYear, now.getMonth() + 1, 0, 23, 59, 59, 999);
    const [totals, monthTotals] = await Promise.all([
      AccountTransaction.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ]),
      AccountTransaction.aggregate([
        { $match: { user: userId, date: { $gte: monthStart, $lte: monthEnd } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ])
    ]);
    const totalIncome = totals.find(t => t._id === 'income')?.total || 0;
    const totalExpense = totals.find(t => t._id === 'expense')?.total || 0;
    const monthIncome = monthTotals.find(t => t._id === 'income')?.total || 0;
    const monthExpense = monthTotals.find(t => t._id === 'expense')?.total || 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalGoals,
          completedGoals,
          yearGoals: yearGoals.length,
          yearCompleted,
          avgProgress,
          habitCompletionRate,
          habitCount: habits.length,
          notesCount,
          streak: habits.length ? Math.max(...habits.map(h => h.streak)) : 0,
          seHub: seHubSummary,
          accounts: {
            totalIncome,
            totalExpense,
            net: totalIncome - totalExpense,
            monthIncome,
            monthExpense,
            monthNet: monthIncome - monthExpense
          }
        },
        monthlyData,
        categoryStats,
        recentGoals,
        recentSeHubTasks
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboard };
