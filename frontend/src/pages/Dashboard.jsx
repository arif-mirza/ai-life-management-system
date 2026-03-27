import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { fetchDashboard } from '../store/dashboardSlice'
import { fetchTasks } from '../store/dailyTasksSlice'
import { fetchPrayerLog } from '../store/namazSlice'
import { ProgressBar, Badge, LoadingSpinner } from '../components/common'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler)

const CATEGORY_COLORS = {
  Career: '#5C6BC0', Health: '#1a7a42', Finance: '#C77B2A',
  Learning: '#2D6A4F', 'Personal Growth': '#D68910', Other: '#888'
}

const formatStatus = s => ({ 'not-started': 'Not Started', 'in-progress': 'In Progress', completed: 'Completed', paused: 'Paused' }[s] || s)
const formatPriority = p => p ? `${p[0].toUpperCase()}${p.slice(1)}` : ''

const seHubStatusStyle = s => ({
  pending:      { background: '#f5f5f5', color: '#6B6560' },
  'in-progress':{ background: '#edf0fc', color: '#5C6BC0' },
  completed:    { background: '#e2f5ea', color: '#1a7a42' }
}[s] || { background: '#f5f5f5', color: '#666' })

const seHubStatusLabel = s => ({ pending: 'Pending', 'in-progress': 'In Progress', completed: 'Completed' }[s] || s)

const PRAYERS = ['fajr', 'zuhar', 'asar', 'magrib', 'isha']

const getCurrentMonthPrayerSummary = (log) => {
  const now = new Date()
  const cm = now.getMonth(), cy = now.getFullYear()
  const entries = log.filter(e => { const d = new Date(e.date); return d.getMonth() === cm && d.getFullYear() === cy })
  const completed = entries.reduce((c, e) => c + PRAYERS.filter(k => e[k] === 'Present' || e[k] === 'Kaza').length, 0)
  const total = new Date(cy, cm + 1, 0).getDate() * PRAYERS.length
  return { completed, total, rate: total ? Math.round((completed / total) * 100) : 0, daysLogged: entries.length }
}

const chartOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { labels: { font: { family: '"Plus Jakarta Sans"', size: 12 }, color: '#6B6560', boxWidth: 12 } },
    tooltip: {
      backgroundColor: '#fff', titleColor: '#1a1512', bodyColor: '#6B6560',
      borderColor: '#e2d9c8', borderWidth: 1,
      titleFont: { family: '"Plus Jakarta Sans"', size: 13, weight: '600' },
      bodyFont: { family: '"Plus Jakarta Sans"', size: 12 },
      padding: 12, cornerRadius: 12
    }
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#9d948b', font: { family: '"Plus Jakarta Sans"', size: 11 } } },
    y: { grid: { color: '#ede7d8' }, ticks: { color: '#9d948b', font: { family: '"Plus Jakarta Sans"', size: 11 } } }
  }
}

const stagger = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }

