import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboard } from '../store/dashboardSlice'
import { ProgressBar, Badge, LoadingSpinner } from '../components/common'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler)

const CATEGORY_COLORS = {
  Career: '#5C6BC0',
  Health: '#1E8449',
  Finance: '#C77B2A',
  Learning: '#2D6A4F',
  'Personal Growth': '#D68910',
  Other: '#888'
}

const DAILY_TASKS_STORAGE_KEY = 'lifeportal.dailyTasks'
const PRAYER_LOG_STORAGE_KEY = 'lifeportal.namaz.prayerLog'
const PRAYER_KEYS = ['fajr', 'zuhar', 'asar', 'magrib', 'isha']

const formatStatus = (status) => ({
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  completed: 'Completed',
  paused: 'Paused'
}[status] || status)

const formatPriority = (priority) => priority ? `${priority[0].toUpperCase()}${priority.slice(1)}` : ''
const seHubStatusLabel = (status) => ({
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed'
}[status] || status)

const seHubStatusStyle = (status) => ({
  pending: { background: '#F2F2F2', color: '#6B6560' },
  'in-progress': { background: '#EEF0FD', color: '#5C6BC0' },
  completed: { background: '#EAFAF1', color: '#1E8449' }
}[status] || { background: '#F2F2F2', color: '#666' })

const loadStorageArray = (key) => {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const getCurrentMonthPrayerSummary = (entries) => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const monthEntries = entries.filter(entry => {
    const date = new Date(entry.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

  const completed = monthEntries.reduce((count, entry) => {
    return count + PRAYER_KEYS.filter(key => entry[key] === 'Present' || entry[key] === 'Kaza').length
  }, 0)
  const total = new Date(currentYear, currentMonth + 1, 0).getDate() * PRAYER_KEYS.length

  return {
    completed,
    total,
    rate: total ? Math.round((completed / total) * 100) : 0,
    daysLogged: monthEntries.length
  }
}

const chartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { font: { family: '"Plus Jakarta Sans"', size: 12 }, color: '#6B6560', boxWidth: 12 }
    },
    tooltip: {
      backgroundColor: '#fff',
      titleColor: '#1A1714',
      bodyColor: '#6B6560',
      borderColor: '#E8E4DC',
      borderWidth: 1,
      titleFont: { family: '"Plus Jakarta Sans"', size: 13, weight: '600' },
      bodyFont: { family: '"Plus Jakarta Sans"', size: 12 },
      padding: 12,
      cornerRadius: 10
    }
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#A09890', font: { family: '"Plus Jakarta Sans"', size: 11 } } },
    y: { grid: { color: '#F0EDE6' }, ticks: { color: '#A09890', font: { family: '"Plus Jakarta Sans"', size: 11 } } }
  }
}

