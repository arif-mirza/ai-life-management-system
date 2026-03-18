import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, PageHeader, StatCard, LoadingSpinner } from '../components/common'
import { fetchPasswords, createPassword, updatePassword, deletePassword } from '../store/passwordsSlice'

const EMPTY_FORM = { platform: '', username: '', password: '' }

const maskValue = (value) => (value ? '•'.repeat(Math.min(12, value.length)) : '••••••••')

const formatDate = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Passwords() {
  const dispatch = useDispatch()
  const { items, loading } = useSelector(s => s.passwords)

  const [showModal, setShowModal] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [visibleId, setVisibleId] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => { dispatch(fetchPasswords()) }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(e =>
      e.platform?.toLowerCase().includes(q) ||
      e.username?.toLowerCase().includes(q)
    )
  }, [items, search])

  const stats = useMemo(() => {
    const total = items.length
    const latest = items[0]?.updatedAt ? formatDate(items[0].updatedAt) : '—'
    return { total, latest }
  }, [items])

  const openCreate = () => {
    setEditEntry(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (entry) => {
    setEditEntry(entry)
    setForm({
      platform: entry.platform || '',
      username: entry.username || '',
      password: entry.password || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.platform.trim() || !form.username.trim()) return
    const payload = {
      platform: form.platform.trim(),
      username: form.username.trim(),
      password: form.password || ''
    }
    if (editEntry) {
      await dispatch(updatePassword({ id: editEntry._id, data: payload }))
    } else {
      await dispatch(createPassword(payload))
    }
    setShowModal(false)
  }

  const handleDelete = async (id) => {
    await dispatch(deletePassword(id))
    setDeleteConfirm(null)
  }

  if (loading && items.length === 0) return <LoadingSpinner size={40} />

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Password Manager"
        subtitle="Save your logins securely (masked by default)"
        actions={<button className="btn btn-primary" onClick={openCreate}>+ Add Entry</button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
        <StatCard icon="🔐" label="Total Entries" value={stats.total} sub="Stored logins" />
        <StatCard icon="🕒" label="Last Updated" value={stats.latest} sub="Most recent" accent="#EEF0FD" />
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <input
          className="input-field"
          placeholder="Search by platform or username..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: '1 1 240px' }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
          No password entries yet. Add your first one to get started.
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Stored Logins</div>
          <div className="desktop-only" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  {['Platform', 'Username / Email', 'Password', 'Updated', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 12, color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e._id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>{e.platform}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>{e.username}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>
                      {visibleId === e._id ? (e.password || '—') : maskValue(e.password)}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>{formatDate(e.updatedAt)}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '4px 10px' }}
                          onClick={() => setVisibleId(visibleId === e._id ? null : e._id)}
                        >
                          {visibleId === e._id ? 'Hide' : 'Reveal'}
                        </button>
                        <button className="btn btn-ghost" style={{ padding: '4px 10px' }} onClick={() => openEdit(e)}>Edit</button>
                        <button className="btn btn-danger" style={{ padding: '4px 10px' }} onClick={() => setDeleteConfirm(e._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mobile-only" style={{ padding: '16px 20px', display: 'grid', gap: 12 }}>
            {filtered.map(e => (
              <div key={e._id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ fontWeight: 600 }}>{e.platform}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(e.updatedAt)}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{e.username}</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>
                  {visibleId === e._id ? (e.password || '—') : maskValue(e.password)}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: '4px 10px' }}
                    onClick={() => setVisibleId(visibleId === e._id ? null : e._id)}
                  >
                    {visibleId === e._id ? 'Hide' : 'Reveal'}
                  </button>
                  <button className="btn btn-ghost" style={{ padding: '4px 10px' }} onClick={() => openEdit(e)}>Edit</button>
                  <button className="btn btn-danger" style={{ padding: '4px 10px' }} onClick={() => setDeleteConfirm(e._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
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
        <Modal title={editEntry ? 'Edit Password' : 'Add Password'} onClose={() => setShowModal(false)} maxWidth={520}>
          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Platform</label>
                <input className="input-field" value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))} required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Username / Email</label>
                <input className="input-field" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Password</label>
                <input type="password" className="input-field" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
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
