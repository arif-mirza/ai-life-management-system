import { useEffect, useState } from 'react'
import { ProgressBar, StatCard } from '../components/common'

const STORAGE_KEYS = {
  prayer: 'lifeportal.namaz.prayerLog',
  quran: 'lifeportal.namaz.quranProgress'
}

const PRAYERS = [
  { key: 'fajr', label: 'Fajr' },
  { key: 'zuhar', label: 'Zuhar' },
  { key: 'asar', label: 'Asar' },
  { key: 'magrib', label: 'Magrib' },
  { key: 'isha', label: 'Isha' }
]

const STATUS_OPTIONS = ['Present', 'Absent', 'Kaza']

const INITIAL_PRAYER_LOG = [
  { id: 1, date: '2026-08-15', fajr: 'Absent', zuhar: 'Present', asar: 'Present', magrib: 'Present', isha: 'Present' },
  { id: 2, date: '2026-08-16', fajr: 'Absent', zuhar: 'Present', asar: 'Absent', magrib: 'Absent', isha: 'Absent' }
]

const SURAH_LIST = [
  { id: 1, name: 'Al-Fatiha' },
  { id: 2, name: 'Al-Baqarah' },
  { id: 3, name: 'Al Imran' },
  { id: 4, name: 'An-Nisa' },
  { id: 5, name: 'Al-Ma\'idah' },
  { id: 6, name: 'Al-An\'am' },
  { id: 7, name: 'Al-A\'raf' },
  { id: 8, name: 'Al-Anfal' },
  { id: 9, name: 'At-Tawbah' },
  { id: 10, name: 'Yunus' },
  { id: 11, name: 'Hud' },
  { id: 12, name: 'Yusuf' },
  { id: 13, name: 'Ar-Ra\'d' },
  { id: 14, name: 'Ibrahim' },
  { id: 15, name: 'Al-Hijr' },
  { id: 16, name: 'An-Nahl' },
  { id: 17, name: 'Al-Isra' },
  { id: 18, name: 'Al-Kahf' },
  { id: 19, name: 'Maryam' },
  { id: 20, name: 'Ta-Ha' },
  { id: 21, name: 'Al-Anbiya' },
  { id: 22, name: 'Al-Hajj' },
  { id: 23, name: 'Al-Mu\'minun' },
  { id: 24, name: 'An-Nur' },
  { id: 25, name: 'Al-Furqan' },
  { id: 26, name: 'Ash-Shu\'ara' },
  { id: 27, name: 'An-Naml' },
  { id: 28, name: 'Al-Qasas' },
  { id: 29, name: 'Al-Ankabut' },
  { id: 30, name: 'Ar-Rum' },
  { id: 31, name: 'Luqman' },
  { id: 32, name: 'As-Sajdah' },
  { id: 33, name: 'Al-Ahzab' },
  { id: 34, name: 'Saba' },
  { id: 35, name: 'Fatir' },
  { id: 36, name: 'Ya-Sin' },
  { id: 37, name: 'As-Saffat' },
  { id: 38, name: 'Sad' },
  { id: 39, name: 'Az-Zumar' },
  { id: 40, name: 'Ghafir' },
  { id: 41, name: 'Fussilat' },
  { id: 42, name: 'Ash-Shura' },
  { id: 43, name: 'Az-Zukhruf' },
  { id: 44, name: 'Ad-Dukhan' },
  { id: 45, name: 'Al-Jathiyah' },
  { id: 46, name: 'Al-Ahqaf' },
  { id: 47, name: 'Muhammad' },
  { id: 48, name: 'Al-Fath' },
  { id: 49, name: 'Al-Hujurat' },
  { id: 50, name: 'Qaf' },
  { id: 51, name: 'Adh-Dhariyat' },
  { id: 52, name: 'At-Tur' },
  { id: 53, name: 'An-Najm' },
  { id: 54, name: 'Al-Qamar' },
  { id: 55, name: 'Ar-Rahman' },
  { id: 56, name: 'Al-Waqi\'ah' },
  { id: 57, name: 'Al-Hadid' },
  { id: 58, name: 'Al-Mujadila' },
  { id: 59, name: 'Al-Hashr' },
  { id: 60, name: 'Al-Mumtahanah' },
  { id: 61, name: 'As-Saf' },
  { id: 62, name: 'Al-Jumu\'ah' },
  { id: 63, name: 'Al-Munafiqun' },
  { id: 64, name: 'At-Taghabun' },
  { id: 65, name: 'At-Talaq' },
  { id: 66, name: 'At-Tahrim' },
  { id: 67, name: 'Al-Mulk' },
  { id: 68, name: 'Al-Qalam' },
  { id: 69, name: 'Al-Haqqah' },
  { id: 70, name: 'Al-Ma\'arij' },
  { id: 71, name: 'Nuh' },
  { id: 72, name: 'Al-Jinn' },
  { id: 73, name: 'Al-Muzzammil' },
  { id: 74, name: 'Al-Muddaththir' },
  { id: 75, name: 'Al-Qiyamah' },
  { id: 76, name: 'Al-Insan' },
  { id: 77, name: 'Al-Mursalat' },
  { id: 78, name: 'An-Naba' },
  { id: 79, name: 'An-Nazi\'at' },
  { id: 80, name: 'Abasa' },
  { id: 81, name: 'At-Takwir' },
  { id: 82, name: 'Al-Infitar' },
  { id: 83, name: 'Al-Mutaffifin' },
  { id: 84, name: 'Al-Inshiqaq' },
  { id: 85, name: 'Al-Buruj' },
  { id: 86, name: 'At-Tariq' },
  { id: 87, name: 'Al-A\'la' },
  { id: 88, name: 'Al-Ghashiyah' },
  { id: 89, name: 'Al-Fajr' },
  { id: 90, name: 'Al-Balad' },
  { id: 91, name: 'Ash-Shams' },
  { id: 92, name: 'Al-Layl' },
  { id: 93, name: 'Ad-Duhaa' },
  { id: 94, name: 'Ash-Sharh' },
  { id: 95, name: 'At-Tin' },
  { id: 96, name: 'Al-Alaq' },
  { id: 97, name: 'Al-Qadr' },
  { id: 98, name: 'Al-Bayyinah' },
  { id: 99, name: 'Az-Zalzalah' },
  { id: 100, name: 'Al-Adiyat' },
  { id: 101, name: 'Al-Qari\'ah' },
  { id: 102, name: 'At-Takathur' },
  { id: 103, name: 'Al-Asr' },
  { id: 104, name: 'Al-Humazah' },
  { id: 105, name: 'Al-Fil' },
  { id: 106, name: 'Quraysh' },
  { id: 107, name: 'Al-Ma\'un' },
  { id: 108, name: 'Al-Kawthar' },
  { id: 109, name: 'Al-Kafirun' },
  { id: 110, name: 'An-Nasr' },
  { id: 111, name: 'Al-Masad' },
  { id: 112, name: 'Al-Ikhlas' },
  { id: 113, name: 'Al-Falaq' },
  { id: 114, name: 'An-Nas' }
]