export default function Dashboard() {
  const dispatch = useDispatch()
  const { data, loading } = useSelector(s => s.dashboard)
  const { user } = useSelector(s => s.auth)
  const [dailyTasks, setDailyTasks] = useState([])
  const [prayerLog, setPrayerLog] = useState([])

  useEffect(() => {
    dispatch(fetchDashboard())
  }, [dispatch])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const syncLocalData = () => {
      setDailyTasks(loadStorageArray(DAILY_TASKS_STORAGE_KEY))
      setPrayerLog(loadStorageArray(PRAYER_LOG_STORAGE_KEY))
    }

    syncLocalData()

    const handleStorage = (event) => {
      if (!event.key || event.key === DAILY_TASKS_STORAGE_KEY || event.key === PRAYER_LOG_STORAGE_KEY) {
        syncLocalData()
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const todayISO = now.toISOString().slice(0, 10)
  const todaysTasks = dailyTasks.filter(task => task.date === todayISO)
  const dailyCompleted = todaysTasks.filter(task => task.status === 'completed').length
  const dailyProgress = todaysTasks.length ? Math.round((dailyCompleted / todaysTasks.length) * 100) : 0
  const prayerSummary = useMemo(() => getCurrentMonthPrayerSummary(prayerLog), [prayerLog])

  if (loading || !data) return <LoadingSpinner size={40} />

  const { summary, monthlyData, categoryStats, recentGoals, recentSeHubTasks = [] } = data

  const monthlyChartData = {
    labels: monthlyData.map(item => item.month),
    datasets: [
      {
        label: 'Productivity Score',
        data: monthlyData.map(item => item.productivity),
        borderColor: '#2D6A4F',
        backgroundColor: 'rgba(45,106,79,0.08)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#2D6A4F',
        pointRadius: 4
      },
      {
        label: 'Habits Logged',
        data: monthlyData.map(item => item.habitsLogged),
        borderColor: '#5C6BC0',
        backgroundColor: 'rgba(92,107,192,0.06)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#5C6BC0',
        pointRadius: 4
      }
    ]
  }

  const categoryData = {
    labels: categoryStats.map(item => item._id),
    datasets: [{
      data: categoryStats.map(item => item.count),
      backgroundColor: categoryStats.map(item => CATEGORY_COLORS[item._id] || '#888'),
      borderWidth: 0
    }]
  }

  const goalsBar = {
    labels: categoryStats.map(item => item._id),
    datasets: [
      {
        label: 'Total',
        data: categoryStats.map(item => item.count),
        backgroundColor: 'rgba(45,106,79,0.15)',
        borderColor: '#2D6A4F',
        borderWidth: 1.5,
        borderRadius: 8
      },
      {
        label: 'Completed',
        data: categoryStats.map(item => item.completed),
        backgroundColor: 'rgba(45,106,79,0.72)',
        borderColor: '#2D6A4F',
        borderWidth: 0,
        borderRadius: 8
      }
    ]
  }

  const heroMetrics = [
    { label: 'This Month Prayer Rate', value: `${prayerSummary.rate}%`, sub: `${prayerSummary.completed}/${prayerSummary.total} prayers`, tone: 'green' },
    { label: 'Daily Focus', value: `${dailyProgress}%`, sub: `${dailyCompleted}/${todaysTasks.length || 0} tasks today`, tone: 'blue' },
    { label: 'SE Hub Progress', value: `${summary.seHub?.progress || 0}%`, sub: `${summary.seHub?.completed || 0}/${summary.seHub?.total || 0} completed`, tone: 'amber' },
    { label: 'Month Net', value: `$${(summary.accounts?.monthNet || 0).toLocaleString('en-US')}`, sub: 'Current month balance', tone: 'cream' }
  ]

  const statTiles = [
    { eyebrow: 'Goals', value: summary.totalGoals, label: 'Total goals tracked', accent: '#245C47' },
    { eyebrow: 'Yearly', value: `${summary.yearCompleted}/${summary.yearGoals}`, label: 'Completed this year', accent: '#5C6BC0' },
    { eyebrow: 'Progress', value: `${summary.avgProgress}%`, label: 'Average goal progress', accent: '#C77B2A' },
    { eyebrow: 'Habits', value: `${summary.habitCompletionRate}%`, label: `${summary.habitCount} active habits`, accent: '#2D6A4F' },
    { eyebrow: 'Prayer', value: `${prayerSummary.rate}%`, label: `${prayerSummary.daysLogged} days logged this month`, accent: '#1E8449' },
    { eyebrow: 'Notes', value: summary.notesCount, label: 'Saved notes in vault', accent: '#8A6C4F' }
  ]

  return (
    <div className="dashboard-shell animate-fade-in">
      <section className="dashboard-hero-grid">
        <div className="dashboard-glass-card dashboard-hero-panel">
          <div className="dashboard-hero-kicker">Personal command center</div>
          <h1 className="dashboard-hero-title" style={{ margin: 0 }}>
            {greeting}, <em>{user?.name?.split(' ')[0]}</em>
          </h1>
          <p className="dashboard-hero-subtitle">
            Your goals, ibadah progress, habits, learning, and day plan in one polished space.
          </p>
          <div className="dashboard-hero-meta">
            <span className="dashboard-soft-pill">
              {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="dashboard-soft-pill">Prayer tracking active</span>
            <span className="dashboard-soft-pill">SE Hub synced</span>
          </div>
          <div className="dashboard-hero-actions">
            <Link to="/reports" className="btn btn-primary">Open Reports</Link>
            <Link to="/namaz-tracker" className="btn btn-secondary">Open Namaz Tracker</Link>
          </div>
        </div>

        <div className="dashboard-glass-card dashboard-spotlight-panel">
          <div className="dashboard-panel-heading">
            <div>
              <div className="dashboard-panel-kicker">Live spotlight</div>
              <div className="dashboard-panel-title">This month prayer rate</div>
            </div>
            <span className="dashboard-rate-chip">{prayerSummary.rate}%</span>
          </div>

          <div className="dashboard-spotlight-score">
            <div className="dashboard-score-value">{prayerSummary.completed}</div>
            <div className="dashboard-score-copy">
              <div className="dashboard-score-label">Marked prayers</div>
              <div className="dashboard-score-sub">{prayerSummary.total} total prayers this month</div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <ProgressBar value={prayerSummary.rate} color="#1E8449" showLabel />
          </div>

          <div className="dashboard-hero-metrics">
            {heroMetrics.map(metric => (
              <div key={metric.label} className={`dashboard-mini-panel tone-${metric.tone}`}>
                <div className="dashboard-mini-eyebrow">{metric.label}</div>
                <div className="dashboard-mini-value">{metric.value}</div>
                <div className="dashboard-mini-sub">{metric.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dashboard-stat-grid">
        {statTiles.map(tile => (
          <div key={tile.label} className="dashboard-glass-card dashboard-stat-tile">
            <div className="dashboard-stat-eyebrow" style={{ color: tile.accent }}>{tile.eyebrow}</div>
            <div className="dashboard-stat-value">{tile.value}</div>
            <div className="dashboard-stat-label">{tile.label}</div>
            <div className="dashboard-stat-glow" style={{ background: `radial-gradient(circle, ${tile.accent}22, transparent 72%)` }} />
          </div>
        ))}
      </section>

      <section className="dashboard-grid-two">
        <div className="dashboard-glass-card dashboard-card-panel">
          <div className="dashboard-panel-heading">
            <div>
              <div className="dashboard-panel-kicker">Performance</div>
              <div className="dashboard-panel-title">Monthly overview</div>
            </div>
          </div>
          <div className="dashboard-panel-subtitle">Productivity and habit activity across the last 6 months.</div>
          <div style={{ height: 240, marginTop: 18 }}>
            <Line data={monthlyChartData} options={chartOpts} />
          </div>
        </div>

        <div className="dashboard-glass-card dashboard-card-panel">
          <div className="dashboard-panel-heading">
            <div>
              <div className="dashboard-panel-kicker">Distribution</div>
              <div className="dashboard-panel-title">Goals by category</div>
            </div>
          </div>
          <div className="dashboard-panel-subtitle">See where most of your yearly focus is going.</div>
          {categoryStats.length > 0 ? (
            <>
              <div style={{ height: 188, display: 'flex', justifyContent: 'center', marginTop: 14 }}>
                <Doughnut
                  data={categoryData}
                  options={{
                    ...chartOpts,
                    cutout: '68%',
                    plugins: { ...chartOpts.plugins, legend: { display: false } }
                  }}
                />
              </div>
              <div className="dashboard-legend-list">
                {categoryStats.slice(0, 5).map(item => (
                  <div key={item._id} className="dashboard-legend-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="dashboard-legend-dot" style={{ background: CATEGORY_COLORS[item._id] || '#888' }} />
                      <span>{item._id}</span>
                    </div>
                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="dashboard-empty-state">No goals yet.</div>
          )}
        </div>
      </section>

      <section className="dashboard-grid-two">
        <div className="dashboard-glass-card dashboard-card-panel">
          <div className="dashboard-panel-heading">
            <div>
              <div className="dashboard-panel-kicker">Comparison</div>
              <div className="dashboard-panel-title">Goals completion mix</div>
            </div>
          </div>
          <div className="dashboard-panel-subtitle">Total goals versus completed goals by category.</div>
          <div style={{ height: 220, marginTop: 18 }}>
            {categoryStats.length > 0 ? (
              <Bar data={goalsBar} options={chartOpts} />
            ) : (
              <div className="dashboard-empty-state">No category data yet.</div>
            )}
          </div>
        </div>

        <div className="dashboard-glass-card dashboard-card-panel">
          <div className="dashboard-panel-heading">
            <div>
              <div className="dashboard-panel-kicker">Momentum</div>
              <div className="dashboard-panel-title">Recent goals</div>
            </div>
          </div>
          <div className="dashboard-panel-subtitle">Your latest goal updates and their current pace.</div>
          {recentGoals.length === 0 ? (
            <div className="dashboard-empty-state">No goals yet. Create your first one.</div>
          ) : (
            <div className="dashboard-stack-list">
              {recentGoals.map(goal => (
                <div key={goal._id} className="dashboard-list-card">
                  <div className="dashboard-list-topline">
                    <div className="dashboard-list-title">{goal.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Badge type={goal.status}>{goal.status.replace('-', ' ')}</Badge>
                      <span className="dashboard-list-value">{goal.progress}%</span>
                    </div>
                  </div>
                  <ProgressBar
                    value={goal.progress}
                    color={goal.status === 'completed' ? '#1E8449' : goal.status === 'in-progress' ? '#5C6BC0' : '#D68910'}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="dashboard-grid-two">
        <div className="dashboard-glass-card dashboard-card-panel">
          <div className="dashboard-panel-heading">
            <div>
              <div className="dashboard-panel-kicker">Learning</div>
              <div className="dashboard-panel-title">SE Hub progress</div>
            </div>
            <span className="dashboard-rate-chip alt">{summary.seHub?.progress || 0}%</span>
          </div>
          <div className="dashboard-panel-subtitle">
            {summary.seHub?.completed || 0} completed, {summary.seHub?.inProgress || 0} in progress, {summary.seHub?.pending || 0} pending
          </div>
          <div style={{ marginTop: 14 }}>
            <ProgressBar value={summary.seHub?.progress || 0} color="#C77B2A" showLabel />
          </div>
          <div className="dashboard-stack-list">
            {recentSeHubTasks.length === 0 ? (
              <div className="dashboard-empty-state">No SE Hub tasks yet.</div>
            ) : (
              recentSeHubTasks.map(task => (
                <div key={task._id} className="dashboard-list-card">
                  <div className="dashboard-list-topline">
                    <div className="dashboard-list-title">{task.title}</div>
                    <div className="dashboard-list-meta">{task.category}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    <Badge style={seHubStatusStyle(task.status)}>{seHubStatusLabel(task.status)}</Badge>
                    <Badge type={task.priority}>{formatPriority(task.priority)}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/se-hub" className="btn btn-secondary">Open SE Hub</Link>
          </div>
        </div>

        <div className="dashboard-glass-card dashboard-card-panel">
          <div className="dashboard-panel-heading">
            <div>
              <div className="dashboard-panel-kicker">Today</div>
              <div className="dashboard-panel-title">Daily task snapshot</div>
            </div>
            <span className="dashboard-rate-chip">{dailyProgress}%</span>
          </div>
          <div className="dashboard-panel-subtitle">
            {dailyCompleted}/{todaysTasks.length || 0} tasks completed for today.
          </div>
          <div style={{ marginTop: 14 }}>
            <ProgressBar value={dailyProgress} color="var(--accent)" showLabel />
          </div>
          <div className="dashboard-stack-list">
            {todaysTasks.length === 0 ? (
              <div className="dashboard-empty-state">No tasks for today yet.</div>
            ) : (
              todaysTasks.map(task => (
                <div key={task.id} className="dashboard-list-card">
                  <div className="dashboard-list-topline">
                    <div
                      className="dashboard-list-title"
                      style={{
                        color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: task.status === 'completed' ? 'line-through' : 'none'
                      }}
                    >
                      {task.title}
                    </div>
                    <div className="dashboard-list-meta">Today</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    <Badge type={task.priority}>{formatPriority(task.priority)}</Badge>
                    <Badge type={task.status}>{formatStatus(task.status)}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/daily-tasks" className="btn btn-secondary">Open Daily Tasks</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
