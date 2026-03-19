import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMonthlyReport, fetchYearlyReport } from '../store/dashboardSlice'
import { PageHeader, LoadingSpinner, ProgressBar, Badge } from '../components/common'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement, Filler)

const MONTHS_LABELS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1]
const PRAYER_STORAGE_KEY = 'lifeportal.namaz.prayerLog'

const CATEGORY_COLORS = { Career: '#5C6BC0', Health: '#1E8449', Finance: '#C77B2A', Learning: '#2D6A4F', 'Personal Growth': '#D68910', Other: '#888' }

const getCompletedPrayerCount = (entries) => {
  let completed = 0

  entries.forEach(entry => {
    ['fajr', 'zuhar', 'asar', 'magrib', 'isha'].forEach(prayer => {
      if (entry[prayer] === 'Present' || entry[prayer] === 'Kaza') completed += 1
    })
  })

  return completed
}

const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate()
const getDaysInYear = (year) => Math.round((new Date(year + 1, 0, 1) - new Date(year, 0, 1)) / 86400000)
const getPrayerRate = (completed, total) => (total ? Math.round((completed / total) * 100) : 0)

const getMonthlyPrayerRate = (entries, year, month) => {
  const filteredEntries = entries.filter(entry => {
    const date = new Date(entry.date)
    return date.getFullYear() === year && date.getMonth() + 1 === month
  })
  const completed = getCompletedPrayerCount(filteredEntries)
  const total = getDaysInMonth(year, month) * 5
  return getPrayerRate(completed, total)
}

const getYearlyPrayerRate = (entries, year) => {
  const filteredEntries = entries.filter(entry => new Date(entry.date).getFullYear() === year)
  const completed = getCompletedPrayerCount(filteredEntries)
  const total = getDaysInYear(year) * 5
  return getPrayerRate(completed, total)
}

const chartOpts = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { labels: { font: { family: '"Plus Jakarta Sans"', size: 12 }, color: '#6B6560', boxWidth: 12 } },
    tooltip: {
      backgroundColor: '#fff', titleColor: '#1A1714', bodyColor: '#6B6560',
      borderColor: '#E8E4DC', borderWidth: 1, padding: 10, cornerRadius: 8,
      titleFont: { family: '"Plus Jakarta Sans"', size: 12, weight: '600' },
      bodyFont: { family: '"Plus Jakarta Sans"', size: 12 }
    }
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#A09890', font: { family: '"Plus Jakarta Sans"', size: 11 } } },
    y: { grid: { color: '#F0EDE6' }, ticks: { color: '#A09890', font: { family: '"Plus Jakarta Sans"', size: 11 } } }
  }
}

