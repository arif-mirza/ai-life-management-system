import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboard } from '../store/dashboardSlice'
import { StatCard, ProgressBar, Badge, LoadingSpinner } from '../components/common'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler)

const CATEGORY_COLORS = {
  Career: '#5C6BC0', Health: '#1E8449', Finance: '#C77B2A',
  Learning: '#2D6A4F', 'Personal Growth': '#D68910', Other: '#888'
}

const STORAGE_KEY = 'lifeportal.dailyTasks'

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

export default function Dashboard() {
  const dispatch = useDispatch()
  const { data, loading } = useSelector(s => s.dashboard)
  const { user } = useSelector(s => s.auth)
  const [dailyTasks, setDailyTasks] = useState([])

  useEffect(() => { dispatch(fetchDashboard()) }, [])
  useEffect(() => {
    if (typeof window === 'undefined') return
    const loadTasks = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        setDailyTasks(Array.isArray(parsed) ? parsed : [])
      } catch {
        setDailyTasks([])
      }
    }
    loadTasks()
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) loadTasks()
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const todayISO = now.toISOString().slice(0, 10)
  const todaysTasks = dailyTasks.filter(t => t.date === todayISO)
  const dailyCompleted = todaysTasks.filter(t => t.status === 'completed').length
  const dailyProgress = todaysTasks.length ? Math.round((dailyCompleted / todaysTasks.length) * 100) : 0

  if (loading || !data) return <LoadingSpinner size={40} />

  const { summary, monthlyData, categoryStats, recentGoals, recentSeHubTasks = [] } = data

  // Monthly chart data
  const monthlyChartData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Productivity Score',
        data: monthlyData.map(d => d.productivity),
        borderColor: '#2D6A4F',
        backgroundColor: 'rgba(45,106,79,0.08)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#2D6A4F',
        pointRadius: 4,
      },
      {
        label: 'Habits Logged',
        data: monthlyData.map(d => d.habitsLogged),
        borderColor: '#5C6BC0',
        backgroundColor: 'rgba(92,107,192,0.06)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#5C6BC0',
        pointRadius: 4,
      }
    ]
  }

  // Category doughnut
  const catData = {
    labels: categoryStats.map(c => c._id),
    datasets: [{
      data: categoryStats.map(c => c.count),
      backgroundColor: categoryStats.map(c => CATEGORY_COLORS[c._id] || '#888'),
      borderWidth: 0,
    }]
  }

  // Goals bar chart
  const goalsBar = {
    labels: categoryStats.map(c => c._id),
    datasets: [
      {
        label: 'Total',
        data: categoryStats.map(c => c.count),
        backgroundColor: 'rgba(45,106,79,0.15)',
        borderColor: '#2D6A4F',
        borderWidth: 1.5,
        borderRadius: 6,
      },
      {
        label: 'Completed',
        data: categoryStats.map(c => c.completed),
        backgroundColor: 'rgba(45,106,79,0.7)',
        borderColor: '#2D6A4F',
        borderWidth: 0,
        borderRadius: 6,
      }
    ]
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
        cornerRadius: 8,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#A09890', font: { family: '"Plus Jakarta Sans"', size: 11 } } },
      y: { grid: { color: '#F0EDE6' }, ticks: { color: '#A09890', font: { family: '"Plus Jakarta Sans"', size: 11 } } }
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Greeting */}
      <div className="dashboard-hero" style={{ marginBottom: 28 }}>
        <div className="dashboard-hero-kicker">Dashboard overview</div>
        <h1 className="dashboard-hero-title" style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, margin: 0 }}>
          {greeting}, <em>{user?.name?.split(' ')[0]}</em>
        </h1>
        <p className="dashboard-hero-date" style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
          {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon="🎯" label="Total Goals" value={summary.totalGoals}
          sub={`${summary.completedGoals} completed`} accent="#E8F5EE" />
        <StatCard icon="📅" label={`${now.getFullYear()} Goals`} value={summary.yearGoals}
          sub={`${summary.yearCompleted} completed this year`} accent="#EEF0FD" />
        <StatCard icon="📈" label="Avg Progress" value={`${summary.avgProgress}%`}
          sub="Across all goals" accent="#FDF3E7" />
        <StatCard icon="🔁" label="Habit Rate" value={`${summary.habitCompletionRate}%`}
          sub={`${summary.habitCount} active habits`} accent="#EAFAF1" />
        <StatCard icon="🔥" label="Best Streak" value={`${summary.streak}d`}
          sub="Current top streak" accent="#FEF9E7" />
        <StatCard icon="📝" label="Notes" value={summary.notesCount}
          sub="Saved notes" accent="#F2F2F2" />
        <StatCard icon="💻" label="SE Hub" value={`${summary.seHub?.progress || 0}%`}
          sub={`${summary.seHub?.completed || 0}/${summary.seHub?.total || 0} completed`} accent="#FFF3E2" />
        <StatCard icon="💰" label="This Month" value={`$${(summary.accounts?.monthNet || 0).toLocaleString('en-US')}`}
          sub="Net balance" accent="#EEF0FD" />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>
        {/* Line chart */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Monthly Overview</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Productivity & habits over last 6 months</div>
          <div style={{ height: 220 }}>
            <Line data={monthlyChartData} options={chartOpts} />
          </div>
        </div>

        {/* Doughnut */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Goals by Category</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Distribution this year</div>
          {categoryStats.length > 0 ? (
            <>
              <div style={{ height: 160, display: 'flex', justifyContent: 'center' }}>
                <Doughnut data={catData} options={{
                  ...chartOpts,
                  cutout: '65%',
                  plugins: { ...chartOpts.plugins, legend: { display: false } }
                }} />
              </div>
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {categoryStats.slice(0, 4).map(c => (
                  <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[c._id] || '#888' }} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c._id}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{c.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No goals yet
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {/* Bar chart */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Goals by Category</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Total vs completed</div>
          <div style={{ height: 200 }}>
            {categoryStats.length > 0
              ? <Bar data={goalsBar} options={chartOpts} />
              : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 13 }}>No data yet</div>
            }
          </div>
        </div>

        {/* Recent goals */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Recent Goals</div>
          {recentGoals.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '30px 0' }}>No goals yet — create your first goal!</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {recentGoals.map(goal => (
                <div key={goal._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{goal.title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Badge type={goal.status}>{goal.status.replace('-', ' ')}</Badge>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{goal.progress}%</span>
                    </div>
                  </div>
                  <ProgressBar value={goal.progress}
                    color={goal.status === 'completed' ? '#1E8449' : goal.status === 'in-progress' ? '#5C6BC0' : '#D68910'}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Daily tasks preview */}
      <div style={{ marginTop: 20 }}>
        <div className="card" style={{ padding: '24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 600 }}>SE Hub Progress</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {summary.seHub?.completed || 0} completed • {summary.seHub?.inProgress || 0} in progress • {summary.seHub?.pending || 0} pending
              </div>
            </div>
            <span className="badge" style={{ background: '#FFF3E2', color: '#A35B00' }}>
              {summary.seHub?.progress || 0}% complete
            </span>
          </div>
          <div style={{ marginTop: 12 }}>
            <ProgressBar value={summary.seHub?.progress || 0} color="#C77B2A" showLabel />
          </div>
          <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
            {recentSeHubTasks.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '12px 0' }}>
                No SE Hub tasks yet.
              </div>
            ) : (
              recentSeHubTasks.map(task => (
                <div
                  key={task._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    background: 'var(--surface)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.title}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Badge style={seHubStatusStyle(task.status)}>{seHubStatusLabel(task.status)}</Badge>
                      <Badge type={task.priority}>{formatPriority(task.priority)}</Badge>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{task.category}</div>
                </div>
              ))
            )}
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/se-hub" className="btn btn-secondary">Open SE Hub</Link>
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Daily Tasks</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
              {dailyProgress}% today
            </span>
          </div>
          <div style={{ marginTop: 12 }}>
            <ProgressBar value={dailyProgress} color="var(--accent)" showLabel />
          </div>
          <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
            {todaysTasks.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '12px 0' }}>
                No tasks for today yet.
              </div>
            ) : (
              todaysTasks.map(task => (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    background: 'var(--surface)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{
                      fontWeight: 600,
                      color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: task.status === 'completed' ? 'line-through' : 'none'
                    }}>
                      {task.title}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <Badge type={task.priority}>{formatPriority(task.priority)}</Badge>
                      <Badge type={task.status}>{formatStatus(task.status)}</Badge>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Today</div>
                </div>
              ))
            )}
          </div>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Link to="/daily-tasks" className="btn btn-secondary">Open Daily Tasks</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