export default function Dashboard() {
  const dispatch = useDispatch()
  const { data, loading } = useSelector(s => s.dashboard)
  const { user } = useSelector(s => s.auth)
  const { items: dailyTasks } = useSelector(s => s.dailyTasks)
  const { prayerLog } = useSelector(s => s.namaz)

  useEffect(() => {
    dispatch(fetchDashboard())
    dispatch(fetchTasks())
    dispatch(fetchPrayerLog())
  }, [dispatch])

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const todayISO = now.toISOString().slice(0, 10)

  const todaysTasks = dailyTasks.filter(t => t.date === todayISO)
  const dailyCompleted = todaysTasks.filter(t => t.status === 'completed').length
  const dailyProgress = todaysTasks.length ? Math.round((dailyCompleted / todaysTasks.length) * 100) : 0
  const prayerSummary = useMemo(() => getCurrentMonthPrayerSummary(prayerLog), [prayerLog])

  if (loading || !data) return <LoadingSpinner size={48} label="Loading dashboard…" />

  const { summary, monthlyData, categoryStats, recentGoals, recentSeHubTasks = [] } = data

  const monthlyChartData = {
    labels: monthlyData.map(i => i.month),
    datasets: [
      { label: 'Productivity Score', data: monthlyData.map(i => i.productivity), borderColor: '#2D6A4F', backgroundColor: 'rgba(45,106,79,0.08)', borderWidth: 2.5, fill: true, tension: 0.4, pointBackgroundColor: '#2D6A4F', pointRadius: 4, pointBorderWidth: 2, pointBorderColor: '#fff' },
      { label: 'Habits Logged', data: monthlyData.map(i => i.habitsLogged), borderColor: '#5C6BC0', backgroundColor: 'rgba(92,107,192,0.07)', borderWidth: 2.5, fill: true, tension: 0.4, pointBackgroundColor: '#5C6BC0', pointRadius: 4, pointBorderWidth: 2, pointBorderColor: '#fff' }
    ]
  }
  const categoryData = {
    labels: categoryStats.map(i => i._id),
    datasets: [{ data: categoryStats.map(i => i.count), backgroundColor: categoryStats.map(i => CATEGORY_COLORS[i._id] || '#888'), borderWidth: 0 }]
  }
  const goalsBar = {
    labels: categoryStats.map(i => i._id),
    datasets: [
      { label: 'Total', data: categoryStats.map(i => i.count), backgroundColor: 'rgba(45,106,79,0.15)', borderColor: '#2D6A4F', borderWidth: 1.5, borderRadius: 10 },
      { label: 'Completed', data: categoryStats.map(i => i.completed), backgroundColor: 'rgba(45,106,79,0.74)', borderColor: '#2D6A4F', borderWidth: 0, borderRadius: 10 }
    ]
  }

  const heroMetrics = [
    { label: 'Prayer Rate', value: `${prayerSummary.rate}%`, sub: `${prayerSummary.completed}/${prayerSummary.total} prayers`, tone: 'green' },
    { label: 'Daily Focus', value: `${dailyProgress}%`, sub: `${dailyCompleted}/${todaysTasks.length || 0} tasks today`, tone: 'blue' },
    { label: 'SE Hub', value: `${summary.seHub?.progress || 0}%`, sub: `${summary.seHub?.completed || 0}/${summary.seHub?.total || 0} done`, tone: 'amber' },
    { label: 'Month Net', value: `$${(summary.accounts?.monthNet || 0).toLocaleString()}`, sub: 'Current month balance', tone: 'cream' }
  ]

  const statTiles = [
    { eyebrow: 'Goals', value: summary.totalGoals, label: 'Total tracked', accent: '#1f5c42' },
    { eyebrow: 'Yearly', value: `${summary.yearCompleted}/${summary.yearGoals}`, label: 'Completed this year', accent: '#5C6BC0' },
    { eyebrow: 'Progress', value: `${summary.avgProgress}%`, label: 'Avg goal progress', accent: '#C77B2A' },
    { eyebrow: 'Habits', value: `${summary.habitCompletionRate}%`, label: `${summary.habitCount} active habits`, accent: '#2D6A4F' },
    { eyebrow: 'Prayer', value: `${prayerSummary.rate}%`, label: `${prayerSummary.daysLogged} days logged`, accent: '#1a7a42' },
    { eyebrow: 'Notes', value: summary.notesCount, label: 'Saved in vault', accent: '#8A6C4F' }
  ]

  return (
    <div className="dashboard-shell animate-fade-in">
      {/* ── Hero ── */}
      <motion.section className="dashboard-hero-grid" {...stagger}>
        <div className="dashboard-glass-card dashboard-hero-panel">
          <div>
            <div className="dashboard-hero-kicker">✦ Personal command center</div>
            <h1 className="dashboard-hero-title" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.2rem,4vw,3.2rem)', fontWeight: 400, letterSpacing: '-0.03em', margin: 0 }}>
              {greeting}, <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>{user?.name?.split(' ')[0]}</em>
            </h1>
            <p className="dashboard-hero-subtitle">Your goals, ibadah, habits, learning and day plan — all in one premium space.</p>
          </div>
          <div>
            <div className="dashboard-hero-meta">
              <span className="dashboard-soft-pill">📅 {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span className="dashboard-soft-pill">🕌 Prayer tracking active</span>
              <span className="dashboard-soft-pill">☁️ Cloud synced</span>
            </div>
            <div className="dashboard-hero-actions">
              <Link to="/reports" className="btn btn-primary">Open Reports</Link>
              <Link to="/namaz-tracker" className="btn btn-secondary">Namaz Tracker</Link>
            </div>
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
          <div style={{ marginTop: 18 }}>
            <ProgressBar value={prayerSummary.rate} color="#1a7a42" showLabel height={8} />
          </div>
          <div className="dashboard-hero-metrics">
            {heroMetrics.map(m => (
              <div key={m.label} className={`dashboard-mini-panel tone-${m.tone}`}>
                <div className="dashboard-mini-eyebrow">{m.label}</div>
                <div className="dashboard-mini-value">{m.value}</div>
                <div className="dashboard-mini-sub">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Stat Tiles ── */}
      <motion.section className="dashboard-stat-grid" {...stagger} transition={{ ...stagger.transition, delay: 0.05 }}>
        {statTiles.map(t => (
          <div key={t.label} className="dashboard-glass-card dashboard-stat-tile">
            <div className="dashboard-stat-eyebrow" style={{ color: t.accent }}>{t.eyebrow}</div>
            <div className="dashboard-stat-value">{t.value}</div>
            <div className="dashboard-stat-label">{t.label}</div>
            <div className="dashboard-stat-glow" style={{ background: `radial-gradient(circle at center, ${t.accent}22, transparent 70%)` }} />
          </div>
        ))}
      </motion.section>

      {/* ── Charts Row ── */}
      <section className="dashboard-grid-two">
        <div className="dashboard-glass-card dashboard-card-panel">
          <div className="dashboard-panel-heading">
            <div>
              <div className="dashboard-panel-kicker">Performance</div>
              <div className="dashboard-panel-title">Monthly overview</div>
            </div>
          </div>
          <div className="dashboard-panel-subtitle">Productivity and habit activity across the last 6 months.</div>
          <div style={{ height: 240, marginTop: 18 }}><Line data={monthlyChartData} options={chartOpts} /></div>
        </div>

        <div className="dashboard-glass-card dashboard-card-panel">
          <div className="dashboard-panel-heading">
            <div>
              <div className="dashboard-panel-kicker">Distribution</div>
              <div className="dashboard-panel-title">Goals by category</div>
            </div>
          </div>
          <div className="dashboard-panel-subtitle">See where most of your focus is going.</div>
          {categoryStats.length > 0 ? (
            <>
              <div style={{ height: 190, display: 'flex', justifyContent: 'center', marginTop: 14 }}>
                <Doughnut data={categoryData} options={{ ...chartOpts, cutout: '70%', plugins: { ...chartOpts.plugins, legend: { display: false } } }} />
              </div>
              <div className="dashboard-legend-list">
                {categoryStats.slice(0, 5).map(i => (
                  <div key={i._id} className="dashboard-legend-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="dashboard-legend-dot" style={{ background: CATEGORY_COLORS[i._id] || '#888' }} />
                      <span style={{ fontSize: 13 }}>{i._id}</span>
                    </div>
                    <strong>{i.count}</strong>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="dashboard-empty-state">No goals yet.</div>}
        </div>
      </section>

      {/* ── Bottom Row ── */}
      <section className="dashboard-grid-two">
        <div className="dashboard-glass-card dashboard-card-panel">
          <div className="dashboard-panel-heading">
            <div>
              <div className="dashboard-panel-kicker">Comparison</div>
              <div className="dashboard-panel-title">Goals completion mix</div>
            </div>
          </div>
          <div className="dashboard-panel-subtitle">Total vs completed goals by category.</div>
          <div style={{ height: 220, marginTop: 18 }}>
            {categoryStats.length > 0
              ? <Bar data={goalsBar} options={chartOpts} />
              : <div className="dashboard-empty-state">No category data yet.</div>}
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
          {recentGoals.length === 0
            ? <div className="dashboard-empty-state">No goals yet. Create your first one.</div>
            : <div className="dashboard-stack-list" style={{ marginTop: 14 }}>
                {recentGoals.map(goal => (
                  <div key={goal._id} className="dashboard-list-card">
                    <div className="dashboard-list-topline">
                      <div className="dashboard-list-title">{goal.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Badge type={goal.status}>{goal.status.replace('-', ' ')}</Badge>
                        <span className="dashboard-list-value">{goal.progress}%</span>
                      </div>
                    </div>
                    <ProgressBar value={goal.progress} color={goal.status === 'completed' ? '#1a7a42' : goal.status === 'in-progress' ? '#5C6BC0' : '#D68910'} />
                  </div>
                ))}
              </div>}
        </div>
      </section>

      {/* ── SE Hub & Daily Tasks ── */}
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
            {summary.seHub?.completed || 0} completed · {summary.seHub?.inProgress || 0} in progress · {summary.seHub?.pending || 0} pending
          </div>
          <div style={{ marginTop: 14 }}><ProgressBar value={summary.seHub?.progress || 0} color="#C77B2A" showLabel height={8} /></div>
          <div className="dashboard-stack-list" style={{ marginTop: 14 }}>
            {recentSeHubTasks.length === 0
              ? <div className="dashboard-empty-state">No SE Hub tasks yet.</div>
              : recentSeHubTasks.map(task => (
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
                ))}
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
          <div className="dashboard-panel-subtitle">{dailyCompleted}/{todaysTasks.length || 0} tasks completed for today.</div>
          <div style={{ marginTop: 14 }}><ProgressBar value={dailyProgress} color="var(--accent)" showLabel height={8} /></div>
          <div className="dashboard-stack-list" style={{ marginTop: 14 }}>
            {todaysTasks.length === 0
              ? <div className="dashboard-empty-state">No tasks for today yet.</div>
              : todaysTasks.map(task => (
                  <div key={task._id} className="dashboard-list-card">
                    <div className="dashboard-list-topline">
                      <div className="dashboard-list-title" style={{ color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>
                        {task.title}
                      </div>
                      <div className="dashboard-list-meta">Today</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                      <Badge type={task.priority}>{formatPriority(task.priority)}</Badge>
                      <Badge type={task.status}>{formatStatus(task.status)}</Badge>
                    </div>
                  </div>
                ))}
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/daily-tasks" className="btn btn-secondary">Open Daily Tasks</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
