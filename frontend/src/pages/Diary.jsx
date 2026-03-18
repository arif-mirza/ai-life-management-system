import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PageHeader, Modal, StatCard, Badge, LoadingSpinner } from '../components/common'
import { fetchDiary, createDiary, updateDiary, deleteDiary } from '../store/diarySlice'

const MOODS = ['Neutral', 'Focused', 'Calm', 'Energetic', 'Tired', 'Happy', 'Grateful', 'Stressed', 'Sad']

const MOOD_STYLES = {
  Neutral: { background: '#F2F2F2', color: '#666' },
  Focused: { background: '#E8F5EE', color: '#2D6A4F' },
  Calm: { background: '#EEF0FD', color: '#5C6BC0' },
  Energetic: { background: '#FEF9E7', color: '#C77B2A' },
  Tired: { background: '#FDECEB', color: '#C0392B' },
  Happy: { background: '#EAFAF1', color: '#1E8449' },
  Grateful: { background: '#FFF7E6', color: '#B26A00' },
  Stressed: { background: '#FDE2E2', color: '#B91C1C' },
  Sad: { background: '#E5E7EB', color: '#374151' }
}

const EMPTY_FORM = {
  date: new Date().toISOString().slice(0, 10),
  title: '',
  mood: 'Neutral',
  content: ''
}

const formatDate = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Diary() {
  const dispatch = useDispatch()
  const { items, loading } = useSelector(s => s.diary)
  const [search, setSearch] = useState('')
  const [moodFilter, setMoodFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => { dispatch(fetchDiary()) }, [])

  const filteredEntries = useMemo(() => {
    return items.filter(entry => {
      const matchesMood = moodFilter === 'All' ? true : entry.mood === moodFilter
      const q = search.trim().toLowerCase()
      const matchesSearch = q
        ? (entry.title || '').toLowerCase().includes(q) || (entry.content || '').toLowerCase().includes(q)
        : true
      return matchesMood && matchesSearch
    })
  }, [items, moodFilter, search])

  const stats = useMemo(() => {
    const total = items.length
    const month = new Date().getMonth()
    const year = new Date().getFullYear()
    const monthEntries = items.filter(e => {
      const d = new Date(e.date)
      return d.getMonth() === month && d.getFullYear() === year
    }).length
    const latest = items[0]?.date ? formatDate(items[0].date) : '—'
    return { total, monthEntries, latest }
  }, [items])

  const openCreate = () => {
    setEditEntry(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (entry) => {
    setEditEntry(entry)
    setForm({
      date: entry.date ? entry.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      title: entry.title || '',
      mood: entry.mood || 'Neutral',
      content: entry.content || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim() || !form.date) return
    const payload = {
      date: form.date,
      title: form.title.trim(),
      mood: form.mood,
      content: form.content.trim()
    }
    if (editEntry) {
      await dispatch(updateDiary({ id: editEntry._id, data: payload }))
    } else {
      await dispatch(createDiary(payload))
    }
    setShowModal(false)
  }

  const handleDelete = async (id) => {
    await dispatch(deleteDiary(id))
    setDeleteConfirm(null)
  }

  if (loading && items.length === 0) return <LoadingSpinner size={40} />

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Diary"
        subtitle="Capture your daily reflections, mood, and thoughts"
        actions={<button className="btn btn-primary" onClick={openCreate}>+ New Entry</button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
        <StatCard icon="📓" label="Total Entries" value={stats.total} sub="All time" />
        <StatCard icon="📅" label="This Month" value={stats.monthEntries} sub="Entries logged" accent="#EEF0FD" />
        <StatCard icon="✨" label="Latest Entry" value={stats.latest} sub="Most recent" accent="#FEF9E7" />
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <input
          className="input-field"
          placeholder="Search entries..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: '1 1 220px' }}
        />
        <select
          className="input-field"
          value={moodFilter}
          onChange={e => setMoodFilter(e.target.value)}
          style={{ width: 180 }}
        >
          <option value="All">All moods</option>
          {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {filteredEntries.length === 0 ? (
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
          No diary entries yet. Start by adding your first reflection.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filteredEntries.map(entry => (
            <div key={entry._id} className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{entry.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(entry.date)}</div>
                </div>
                <Badge type={entry.mood} style={MOOD_STYLES[entry.mood] || MOOD_STYLES.Neutral}>
                  {entry.mood}
                </Badge>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {entry.content}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 'auto' }}>
                <button className="btn btn-ghost" onClick={() => openEdit(entry)} style={{ padding: '6px 10px', fontSize: 12 }}>Edit</button>
                <button className="btn btn-danger" onClick={() => setDeleteConfirm(entry._id)} style={{ padding: '6px 10px', fontSize: 12 }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirm && (
        <Modal title="Delete Entry?" onClose={() => setDeleteConfirm(null)} maxWidth={380}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>This will permanently delete the entry.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
          </div>
        </Modal>
      )}

      {showModal && (
        <Modal title={editEntry ? 'Edit Entry' : 'New Diary Entry'} onClose={() => setShowModal(false)} maxWidth={640}>
          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Date</label>
                <input type="date" className="input-field" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Mood</label>
                <select className="input-field" value={form.mood} onChange={e => setForm(p => ({ ...p, mood: e.target.value }))}>
                  {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Title</label>
                <input className="input-field" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Entry</label>
                <textarea className="input-field" rows={6} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} required />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editEntry ? 'Save Changes' : 'Save Entry'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