const QURAN_STATUSES = ['pending', 'reading', 'done']

const DEFAULT_QURAN_STATUS = SURAH_LIST.reduce((acc, s) => {
  acc[s.id] = 'pending'
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

const emptyDayEntry = (date) => ({
  date,
  fajr: 'Absent',
  zuhar: 'Absent',
  asar: 'Absent',
  magrib: 'Absent',
  isha: 'Absent'
})

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
    const existing = prayerLog.find(p => p.date === todayISO)
    return existing ? { ...existing } : emptyDayEntry(todayISO)
  })

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
    const existing = prayerLog.find(p => p.date === todayISO)
    setTodayForm(existing ? { ...existing } : emptyDayEntry(todayISO))
  }, [prayerLog, todayISO])

  const thisMonth = new Date().getMonth()
  const thisYear = new Date().getFullYear()
  const monthEntries = prayerLog.filter(p => {
    const d = new Date(p.date)
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear
  })

  let monthPresent = 0
  let monthTotal = 0
  let kazaAllTime = 0
  prayerLog.forEach(entry => {
    PRAYERS.forEach(p => {
      if (entry[p.key] === 'Kaza') kazaAllTime += 1
    })
  })
  monthEntries.forEach(entry => {
    PRAYERS.forEach(p => {
      monthTotal += 1
      if (entry[p.key] === 'Present') monthPresent += 1
    })
  })
  const monthRate = monthTotal ? Math.round((monthPresent / monthTotal) * 100) : 0
  const daysLogged = monthEntries.length

  const todayPresent = PRAYERS.filter(p => todayForm[p.key] === 'Present').length
  const todayRate = PRAYERS.length ? Math.round((todayPresent / PRAYERS.length) * 100) : 0

  const quranCounts = { done: 0, reading: 0, pending: 0 }
  SURAH_LIST.forEach(s => {
    const status = quranStatus[s.id] || 'pending'
    if (quranCounts[status] !== undefined) quranCounts[status] += 1
  })
  const quranProgressPercent = Math.round((quranCounts.done / SURAH_LIST.length) * 100)

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })

  const entriesByDate = prayerLog.reduce((acc, entry) => {
    acc[entry.date] = entry
    return acc
  }, {})

  const saveToday = () => {
    setPrayerLog(prev => {
      const exists = prev.find(p => p.date === todayISO)
      if (exists) {
        return prev.map(p => (p.date === todayISO ? { ...p, ...todayForm } : p))
      }
      return [{ id: Date.now(), ...todayForm }, ...prev]
    })
  }

  const cycleQuranStatus = (id) => {
    setQuranStatus(prev => {
      const current = prev[id] || 'pending'
      const idx = QURAN_STATUSES.indexOf(current)
      const next = QURAN_STATUSES[(idx + 1) % QURAN_STATUSES.length]
      return { ...prev, [id]: next }
    })
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 400 }}>Namaz Tracker</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatLongDate(todayISO)}</div>
          <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
            {todayRate}% today
          </span>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, margin: 0 }}>Namaz & Quran Tracker</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Track your prayers daily and monitor monthly consistency.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
        <StatCard icon="🕌" label="This Month" value={`${monthRate}%`} sub="prayer rate" />
        <StatCard icon="📅" label="Days Logged" value={daysLogged} sub="this month" accent="#EEF0FD" />
        <StatCard icon="⚠️" label="Kaza (All Time)" value={kazaAllTime} sub="total count" accent="#FEF9E7" />
        <StatCard icon="📖" label="Quran Progress" value={`${quranCounts.done}/114`} sub="surahs completed" accent="#EAFAF1" />
      </div>

      <div style={{ display: 'flex', gap: 20, alignItems: 'center', borderBottom: '1px solid var(--border)', marginBottom: 18 }}>
        {['today', 'monthly', 'history', 'quran'].map(t => (
          <button
            key={t}
            className="btn btn-ghost"
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: '8px 4px',
              borderBottom: t === tab ? '2px solid var(--accent)' : '2px solid transparent',
              borderRadius: 0,
              fontSize: 13,
              color: t === tab ? 'var(--accent)' : 'var(--text-muted)'
            }}
          >
            {t === 'today' ? 'Today' : t === 'monthly' ? 'Monthly' : t === 'history' ? 'History' : 'Quran'}
          </button>
        ))}
      </div>

      {tab === 'today' && (
        <>
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Today&#39;s Prayers — {formatLongDate(todayISO)}
              </div>
              <button className="btn btn-primary" type="button" onClick={saveToday} style={{ padding: '6px 14px', fontSize: 12 }}>
                Save
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
              {PRAYERS.map(prayer => (
                <div key={prayer.key}>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: 12, marginBottom: 6, color: 'var(--text-muted)' }}>
                    {prayer.label}
                  </label>
                  <select
                    className="input-field"
                    value={todayForm[prayer.key]}
                    onChange={e => setTodayForm(prev => ({ ...prev, [prayer.key]: e.target.value }))}
                    style={{ height: 36 }}
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
              Last 7 Days
            </div>
            <div className="desktop-only" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px', minWidth: 680 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', padding: '6px 8px' }}>Prayer</th>
                    {last7Days.map(d => (
                      <th key={d.toISOString()} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', padding: '6px 8px' }}>
                        {d.toLocaleDateString('en-US', { day: '2-digit', weekday: 'short' })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PRAYERS.map(prayer => (
                    <tr key={prayer.key}>
                      <td style={{ fontSize: 12, fontWeight: 600, padding: '6px 8px' }}>{prayer.label}</td>
                      {last7Days.map(d => {
                        const key = d.toISOString().slice(0, 10)
                        const entry = entriesByDate[key]
                        const value = entry ? entry[prayer.key] : '-'
                        const style = STATUS_COLORS[value] || { background: 'var(--surface-2)', color: 'var(--text-muted)' }
                        const symbol = value === 'Present' ? '✓' : value === 'Absent' ? '✕' : value === 'Kaza' ? 'K' : '—'
                        return (
                          <td key={`${prayer.key}-${key}`} style={{ padding: '4px 6px' }}>
                            <div style={{
                              width: '100%',
                              minWidth: 64,
                              textAlign: 'center',
                              borderRadius: 8,
                              padding: '6px 0',
                              fontSize: 12,
                              fontWeight: 600,
                              background: style.background,
                              color: style.color
                            }}>
                              {symbol}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mobile-only" style={{ display: 'grid', gap: 10 }}>
              {PRAYERS.map(prayer => (
                <div key={prayer.key} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 10 }}>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{prayer.label}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginTop: 8 }}>
                    {last7Days.map(d => {
                      const key = d.toISOString().slice(0, 10)
                      const entry = entriesByDate[key]
                      const value = entry ? entry[prayer.key] : '-'
                      const style = STATUS_COLORS[value] || { background: 'var(--surface-2)', color: 'var(--text-muted)' }
                      const symbol = value === 'Present' ? '✓' : value === 'Absent' ? '✕' : value === 'Kaza' ? 'K' : '—'
                      return (
                        <div key={`${prayer.key}-${key}`} style={{
                          textAlign: 'center',
                          borderRadius: 6,
                          padding: '6px 0',
                          fontSize: 11,
                          fontWeight: 600,
                          background: style.background,
                          color: style.color
                        }}>
                          {symbol}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <span className="badge" style={STATUS_COLORS.Present}>✓ Present</span>
              <span className="badge" style={STATUS_COLORS.Kaza}>K Kaza</span>
              <span className="badge" style={STATUS_COLORS.Absent}>✕ Absent</span>
            </div>
          </div>
        </>
      )}

      {tab === 'monthly' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Prayer Completion</div>
            <ProgressBar value={monthRate} showLabel />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              {monthPresent}/{monthTotal} prayers completed this month
            </div>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>This Month Log</div>
            <div className="desktop-only" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-2)' }}>
                    {['Date', 'Fajr', 'Zuhar', 'Asar', 'Magrib', 'Isha'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 12, color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthEntries.map(p => (
                    <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 12px', fontSize: 12 }}>{p.date}</td>
                      {PRAYERS.map(pr => (
                        <td key={pr.key} style={{ padding: '10px 12px' }}>
                          <span className="badge" style={STATUS_COLORS[p[pr.key]] || STATUS_COLORS.Absent}>{p[pr.key]}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mobile-only" style={{ padding: '16px 20px', display: 'grid', gap: 12 }}>
              {monthEntries.map(p => (
                <div key={p.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{p.date}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {PRAYERS.map(pr => (
                      <span key={pr.key} className="badge" style={STATUS_COLORS[p[pr.key]] || STATUS_COLORS.Absent}>
                        {pr.label}: {p[pr.key]}
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
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Prayer Log History</div>
          <div className="desktop-only" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  {['Date', 'Fajr', 'Zuhar', 'Asar', 'Magrib', 'Isha'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 12, color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prayerLog.map(p => (
                  <tr key={p.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>{p.date}</td>
                    {PRAYERS.map(pr => (
                      <td key={pr.key} style={{ padding: '10px 12px' }}>
                        <span className="badge" style={STATUS_COLORS[p[pr.key]] || STATUS_COLORS.Absent}>{p[pr.key]}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mobile-only" style={{ padding: '16px 20px', display: 'grid', gap: 12 }}>
            {prayerLog.map(p => (
              <div key={p.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
                <div style={{ fontWeight: 600, fontSize: 12 }}>{p.date}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {PRAYERS.map(pr => (
                    <span key={pr.key} className="badge" style={STATUS_COLORS[p[pr.key]] || STATUS_COLORS.Absent}>
                      {pr.label}: {p[pr.key]}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'quran' && (
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 600, fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Quran Progress — All 114 Surahs
            </div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{quranCounts.done}/114 ({quranProgressPercent}%)</div>
          </div>
          <div style={{ marginTop: 10 }}>
            <ProgressBar value={quranProgressPercent} color="var(--accent)" />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <span className="badge" style={QURAN_STATUS_STYLES.done}>✓ Done ({quranCounts.done})</span>
            <span className="badge" style={QURAN_STATUS_STYLES.reading}>📖 Reading ({quranCounts.reading})</span>
            <span className="badge" style={QURAN_STATUS_STYLES.pending}>• Pending ({quranCounts.pending})</span>
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
                  style={{
                    ...style,
                    padding: '10px 8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: 'none',
                    borderRadius: 10
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.7 }}>#{surah.id}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4, lineHeight: 1.2 }}>
                    {surah.name}
                  </div>
                  <div style={{ fontSize: 10, marginTop: 6, opacity: 0.8 }}>
                    {status === 'done' ? '✓ Done' : status === 'reading' ? 'Reading' : 'Pending'}
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
