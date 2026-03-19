import { useEffect, useMemo, useState } from 'react'
import { ProgressBar, StatCard } from '../components/common'

const STORAGE_KEYS = {
  prayer: 'lifeportal.namaz.prayerLog',
  quran: 'lifeportal.namaz.quranProgress',
  yearlyPrayerRates: 'lifeportal.namaz.yearlyPrayerRates'
}

const PRAYERS = [
  { key: 'fajr', label: 'Fajr' },
  { key: 'zuhar', label: 'Zuhar' },
  { key: 'asar', label: 'Asar' },
  { key: 'magrib', label: 'Magrib' },
  { key: 'isha', label: 'Isha' }
]

const STATUS_OPTIONS = ['Present', 'Absent', 'Kaza']
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const INITIAL_PRAYER_LOG = [
  { id: 1, date: '2026-08-15', fajr: 'Absent', zuhar: 'Present', asar: 'Present', magrib: 'Present', isha: 'Present' },
  { id: 2, date: '2026-08-16', fajr: 'Absent', zuhar: 'Present', asar: 'Absent', magrib: 'Absent', isha: 'Absent' }
]

const SURAH_NAMES = [
  'Al-Fatiha', 'Al-Baqarah', 'Al Imran', 'An-Nisa', "Al-Ma'idah", "Al-An'am", "Al-A'raf", 'Al-Anfal', 'At-Tawbah', 'Yunus',
  'Hud', 'Yusuf', "Ar-Ra'd", 'Ibrahim', 'Al-Hijr', 'An-Nahl', 'Al-Isra', 'Al-Kahf', 'Maryam', 'Ta-Ha',
  'Al-Anbiya', 'Al-Hajj', "Al-Mu'minun", 'An-Nur', 'Al-Furqan', "Ash-Shu'ara", 'An-Naml', 'Al-Qasas', 'Al-Ankabut', 'Ar-Rum',
  'Luqman', 'As-Sajdah', 'Al-Ahzab', 'Saba', 'Fatir', 'Ya-Sin', 'As-Saffat', 'Sad', 'Az-Zumar', 'Ghafir',
  'Fussilat', 'Ash-Shura', 'Az-Zukhruf', 'Ad-Dukhan', 'Al-Jathiyah', 'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf',
  'Adh-Dhariyat', 'At-Tur', 'An-Najm', 'Al-Qamar', 'Ar-Rahman', "Al-Waqi'ah", 'Al-Hadid', 'Al-Mujadila', 'Al-Hashr', 'Al-Mumtahanah',
  'As-Saf', "Al-Jumu'ah", 'Al-Munafiqun', 'At-Taghabun', 'At-Talaq', 'At-Tahrim', 'Al-Mulk', 'Al-Qalam', 'Al-Haqqah', "Al-Ma'arij",
  'Nuh', 'Al-Jinn', 'Al-Muzzammil', 'Al-Muddaththir', 'Al-Qiyamah', 'Al-Insan', 'Al-Mursalat', 'An-Naba', "An-Nazi'at", 'Abasa',
  'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin', 'Al-Inshiqaq', 'Al-Buruj', 'At-Tariq', "Al-A'la", 'Al-Ghashiyah', 'Al-Fajr', 'Al-Balad',
  'Ash-Shams', 'Al-Layl', 'Ad-Duhaa', 'Ash-Sharh', 'At-Tin', 'Al-Alaq', 'Al-Qadr', 'Al-Bayyinah', 'Az-Zalzalah', 'Al-Adiyat',
  "Al-Qari'ah", 'At-Takathur', 'Al-Asr', 'Al-Humazah', 'Al-Fil', 'Quraysh', "Al-Ma'un", 'Al-Kawthar', 'Al-Kafirun', 'An-Nasr',
  'Al-Masad', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas'
]

const SURAH_LIST = SURAH_NAMES.map((name, index) => ({ id: index + 1, name }))
const QURAN_STATUSES = ['pending', 'reading', 'done']

const DEFAULT_QURAN_STATUS = SURAH_LIST.reduce((acc, surah) => {
  acc[surah.id] = 'pending'
  return acc
}, {})

