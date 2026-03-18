const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const MonthlyReport = require('../models/MonthlyReport');

// @GET /api/reports/monthly?year=2026&month=3
const getMonthlyReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const year = parseInt(req.query.year) || now.getFullYear();
    const month = parseInt(req.query.month) || now.getMonth() + 1;

    const goals = await Goal.find({ user: userId, year });
    const habits = await Habit.find({ user: userId, isActive: true });

    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const daysInMonth = new Date(year, month, 0).getDate();

    let habitLogs = 0;
    habits.forEach(habit => {
      habitLogs += habit.logs.filter(l => {
        const d = new Date(l.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      }).length;
    });

    const habitRate = habits.length > 0
      ? Math.round((habitLogs / (daysInMonth * habits.length)) * 100)
      : 0;

    const productivity = Math.min(100, Math.round(
      (completedGoals / Math.max(goals.length, 1)) * 50 + habitRate * 0.5
    ));

    const report = {
      year, month,
      goalsCompleted: completedGoals,
      goalsTotal: goals.length,
      habitsTracked: habitLogs,
      habitCompletionRate: habitRate,
      productivityScore: productivity,
      goalsByCategory: {},
      habitDetails: []
    };

    goals.forEach(g => {
      if (!report.goalsByCategory[g.category]) {
        report.goalsByCategory[g.category] = { total: 0, completed: 0 };
      }
      report.goalsByCategory[g.category].total++;
      if (g.status === 'completed') report.goalsByCategory[g.category].completed++;
    });

    report.habitDetails = habits.map(h => ({
      name: h.name,
      icon: h.icon,
      logs: h.logs.filter(l => {
        const d = new Date(l.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      }).length,
      completionRate: Math.round((h.logs.filter(l => {
        const d = new Date(l.date);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      }).length / daysInMonth) * 100),
      streak: h.streak
    }));

    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/reports/yearly?year=2026
const getYearlyReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const goals = await Goal.find({ user: userId, year });
    const habits = await Habit.find({ user: userId });

    const monthlyBreakdown = [];
    for (let m = 1; m <= 12; m++) {
      const habitLogs = habits.reduce((acc, h) => {
        return acc + h.logs.filter(l => {
          const d = new Date(l.date);
          return d.getMonth() + 1 === m && d.getFullYear() === year;
        }).length;
      }, 0);

      monthlyBreakdown.push({
        month: m,
        monthName: new Date(year, m - 1).toLocaleString('default', { month: 'short' }),
        habitLogs
      });
    }

    res.json({
      success: true,
      data: {
        year,
        goals: {
          total: goals.length,
          completed: goals.filter(g => g.status === 'completed').length,
          inProgress: goals.filter(g => g.status === 'in-progress').length,
          notStarted: goals.filter(g => g.status === 'not-started').length,
          avgProgress: goals.length
            ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length)
            : 0
        },
        habits: {
          total: habits.length,
          totalLogs: habits.reduce((acc, h) => acc + h.logs.filter(l => new Date(l.date).getFullYear() === year).length, 0)
        },
        goalsByCategory: goals.reduce((acc, g) => {
          if (!acc[g.category]) acc[g.category] = { total: 0, completed: 0, avgProgress: 0 };
          acc[g.category].total++;
          if (g.status === 'completed') acc[g.category].completed++;
          acc[g.category].avgProgress = Math.round(
            (acc[g.category].avgProgress * (acc[g.category].total - 1) + g.progress) / acc[g.category].total
          );
          return acc;
        }, {}),
        monthlyBreakdown,
        allGoals: goals.map(g => ({
          _id: g._id, title: g.title, category: g.category,
          status: g.status, progress: g.progress, priority: g.priority
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMonthlyReport, getYearlyReport };
