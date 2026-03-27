import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  fetchPrayerLog, savePrayerEntry, fetchQuranProgress,
  saveQuranStatus, optimisticQuranUpdate, bulkImportPrayerLog, bulkImportQuran
} from '../store/namazSlice'
import { ProgressBar, StatCard, LoadingSpinner, PrayerRing } from '../components/common'
import toast from 'react-hot-toast'

const PRAYERS = [
  { key: 'fajr', label: 'Fajr', icon: '🌅' },
  { key: 'zuhar', label: 'Zuhar', icon: '☀️' },
  { key: 'asar', label: 'Asar', icon: '🌤️' },
  { key: 'magrib', label: 'Magrib', icon: '🌇' },
  { key: 'isha', label: 'Isha', icon: '🌙' }
]
const STATUS_OPTIONS = ['Present', 'Absent', 'Kaza']
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const STATUS_COLORS = {
  Present: { background: '#e2f5ea', color: '#1a7a42' },
  Absent:  { background: '#fce8e6', color: '#b83225' },
  Kaza:    { background: '#fef8e7', color: '#b8780a' }
}
const SURAH_NAMES = [
  'Al-Fatiha','Al-Baqarah','Al Imran','An-Nisa',"Al-Ma'idah","Al-An'am","Al-A'raf",'Al-Anfal','At-Tawbah','Yunus',
  'Hud','Yusuf',"Ar-Ra'd",'Ibrahim','Al-Hijr','An-Nahl','Al-Isra','Al-Kahf','Maryam','Ta-Ha',
  'Al-Anbiya','Al-Hajj',"Al-Mu'minun",'An-Nur','Al-Furqan',"Ash-Shu'ara",'An-Naml','Al-Qasas','Al-Ankabut','Ar-Rum',
  'Luqman','As-Sajdah','Al-Ahzab','Saba','Fatir','Ya-Sin','As-Saffat','Sad','Az-Zumar','Ghafir',
  'Fussilat','Ash-Shura','Az-Zukhruf','Ad-Dukhan','Al-Jathiyah','Al-Ahqaf','Muhammad','Al-Fath','Al-Hujurat','Qaf',
  'Adh-Dhariyat','At-Tur','An-Najm','Al-Qamar','Ar-Rahman',"Al-Waqi'ah",'Al-Hadid','Al-Mujadila','Al-Hashr','Al-Mumtahanah',
  'As-Saf',"Al-Jumu'ah",'Al-Munafiqun','At-Taghabun','At-Talaq','At-Tahrim','Al-Mulk','Al-Qalam','Al-Haqqah',"Al-Ma'arij",
  'Nuh','Al-Jinn','Al-Muzzammil','Al-Muddaththir','Al-Qiyamah','Al-Insan','Al-Mursalat','An-Naba',"An-Nazi'at",'Abasa',
  'At-Takwir','Al-Infitar','Al-Mutaffifin','Al-Inshiqaq','Al-Buruj','At-Tariq',"Al-A'la",'Al-Ghashiyah','Al-Fajr','Al-Balad',
  'Ash-Shams','Al-Layl','Ad-Duhaa','Ash-Sharh','At-Tin','Al-Alaq','Al-Qadr','Al-Bayyinah','Az-Zalzalah','Al-Adiyat',
  "Al-Qari'ah",'At-Takathur','Al-Asr','Al-Humazah','Al-Fil','Quraysh',"Al-Ma'un",'Al-Kawthar','Al-Kafirun','An-Nasr',
  'Al-Masad','Al-Ikhlas','Al-Falaq','An-Nas'
]
const SURAH_LIST = SURAH_NAMES.map((name, i) => ({ id: i + 1, name }))
const QURAN_STATUS_STYLES = {
  pending: { background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' },
  reading: { background: '#fef8e7', color: '#b8780a', border: '1px solid #f5d08a' },
  done:    { background: '#e2f5ea', color: '#1a7a42', border: '1px solid #9dd6b0' }
}

const getTodayISO = () => new Date().toISOString().slice(0, 10)
const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate()
const getCompletedCount = (entries) => {
  let c = 0
  entries.forEach(e => PRAYERS.forEach(p => { if (e[p.key] === 'Present' || e[p.key] === 'Kaza') c++ }))
  return c
}
const getRate = (done, total) => total ? Math.round((done / total) * 100) : 0
const getMonthSummary = (log, year, month) => {
  const entries = log.filter(e => { const d = new Date(e.date); return d.getFullYear() === year && d.getMonth() === month })
  const completed = getCompletedCount(entries)
  const total = getDaysInMonth(year, month) * PRAYERS.length
  return { entries, completed, total, daysLogged: entries.length, rate: getRate(completed, total) }
}
const getBoardSymbol = v => ({ Present: '✓', Absent: '×', Kaza: 'K' }[v] || '·')

const LOCAL_PRAYER_KEY = 'lifeportal.namaz.prayerLog'
const LOCAL_QURAN_KEY  = 'lifeportal.namaz.quranProgress'

export default function NamazTracker() {
  const dispatch = useDispatch()
  const { prayerLog, quranProgress, loading, saving } = useSelector(s => s.namaz)
  const [tab, setTab] = useState('today')
  const todayISO = getTodayISO()
  const now = new Date(todayISO)
  const thisYear = now.getFullYear()
  const thisMonth = now.getMonth()
  const emptyForm = { date: todayISO, fajr: 'Absent', zuhar: 'Absent', asar: 'Absent', magrib: 'Absent', isha: 'Absent' }
  const [form, setForm] = useState(emptyForm)
  const [selYear, setSelYear] = useState(thisYear)
  const [offerShown, setOfferShown] = useState(false)

  useEffect(() => { dispatch(fetchPrayerLog()) }, [dispatch])
  useEffect(() => { dispatch(fetchQuranProgress()) }, [dispatch])

  useEffect(() => {
    const entry = prayerLog.find(e => e.date === todayISO)
    setForm(entry ? { ...entry } : { ...emptyForm })
  }, [prayerLog, todayISO])

  // One-time localStorage migration offer
  useEffect(() => {
    if (offerShown || prayerLog.length > 0) return
    const localPrayer = (() => { try { const r = localStorage.getItem(LOCAL_PRAYER_KEY); return r ? JSON.parse(r) : [] } catch { return [] } })()
    const localQuran  = (() => { try { const r = localStorage.getItem(LOCAL_QURAN_KEY);  return r ? JSON.parse(r) : null } catch { return null } })()
    if (localPrayer.length > 0 || localQuran) {
      const migrate = async () => {
        if (localPrayer.length > 0) await dispatch(bulkImportPrayerLog(localPrayer))
        if (localQuran) {
          const arr = Object.entries(localQuran).map(([id, status]) => ({ surahId: Number(id), status }))
          await dispatch(bulkImportQuran(arr))
        }
        localStorage.removeItem(LOCAL_PRAYER_KEY)
        localStorage.removeItem(LOCAL_QURAN_KEY)
      }
      toast('Found saved local prayer data — migrating to cloud…', { icon: '🕌' })
      migrate()
    }
    setOfferShown(true)
  }, [prayerLog.length, offerShown, dispatch])

  const monthSummary = useMemo(() => getMonthSummary(prayerLog, thisYear, thisMonth), [prayerLog, thisYear, thisMonth])
  const todayCompleted = PRAYERS.filter(p => form[p.key] === 'Present' || form[p.key] === 'Kaza').length
  const todayRate = getRate(todayCompleted, PRAYERS.length)
  const availableYears = useMemo(() => {
    const ys = [...new Set([thisYear, ...prayerLog.map(e => new Date(e.date).getFullYear()).filter(Boolean)])].sort((a,b)=>b-a)
    return ys.length ? ys : [thisYear]
  }, [prayerLog, thisYear])
  const historyMonths = useMemo(() =>
    MONTH_LABELS.map((label, i) => ({ label, ...getMonthSummary(prayerLog.filter(e => new Date(e.date).getFullYear() === selYear), selYear, i) })),
    [prayerLog, selYear]
  )
  const selYearSummary = useMemo(() => {
    const entries = prayerLog.filter(e => new Date(e.date).getFullYear() === selYear)
    const completed = getCompletedCount(entries)
    return { completed, total: 365 * PRAYERS.length, rate: getRate(completed, 365 * PRAYERS.length), daysLogged: entries.length }
  }, [prayerLog, selYear])
  const currentMonthDays = useMemo(() =>
    Array.from({ length: getDaysInMonth(thisYear, thisMonth) }, (_, i) => new Date(thisYear, thisMonth, i + 1)),
    [thisYear, thisMonth]
  )
  const entriesByDate = useMemo(() => prayerLog.reduce((acc, e) => { acc[e.date] = e; return acc }, {}), [prayerLog])
  const quranCounts = useMemo(() => {
    const c = { done: 0, reading: 0, pending: 0 }
    SURAH_LIST.forEach(s => { const st = quranProgress[s.id] || 'pending'; c[st]++ })
    return c
  }, [quranProgress])

  const saveToday = () => {
    const { date, fajr, zuhar, asar, magrib, isha } = form
    dispatch(savePrayerEntry({ date, fajr, zuhar, asar, magrib, isha }))
  }

  const cycleQuranStatus = (surahId) => {
    const next = { pending: 'reading', reading: 'done', done: 'pending' }[quranProgress[surahId] || 'pending']
    dispatch(optimisticQuranUpdate({ surahId, status: next }))
    dispatch(saveQuranStatus({ surahId, status: next }))
  }

  if (loading && prayerLog.length === 0) return <LoadingSpinner size={48} label="Loading prayer data…" />

  return (
    <div className="animate-fade-in" style={{ width: '100%', minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Spiritual Tracker</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 400, margin: 0 }}>Namaz &amp; Quran</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 14 }}>Cloud-synced across all your devices. Never lose your progress.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: 12 }}>{todayRate}% today</span>
          <span className="badge" style={{ background: '#e2f5ea', color: '#1a7a42', fontSize: 12 }}>{monthSummary.rate}% this month</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(185px,1fr))', gap: 16, marginBottom: 22 }}>
        <StatCard icon={<PrayerRing value={monthSummary.rate} size={44} strokeWidth={5} />} label="This Month" value={`${monthSummary.rate}%`} sub={`${monthSummary.completed}/${monthSummary.total} prayers`} accent="#e2f5ea" />
        <StatCard icon="📅" label="Days Logged" value={monthSummary.daysLogged} sub="saved this month" accent="#edf0fc" />
        <StatCard icon="🕌" label="Today" value={`${todayCompleted}/5`} sub="prayers marked" accent="#fef8e7" />
        <StatCard icon="📖" label="Quran" value={`${quranCounts.done}/114`} sub="surahs completed" accent="#e2f5ea" />
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1.5px solid var(--border)', marginBottom: 22, overflowX: 'auto' }}>
        {[['today','Today 🌟'],['monthly','Monthly'],['history','History 📊'],['quran','Quran 📖']].map(([key, label]) => (
          <button key={key} type="button" onClick={() => setTab(key)} style={{
            padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            fontWeight: tab === key ? 700 : 500, fontSize: 14,
            color: tab === key ? 'var(--accent)' : 'var(--text-muted)',
            borderBottom: tab === key ? '2.5px solid var(--accent)' : '2.5px solid transparent',
            marginBottom: -1.5, transition: 'all 0.2s', whiteSpace: 'nowrap'
          }}>{label}</button>
        ))}
      </div>

      {tab === 'today' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
          <div className="card card-premium" style={{ padding: '22px 24px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Today's Prayers</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {new Date(todayISO + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <button className="btn btn-primary" onClick={saveToday} disabled={saving} style={{ minWidth: 120 }}>
                {saving ? '⏳ Saving…' : '💾 Save Prayers'}
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 14 }}>
              {PRAYERS.map(prayer => (
                <div key={prayer.key} className="prayer-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>{prayer.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{prayer.label}</div>
                  <select
                    className="input-field"
                    value={form[prayer.key] || 'Absent'}
                    onChange={e => setForm(p => ({ ...p, [prayer.key]: e.target.value }))}
                    style={{ textAlign: 'center', fontSize: 13, padding: '8px' }}
                  >
                    {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <div className="badge" style={{ ...STATUS_COLORS[form[prayer.key] || 'Absent'], marginTop: 8, fontSize: 11 }}>
                    {form[prayer.key] || 'Absent'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '18px 20px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ fontWeight: 700 }}>This Month's Board</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['Present','Kaza','Absent'].map(s => <span key={s} className="badge" style={{ ...STATUS_COLORS[s], fontSize: 10 }}>{s}</span>)}
              </div>
            </div>
            <div className="desktop-only" style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'separate', borderSpacing: '0 6px', minWidth: `${Math.max(860,currentMonthDays.length*38+100)}px`, width: 'max-content' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', fontSize: 11, color: 'var(--text-muted)', padding: '4px 10px', position: 'sticky', left: 0, background: 'rgba(255,255,255,0.98)', zIndex: 2, minWidth: 80 }}>Prayer</th>
                    {currentMonthDays.map(d => (
                      <th key={d.toISOString()} style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', padding: '4px 2px', minWidth: 38 }}>
                        <div style={{ fontWeight: 700 }}>{d.getDate()}</div>
                        <div style={{ fontSize: 9 }}>{d.toLocaleDateString('en-US',{weekday:'short'})}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PRAYERS.map(prayer => (
                    <tr key={prayer.key}>
                      <td style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', position: 'sticky', left: 0, background: 'rgba(255,255,255,0.98)', zIndex: 1 }}>{prayer.label}</td>
                      {currentMonthDays.map(d => {
                        const dk = d.toISOString().slice(0, 10)
                        const val = entriesByDate[dk]?.[prayer.key] || null
                        const s = val ? STATUS_COLORS[val] : { background: 'var(--surface-2)', color: 'var(--text-muted)' }
                        return (
                          <td key={dk} style={{ padding: '2px 3px' }}>
                            <div style={{ width: 32, height: 30, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: s.background, color: s.color }}>
                              {val ? getBoardSymbol(val) : '·'}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mobile-only">
              {PRAYERS.map(prayer => (
                <div key={`m-${prayer.key}`} style={{ border: '1px solid var(--border)', borderRadius: 14, padding: 12, marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{prayer.icon} {prayer.label}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', gap: 4 }}>
                    {currentMonthDays.map(d => {
                      const dk = d.toISOString().slice(0, 10)
                      const val = entriesByDate[dk]?.[prayer.key] || null
                      const s = val ? STATUS_COLORS[val] : { background: 'var(--surface-2)', color: 'var(--text-muted)' }
                      return (
                        <div key={dk} style={{ borderRadius: 7, padding: '4px 2px', background: s.background, color: s.color, textAlign: 'center' }}>
                          <div style={{ fontSize: 9, fontWeight: 700 }}>{d.getDate()}</div>
                          <div style={{ fontSize: 10, fontWeight: 700, marginTop: 1 }}>{val ? getBoardSymbol(val) : '·'}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'monthly' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} style={{ display: 'grid', gap: 16 }}>
          <div className="card card-premium" style={{ padding: '22px 26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700 }}>Prayer Completion — {MONTH_LABELS[thisMonth]} {thisYear}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{monthSummary.completed}/{monthSummary.total} prayers marked</div>
              </div>
              <PrayerRing value={monthSummary.rate} size={72} strokeWidth={7} />
            </div>
            <ProgressBar value={monthSummary.rate} height={8} showLabel />
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>Month Log</div>
            <div className="desktop-only" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 460 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-2)' }}>
                    {['Date','Fajr','Zuhar','Asar','Magrib','Isha'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...monthSummary.entries].sort((a,b)=>a.date.localeCompare(b.date)).map(entry => (
                    <tr key={entry._id || entry.date} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600 }}>{entry.date}</td>
                      {PRAYERS.map(p => (
                        <td key={p.key} style={{ padding: '10px 14px' }}>
                          <span className="badge" style={{ ...STATUS_COLORS[entry[p.key]] || STATUS_COLORS.Absent, fontSize: 11 }}>{entry[p.key]}</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                  {monthSummary.entries.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No entries this month. Log from the Today tab.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="mobile-only" style={{ padding: 14, display: 'grid', gap: 10 }}>
              {[...monthSummary.entries].sort((a,b)=>a.date.localeCompare(b.date)).map(entry => (
                <div key={entry._id || entry.date} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>{entry.date}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {PRAYERS.map(p => <span key={p.key} className="badge" style={{ ...STATUS_COLORS[entry[p.key]] || STATUS_COLORS.Absent, fontSize: 10 }}>{p.label}: {entry[p.key]}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'history' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }} style={{ display: 'grid', gap: 18 }}>
          <div className="card card-premium" style={{ padding: '22px 26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
              <div>
                <div style={{ fontWeight: 700 }}>Yearly Prayer History</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>All data saved in your cloud account</div>
              </div>
              <select className="input-field" value={selYear} onChange={e => setSelYear(Number(e.target.value))} style={{ width: 120 }}>
                {availableYears.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
              <div className="card" style={{ padding: 18, background: 'linear-gradient(135deg,#e2f5ea,#f6fbf8)', borderColor: '#9dd6b0', boxShadow: 'none' }}>
                <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1a7a42', fontWeight: 700 }}>Year Prayer Rate</div>
                <div style={{ fontSize: 36, fontWeight: 800, marginTop: 8, color: '#1a7a42' }}>{selYearSummary.rate}%</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{selYearSummary.daysLogged} days logged in {selYear}</div>
              </div>
              <div className="card" style={{ padding: 18, background: 'linear-gradient(135deg,#fef8e7,#fffdf6)', borderColor: '#f0d08a', boxShadow: 'none' }}>
                <div style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#b8780a', fontWeight: 700 }}>Months Active</div>
                <div style={{ fontSize: 36, fontWeight: 800, marginTop: 8, color: '#b8780a' }}>{historyMonths.filter(m => m.daysLogged > 0).length}/12</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Months with saved entries</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 14 }}>
            {historyMonths.map(month => {
              const accent = month.rate >= 80
                ? { bg: 'linear-gradient(135deg,#e2f5ea,#f6fbf8)', border: '#9dd6b0', text: '#1a7a42' }
                : month.rate >= 60
                ? { bg: 'linear-gradient(135deg,#fef8e7,#fffdf6)', border: '#f0d08a', text: '#b8780a' }
                : { bg: 'linear-gradient(135deg,#f8f4ee,#fff)', border: 'var(--border)', text: 'var(--text-primary)' }
              return (
                <motion.div key={month.label} className="card" whileHover={{ y: -3, scale: 1.01 }}
                  style={{ padding: 16, background: accent.bg, borderColor: accent.border, transition: 'all 0.2s' }}>
                  <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>{selYear}</div>
                  <div style={{ fontWeight: 800, fontSize: 20, color: accent.text, marginTop: 2 }}>{month.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: accent.text, marginTop: 4 }}>{month.rate}%</div>
                  <div style={{ marginTop: 10 }}><ProgressBar value={month.rate} color={accent.text} height={5} /></div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 8 }}>{month.daysLogged} day{month.daysLogged !== 1 ? 's' : ''} logged</div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {tab === 'quran' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
          <div className="card card-premium" style={{ padding: '22px 26px', marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Quran Progress — All 114 Surahs</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>Click a surah to cycle status. Auto-saves to cloud.</div>
              </div>
              <PrayerRing value={Math.round((quranCounts.done / 114) * 100)} size={80} strokeWidth={8} />
            </div>
            <div style={{ marginTop: 14 }}><ProgressBar value={Math.round((quranCounts.done / 114) * 100)} height={8} showLabel /></div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <span className="badge" style={QURAN_STATUS_STYLES.done}>✓ Done ({quranCounts.done})</span>
              <span className="badge" style={QURAN_STATUS_STYLES.reading}>📖 Reading ({quranCounts.reading})</span>
              <span className="badge" style={QURAN_STATUS_STYLES.pending}>○ Pending ({quranCounts.pending})</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(105px,1fr))', gap: 10 }}>
            {SURAH_LIST.map(surah => {
              const status = quranProgress[surah.id] || 'pending'
              const style = QURAN_STATUS_STYLES[status]
              return (
                <motion.button key={surah.id} type="button" onClick={() => cycleQuranStatus(surah.id)}
                  whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }}
                  className="card"
                  style={{ ...style, padding: '12px 8px', textAlign: 'center', cursor: 'pointer', boxShadow: 'none', borderRadius: 14 }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, marginBottom: 3 }}>#{surah.id}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.3 }}>{surah.name}</div>
                  <div style={{ fontSize: 10, marginTop: 7, fontWeight: 600 }}>
                    {status === 'done' ? '✓ Done' : status === 'reading' ? '📖 Reading' : '○ Pending'}
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