const STATUS_COLORS = {
  Present: { background: '#EAFAF1', color: '#1E8449' },
  Absent: { background: '#FDECEB', color: '#C0392B' },
  Kaza: { background: '#FEF9E7', color: '#D68910' }
}

const QURAN_STATUS_STYLES = {
  pending: { background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' },
  reading: { background: '#FEF9E7', color: '#C77B2A', border: '1px solid #F5CBA7' },
  done: { background: '#EAFAF1', color: '#1E8449', border: '1px solid #A9DFBF' }
}

const getTodayISO = () => new Date().toISOString().slice(0, 10)

const formatLongDate = (dateStr) => (
  new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
)

const getCompletedPrayerCount = (entries) => {
  let completed = 0

  entries.forEach(entry => {
    PRAYERS.forEach(prayer => {
      if (entry[prayer.key] === 'Present' || entry[prayer.key] === 'Kaza') completed += 1
    })
  })

  return completed
}

const getStatusCount = (entries, status) => {
  let count = 0

  entries.forEach(entry => {
    PRAYERS.forEach(prayer => {
      if (entry[prayer.key] === status) count += 1
    })
  })

  return count
}

const getDaysInMonth = (year, monthIndex) => new Date(year, monthIndex + 1, 0).getDate()
const getDaysInYear = (year) => Math.round((new Date(year + 1, 0, 1) - new Date(year, 0, 1)) / 86400000)
const getPrayerRate = (completed, total) => (total ? Math.round((completed / total) * 100) : 0)

const getMonthPrayerSummary = (entries, year, monthIndex) => {
  const filteredEntries = entries.filter(entry => {
    const date = new Date(entry.date)
    return date.getFullYear() === year && date.getMonth() === monthIndex
  })
  const completed = getCompletedPrayerCount(filteredEntries)
  const total = getDaysInMonth(year, monthIndex) * PRAYERS.length

  return {
    entries: filteredEntries,
    completed,
    total,
    daysLogged: filteredEntries.length,
    rate: getPrayerRate(completed, total)
  }
}

const getYearPrayerSummary = (entries, year) => {
  const filteredEntries = entries.filter(entry => new Date(entry.date).getFullYear() === year)
  const completed = getCompletedPrayerCount(filteredEntries)
  const total = getDaysInYear(year) * PRAYERS.length

  return {
    entries: filteredEntries,
    completed,
    total,
    daysLogged: filteredEntries.length,
    rate: getPrayerRate(completed, total)
  }
}

const getMonthAccent = (rate) => {
  if (rate >= 80) return { background: 'linear-gradient(135deg, #E8F5EE, #F7FBF9)', border: '#B8DEC9', text: '#1E8449' }
  if (rate >= 60) return { background: 'linear-gradient(135deg, #FEF8E9, #FFFDF6)', border: '#F5D89C', text: '#C77B2A' }
  return { background: 'linear-gradient(135deg, #F9F3EE, #FFFFFF)', border: 'var(--border)', text: 'var(--text-primary)' }
}

const emptyDayEntry = (date) => ({
  date,
  fajr: 'Absent',
  zuhar: 'Absent',
  asar: 'Absent',
  magrib: 'Absent',
  isha: 'Absent'
})

const getBoardSymbol = (value) => {
  if (value === 'Present') return '\u2713'
  if (value === 'Absent') return '\u00D7'
  if (value === 'Kaza') return 'K'
  return '-'
}

const metricIcon = (label) => <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em' }}>{label}</span>

export default function NamazTracker() {
  const todayISO = getTodayISO()
  const [tab, setTab] = useState('today')
  const [prayerLog, setPrayerLog] = useState(() => {
    if (typeof window === 'undefined') return INITIAL_PRAYER_LOG
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.prayer)
      const parsed = raw ? JSON.parse(raw) : null
      return Array.isArray(parsed) ? parsed : INITIAL_PRAYER_LOG
    } catch {
      return INITIAL_PRAYER_LOG
    }
  })
  const [quranStatus, setQuranStatus] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_QURAN_STATUS
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.quran)
      const parsed = raw ? JSON.parse(raw) : null
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const merged = { ...DEFAULT_QURAN_STATUS }
        Object.keys(parsed).forEach(key => {
          if (merged[key] && QURAN_STATUSES.includes(parsed[key])) merged[key] = parsed[key]
        })
        return merged
      }
      return DEFAULT_QURAN_STATUS
    } catch {
      return DEFAULT_QURAN_STATUS
    }
  })
  const [todayForm, setTodayForm] = useState(() => {
    const existing = prayerLog.find(entry => entry.date === todayISO)
    return existing ? { ...existing } : emptyDayEntry(todayISO)
  })
  const [selectedHistoryYear, setSelectedHistoryYear] = useState(new Date().getFullYear())

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.prayer, JSON.stringify(prayerLog))
    } catch {
      // ignore storage errors
    }
  }, [prayerLog])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.quran, JSON.stringify(quranStatus))
    } catch {
      // ignore storage errors
    }
  }, [quranStatus])

  useEffect(() => {
    const existing = prayerLog.find(entry => entry.date === todayISO)
    setTodayForm(existing ? { ...existing } : emptyDayEntry(todayISO))
  }, [prayerLog, todayISO])

  const currentDate = new Date(todayISO)
  const thisMonth = currentDate.getMonth()
  const thisYear = currentDate.getFullYear()

  const availableYears = useMemo(() => {
    const years = [...new Set([thisYear, ...prayerLog.map(entry => new Date(entry.date).getFullYear())])]
      .filter(year => !Number.isNaN(year))
      .sort((a, b) => b - a)
    return years.length ? years : [thisYear]
  }, [prayerLog, thisYear])

  useEffect(() => {
    if (!availableYears.includes(selectedHistoryYear)) {
      setSelectedHistoryYear(availableYears[0])
    }
  }, [availableYears, selectedHistoryYear])

  const monthSummary = useMemo(() => getMonthPrayerSummary(prayerLog, thisYear, thisMonth), [prayerLog, thisMonth, thisYear])
  const monthEntries = useMemo(() => [...monthSummary.entries].sort((a, b) => a.date.localeCompare(b.date)), [monthSummary.entries])
  const monthRate = monthSummary.rate
  const daysLogged = monthSummary.daysLogged
  const kazaAllTime = useMemo(() => getStatusCount(prayerLog, 'Kaza'), [prayerLog])
  const selectedYearSummary = useMemo(() => getYearPrayerSummary(prayerLog, selectedHistoryYear), [prayerLog, selectedHistoryYear])
  const historyMonths = useMemo(() => (
    MONTH_LABELS.map((label, index) => {
      const summary = getMonthPrayerSummary(selectedYearSummary.entries, selectedHistoryYear, index)
      return { label, completed: summary.completed, total: summary.total, daysLogged: summary.daysLogged, rate: summary.rate }
    })
  ), [selectedHistoryYear, selectedYearSummary.entries])
  const yearlyPrayerRecords = useMemo(() => (
    availableYears.map(year => ({ year, totalYearPrayerRate: getYearPrayerSummary(prayerLog, year).rate }))
  ), [availableYears, prayerLog])

  const todayCompleted = PRAYERS.filter(prayer => todayForm[prayer.key] === 'Present' || todayForm[prayer.key] === 'Kaza').length
  const todayRate = getPrayerRate(todayCompleted, PRAYERS.length)
  const quranCounts = { done: 0, reading: 0, pending: 0 }
  SURAH_LIST.forEach(surah => {
    const status = quranStatus[surah.id] || 'pending'
    if (quranCounts[status] !== undefined) quranCounts[status] += 1
  })
  const quranProgressPercent = Math.round((quranCounts.done / SURAH_LIST.length) * 100)
  const currentMonthDays = useMemo(() => (
    Array.from({ length: getDaysInMonth(thisYear, thisMonth) }, (_, index) => new Date(thisYear, thisMonth, index + 1))
  ), [thisMonth, thisYear])
  const entriesByDate = useMemo(() => (
    prayerLog.reduce((acc, entry) => {
      acc[entry.date] = entry
      return acc
    }, {})
  ), [prayerLog])
  const monthBoardMinWidth = Math.max(1080, (currentMonthDays.length * 42) + 116)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.yearlyPrayerRates, JSON.stringify(yearlyPrayerRecords))
    } catch {
      // ignore storage errors
    }
  }, [yearlyPrayerRecords])

  const saveToday = () => {
    setPrayerLog(prev => {
      const exists = prev.find(entry => entry.date === todayISO)
      if (exists) return prev.map(entry => (entry.date === todayISO ? { ...entry, ...todayForm } : entry))
      return [{ id: Date.now(), ...todayForm }, ...prev]
    })
  }

  const cycleQuranStatus = (id) => {
    setQuranStatus(prev => {
      const current = prev[id] || 'pending'
      const currentIndex = QURAN_STATUSES.indexOf(current)
      const next = QURAN_STATUSES[(currentIndex + 1) % QURAN_STATUSES.length]
      return { ...prev, [id]: next }
    })
  }

  return (
    <div className="animate-fade-in" style={{ width: '100%', minWidth: 0, overflowX: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 400 }}>Namaz Tracker</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatLongDate(todayISO)}</div>
          <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>{todayRate}% today</span>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, margin: 0 }}>Namaz & Quran Tracker</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Track your prayers daily and monitor your monthly consistency with a full-month board.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20, minWidth: 0 }}>
        <StatCard icon={metricIcon('MR')} label="This Month" value={`${monthRate}%`} sub={`${monthSummary.completed}/${monthSummary.total} prayers`} accent="#E8F5EE" />
        <StatCard icon={metricIcon('DL')} label="Days Logged" value={daysLogged} sub="saved this month" accent="#EEF0FD" />
        <StatCard icon={metricIcon('KZ')} label="Kaza (All Time)" value={kazaAllTime} sub="total count" accent="#FEF9E7" />
        <StatCard icon={metricIcon('QR')} label="Quran Progress" value={`${quranCounts.done}/114`} sub="surahs completed" accent="#EAFAF1" />
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid var(--border)', marginBottom: 18 }}>
        {['today', 'monthly', 'history', 'quran'].map(section => (
          <button
            key={section}
            className="btn btn-ghost"
            type="button"
            onClick={() => setTab(section)}
            style={{
              padding: '8px 4px',
              borderBottom: section === tab ? '2px solid var(--accent)' : '2px solid transparent',
              borderRadius: 0,
              fontSize: 13,
              color: section === tab ? 'var(--accent)' : 'var(--text-muted)'
            }}
          >
            {section === 'today' ? 'Today' : section === 'monthly' ? 'Monthly' : section === 'history' ? 'History' : 'Quran'}
          </button>
        ))}
      </div>

      {tab === 'today' && (
        <>
          <div className="card" style={{ padding: 16, marginBottom: 16, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Today&apos;s Prayers - {formatLongDate(todayISO)}
              </div>
              <button className="btn btn-primary" type="button" onClick={saveToday} style={{ padding: '6px 14px', fontSize: 12 }}>Save</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, minWidth: 0 }}>
              {PRAYERS.map(prayer => (
                <div key={prayer.key}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: 12, marginBottom: 6, color: 'var(--text-muted)' }}>{prayer.label}</label>
                  <select
                    className="input-field"
                    value={todayForm[prayer.key]}
                    onChange={event => setTodayForm(prev => ({ ...prev, [prayer.key]: event.target.value }))}
                    style={{ height: 36 }}
                  >
                    {STATUS_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 16, overflow: 'hidden', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>This Month Prayer Board</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: '#EEF7F1', color: '#1E8449' }}>{monthSummary.completed} marked</span>
                <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)' }}>{monthSummary.total} total prayers</span>
              </div>
            </div>

            <div className="desktop-only" style={{ border: '1px solid var(--border)', borderRadius: 18, padding: 12, background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(247,243,235,0.84))', overflow: 'hidden', minWidth: 0 }}>
              <div style={{ display: 'block', width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch', paddingBottom: 4, margin: 0 }}>
                <table style={{ borderCollapse: 'separate', borderSpacing: '0 10px', minWidth: monthBoardMinWidth, width: 'max-content', maxWidth: 'none' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', padding: '6px 10px', position: 'sticky', left: 0, background: 'rgba(255,255,255,0.96)', zIndex: 2, minWidth: 96 }}>
                        Prayer
                      </th>
                      {currentMonthDays.map(day => (
                        <th key={day.toISOString()} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', padding: '6px 2px', minWidth: 48 }}>
                          <div style={{ fontWeight: 700 }}>{day.toLocaleDateString('en-US', { day: '2-digit' })}</div>
                          <div style={{ fontSize: 10 }}>{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PRAYERS.map(prayer => (
                      <tr key={prayer.key}>
                        <td style={{ fontSize: 12, fontWeight: 600, padding: '6px 10px', position: 'sticky', left: 0, background: 'rgba(255,255,255,0.96)', zIndex: 1 }}>
                          {prayer.label}
                        </td>
                        {currentMonthDays.map(day => {
                          const dateKey = day.toISOString().slice(0, 10)
                          const entry = entriesByDate[dateKey]
                          const value = entry ? entry[prayer.key] : '-'
                          const style = STATUS_COLORS[value] || { background: 'var(--surface-2)', color: 'var(--text-muted)' }

                          return (
                            <td key={`${prayer.key}-${dateKey}`} style={{ padding: '4px 6px' }}>
                              <div
                                title={`${prayer.label} on ${dateKey}: ${value === '-' ? 'Not marked' : value}`}
                                style={{
                                  width: '100%',
                                  minWidth: 38,
                                  height: 36,
                                  borderRadius: 9,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 12,
                                  fontWeight: 700,
                                  background: style.background,
                                  color: style.color
                                }}
                              >
                                {getBoardSymbol(value)}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mobile-only" style={{ marginTop: 0 }}>
              <div style={{ display: 'grid', gap: 12 }}>
                {PRAYERS.map(prayer => (
                  <div
                    key={`mobile-${prayer.key}`}
                    style={{
                      border: '1px solid var(--border)',
                      borderRadius: 16,
                      padding: 12,
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,243,235,0.88))',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
                      {prayer.label}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 6 }}>
                      {currentMonthDays.map(day => {
                        const dateKey = day.toISOString().slice(0, 10)
                        const entry = entriesByDate[dateKey]
                        const value = entry ? entry[prayer.key] : '-'
                        const style = STATUS_COLORS[value] || { background: 'var(--surface-2)', color: 'var(--text-muted)' }

                        return (
                          <div
                            key={`mobile-${prayer.key}-${dateKey}`}
                            title={`${prayer.label} on ${dateKey}: ${value === '-' ? 'Not marked' : value}`}
                            style={{
                              minWidth: 0,
                              borderRadius: 10,
                              padding: '6px 2px',
                              background: style.background,
                              color: style.color,
                              textAlign: 'center'
                            }}
                          >
                            <div style={{ fontSize: 10, fontWeight: 700, lineHeight: 1 }}>{day.getDate()}</div>
                            <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4, lineHeight: 1 }}>
                              {getBoardSymbol(value)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <span className="badge" style={STATUS_COLORS.Present}>{'\u2713'} Present</span>
              <span className="badge" style={STATUS_COLORS.Kaza}>K Kaza</span>
              <span className="badge" style={STATUS_COLORS.Absent}>{'\u00D7'} Absent</span>
            </div>
          </div>
        </>
      )}

      {tab === 'monthly' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Prayer Completion</div>
            <ProgressBar value={monthRate} showLabel />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              {monthSummary.completed}/{monthSummary.total} prayers marked present or kaza this month
            </div>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>This Month Log</div>
            <div className="desktop-only" style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-2)' }}>
                    {['Date', 'Fajr', 'Zuhar', 'Asar', 'Magrib', 'Isha'].map(header => (
                      <th key={header} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 12, color: 'var(--text-muted)' }}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthEntries.map(entry => (
                    <tr key={entry.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 12px', fontSize: 12 }}>{entry.date}</td>
                      {PRAYERS.map(prayer => (
                        <td key={prayer.key} style={{ padding: '10px 12px' }}>
                          <span className="badge" style={STATUS_COLORS[entry[prayer.key]] || STATUS_COLORS.Absent}>{entry[prayer.key]}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mobile-only" style={{ padding: '16px 20px', display: 'grid', gap: 12 }}>
              {monthEntries.map(entry => (
                <div key={entry.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{entry.date}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {PRAYERS.map(prayer => (
                      <span key={prayer.key} className="badge" style={STATUS_COLORS[entry[prayer.key]] || STATUS_COLORS.Absent}>
                        {prayer.label}: {entry[prayer.key]}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 600 }}>Yearly Prayer History</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>View all 12 months and the total prayer rate for {selectedHistoryYear}.</div>
              </div>
              <select className="input-field" value={selectedHistoryYear} onChange={event => setSelectedHistoryYear(parseInt(event.target.value, 10))} style={{ width: 120 }}>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              <div className="card" style={{ padding: '18px', background: 'linear-gradient(135deg, #E8F5EE, #F6FBF8)', borderColor: '#B8DEC9', boxShadow: 'none' }}>
                <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1E8449', fontWeight: 700 }}>Year Prayer Rate</div>
                <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8, color: '#1E8449' }}>{selectedYearSummary.rate}%</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
                  {selectedYearSummary.completed}/{selectedYearSummary.total} prayers marked present or kaza
                </div>
              </div>

              <div className="card" style={{ padding: '18px', background: 'linear-gradient(135deg, #FEF8E9, #FFFDF8)', borderColor: '#F2D9A6', boxShadow: 'none' }}>
                <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C77B2A', fontWeight: 700 }}>Months Covered</div>
                <div style={{ fontSize: 32, fontWeight: 700, marginTop: 8, color: '#C77B2A' }}>{historyMonths.filter(month => month.daysLogged > 0).length}/12</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>Months with saved prayer entries in {selectedHistoryYear}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
            {historyMonths.map(month => {
              const accent = getMonthAccent(month.rate)
              return (
                <div key={month.label} className="card" style={{ padding: '18px 16px', background: accent.background, borderColor: accent.border }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
                        {selectedHistoryYear}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 18, color: accent.text, marginTop: 2 }}>{month.label}</div>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: accent.text }}>{month.rate}%</div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <ProgressBar value={month.rate} color={month.rate >= 80 ? '#1E8449' : month.rate >= 60 ? '#C77B2A' : '#A09890'} />
                  </div>

                  <div style={{ marginTop: 12, display: 'grid', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <div>{month.completed}/{month.total} prayers present or kaza</div>
                    <div>{month.daysLogged} day{month.daysLogged === 1 ? '' : 's'} logged</div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>Saved Year Records</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              {yearlyPrayerRecords.map(record => (
                <div key={record.year} style={{ border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', background: 'rgba(255,255,255,0.72)' }}>
                  <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Year</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 8, marginTop: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 22 }}>{record.year}</div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent)' }}>{record.totalYearPrayerRate}%</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Total year prayer rate</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'quran' && (
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 600, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Quran Progress - All 114 Surahs</div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{quranCounts.done}/114 ({quranProgressPercent}%)</div>
          </div>
          <div style={{ marginTop: 10 }}>
            <ProgressBar value={quranProgressPercent} color="var(--accent)" />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <span className="badge" style={QURAN_STATUS_STYLES.done}>{'\u2713'} Done ({quranCounts.done})</span>
            <span className="badge" style={QURAN_STATUS_STYLES.reading}>Reading ({quranCounts.reading})</span>
            <span className="badge" style={QURAN_STATUS_STYLES.pending}>Pending ({quranCounts.pending})</span>
          </div>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
            {SURAH_LIST.map(surah => {
              const status = quranStatus[surah.id] || 'pending'
              const style = QURAN_STATUS_STYLES[status] || QURAN_STATUS_STYLES.pending
              return (
                <button
                  key={surah.id}
                  type="button"
                  onClick={() => cycleQuranStatus(surah.id)}
                  className="card"
                  style={{ ...style, padding: '10px 8px', textAlign: 'center', cursor: 'pointer', boxShadow: 'none', borderRadius: 10 }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.7 }}>#{surah.id}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4, lineHeight: 1.2 }}>{surah.name}</div>
                  <div style={{ fontSize: 10, marginTop: 6, opacity: 0.8 }}>
                    {status === 'done' ? '\u2713 Done' : status === 'reading' ? 'Reading' : 'Pending'}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