export default function Reports() {
  const dispatch = useDispatch()
  const { monthlyReport, yearlyReport } = useSelector(s => s.dashboard)
  const [tab, setTab] = useState('monthly')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(CURRENT_YEAR)
  const [loading, setLoading] = useState(false)
  const [prayerLog, setPrayerLog] = useState([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(PRAYER_STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      setPrayerLog(Array.isArray(parsed) ? parsed : [])
    } catch {
      setPrayerLog([])
    }
  }, [])

  const yearlyPrayerRate = useMemo(() => {
    return getYearlyPrayerRate(prayerLog, year)
  }, [prayerLog, year])

  const monthlyPrayerRate = useMemo(() => {
    return getMonthlyPrayerRate(prayerLog, year, month)
  }, [prayerLog, year, month])

  const load = async () => {
    setLoading(true)
    if (tab === 'monthly') await dispatch(fetchMonthlyReport({ month, year }))
    else await dispatch(fetchYearlyReport({ year }))
    setLoading(false)
  }

  useEffect(() => { load() }, [tab, month, year])

  const ScoreRing = ({ score, label, color = 'var(--accent)' }) => (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div style={{ position: 'relative', width: 90, height: 90, margin: '0 auto 10px' }}>
        <svg viewBox="0 0 90 90" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="45" cy="45" r="36" fill="none" stroke="#F0EDE6" strokeWidth="8" />
          <circle cx="45" cy="45" r="36" fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${(score / 100) * 226} 226`} strokeLinecap="round" />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{score}%</span>
        </div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</div>
    </div>
  )

  return (
    <div className="animate-fade-in">
      <PageHeader title="Reports" subtitle="Track your progress over time" />

      {/* Tab + filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
          {['monthly', 'yearly'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '7px 20px', borderRadius: 7, border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease',
                background: tab === t ? 'white' : 'transparent', color: tab === t ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: tab === t ? '0 1px 8px rgba(0,0,0,0.08)' : 'none' }}>
              {t === 'monthly' ? '📅 Monthly' : '📆 Yearly'}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {tab === 'monthly' && (
            <select className="input-field" value={month} onChange={e => setMonth(parseInt(e.target.value))} style={{ width: 140 }}>
              {MONTHS_LABELS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          )}
          <select className="input-field" value={year} onChange={e => setYear(parseInt(e.target.value))} style={{ width: 100 }}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : tab === 'monthly' ? (
        monthlyReport ? (
          <div>
            <h2 className="hero-title" style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, marginBottom: 20 }}>
              {MONTHS_LABELS[month - 1]} {year} Report
            </h2>
            {/* Score rings */}
            <div className="card" style={{ padding: '10px 20px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                <ScoreRing score={monthlyReport.productivityScore} label="Productivity Score" color="#2D6A4F" />
                <ScoreRing score={monthlyReport.habitCompletionRate} label="Habit Completion" color="#5C6BC0" />
                <ScoreRing score={monthlyReport.goalsTotal ? Math.round((monthlyReport.goalsCompleted / monthlyReport.goalsTotal) * 100) : 0} label="Goals Completed" color="#C77B2A" />
                <ScoreRing score={monthlyPrayerRate} label="Prayer Rate" color="#1E8449" />
              </div>
            </div>

            <div className="reports-grid" style={{ marginBottom: 20 }}>
              {/* Goals by category */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ fontWeight: 600, marginBottom: 16 }}>Goals by Category</div>
                {Object.keys(monthlyReport.goalsByCategory || {}).length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {Object.entries(monthlyReport.goalsByCategory).map(([cat, data]) => (
                      <div key={cat}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{cat}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{data.completed}/{data.total}</span>
                        </div>
                        <ProgressBar value={data.total ? (data.completed / data.total) * 100 : 0} color={CATEGORY_COLORS[cat] || '#888'} />
                      </div>
                    ))}
                  </div>
                ) : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No goals for this month</p>}
              </div>

              {/* Habit performance */}
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ fontWeight: 600, marginBottom: 16 }}>Habit Performance</div>
                {monthlyReport.habitDetails?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {monthlyReport.habitDetails.map(h => (
                      <div key={h.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                          <span style={{ fontSize: 13 }}>{h.icon} {h.name}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{h.completionRate}% · 🔥{h.streak}d</span>
                        </div>
                        <ProgressBar value={h.completionRate} color="#2D6A4F" />
                      </div>
                    ))}
                  </div>
                ) : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No habits tracked</p>}
              </div>
            </div>

            {/* Summary stats */}
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ fontWeight: 600, marginBottom: 14 }}>Monthly Summary</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
                {[
                  { label: 'Goals Completed', value: `${monthlyReport.goalsCompleted} / ${monthlyReport.goalsTotal}`, icon: '🎯' },
                  { label: 'Habits Tracked', value: monthlyReport.habitsTracked, icon: '🔁' },
                  { label: 'Habit Rate', value: `${monthlyReport.habitCompletionRate}%`, icon: '📊' },
                  { label: 'Productivity', value: `${monthlyReport.productivityScore}%`, icon: '⚡' },
                  { label: 'Prayer Rate', value: `${monthlyPrayerRate}%`, icon: '🕌' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ fontSize: 20 }}>{s.icon}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : <p style={{ color: 'var(--text-muted)' }}>No report data available</p>
      ) : (
        yearlyReport ? (
          <div>
            <h2 className="hero-title" style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, marginBottom: 20 }}>{year} Annual Report</h2>

            {/* Goal overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 20 }}>
              {[
                { label: 'Total Goals', value: yearlyReport.goals?.total, icon: '🎯', color: '#EEF0FD' },
                { label: 'Completed', value: yearlyReport.goals?.completed, icon: '✅', color: '#EAFAF1' },
                { label: 'In Progress', value: yearlyReport.goals?.inProgress, icon: '⏳', color: '#FDF3E7' },
                { label: 'Avg Progress', value: `${yearlyReport.goals?.avgProgress}%`, icon: '📈', color: '#E8F5EE' },
                { label: 'Habit Logs', value: yearlyReport.habits?.totalLogs, icon: '📋', color: '#FEF9E7' },
                { label: 'Prayer Rate', value: `${yearlyPrayerRate}%`, icon: '🕌', color: '#E8F5EE' },
              ].map(s => (
                <div key={s.label} className="card" style={{ padding: '18px 20px', background: s.color }}>
                  <div style={{ fontSize: 20 }}>{s.icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{s.value ?? '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Habits bar chart */}
            <div className="card" style={{ padding: '24px', marginBottom: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Monthly Habit Logs — {year}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Total habit entries each month</div>
              <div style={{ height: 220 }}>
                <Bar
                  data={{
                    labels: yearlyReport.monthlyBreakdown?.map(m => m.monthName) || [],
                    datasets: [{
                      label: 'Habit Logs',
                      data: yearlyReport.monthlyBreakdown?.map(m => m.habitLogs) || [],
                      backgroundColor: 'rgba(45,106,79,0.6)', borderRadius: 6, borderWidth: 0
                    }]
                  }}
                  options={chartOpts}
                />
              </div>
            </div>

            {/* Goals list */}
            {yearlyReport.allGoals?.length > 0 && (
              <div className="card" style={{ padding: '24px' }}>
                <div style={{ fontWeight: 600, marginBottom: 16 }}>All Goals — {year}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {yearlyReport.allGoals.map(g => (
                    <div key={g._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                        <Badge type={g.category}>{g.category}</Badge>
                        <span style={{ fontSize: 13, fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.title}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <div style={{ width: 80 }}><ProgressBar value={g.progress} color={CATEGORY_COLORS[g.category] || '#888'} /></div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', width: 36, textAlign: 'right' }}>{g.progress}%</span>
                        <Badge type={g.status}>{g.status.replace('-', ' ')}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : <p style={{ color: 'var(--text-muted)' }}>No report data available</p>
      )}
    </div>
  )
}
