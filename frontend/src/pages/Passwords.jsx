import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { fetchPasswords, createPassword, updatePassword, deletePassword } from '../store/passwordsSlice'
import { Modal, PageHeader, StatCard, LoadingSpinner, SecurityBadge, PasswordStrength, LoadingButton } from '../components/common'

const EMPTY_FORM = { platform: '', username: '', password: '' }
const maskValue = v => v ? '•'.repeat(Math.min(14, v.length)) : '••••••••'
const formatDate = v => {
  if (!v) return '—'
  const d = new Date(v)
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Passwords() {
  const dispatch = useDispatch()
  const { items, loading, saving } = useSelector(s => s.passwords)
  const [showModal, setShowModal] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [visibleId, setVisibleId] = useState(null)
  const [search, setSearch] = useState('')
  const [showPw, setShowPw] = useState(false)

  useEffect(() => { dispatch(fetchPasswords()) }, [dispatch])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(e => e.platform?.toLowerCase().includes(q) || e.username?.toLowerCase().includes(q))
  }, [items, search])

  const stats = useMemo(() => ({
    total: items.length,
    latest: items[0]?.updatedAt ? formatDate(items[0].updatedAt) : '—'
  }), [items])

  const openCreate = () => { setEditEntry(null); setForm(EMPTY_FORM); setShowPw(false); setShowModal(true) }
  const openEdit = (entry) => {
    setEditEntry(entry)
    setForm({ platform: entry.platform || '', username: entry.username || '', password: entry.password || '' })
    setShowPw(false); setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.platform.trim() || !form.username.trim()) return
    const payload = { platform: form.platform.trim(), username: form.username.trim(), password: form.password || '' }
    if (editEntry) {
      await dispatch(updatePassword({ id: editEntry._id, data: payload }))
    } else {
      await dispatch(createPassword(payload))
    }
    setShowModal(false)
  }

  const handleDelete = async (id) => { await dispatch(deletePassword(id)); setDeleteConfirm(null) }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      import('react-hot-toast').then(({ default: toast }) => toast.success('Copied!'))
    })
  }

  if (loading && items.length === 0) return <LoadingSpinner size={48} label="Loading passwords…" />

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Password Manager"
        subtitle="All passwords are encrypted with AES-256-GCM before storing in the database."
        actions={<button className="btn btn-primary" onClick={openCreate} id="add-password-btn">+ Add Entry</button>}
      />

      {/* Security badge */}
      <div style={{ marginBottom: 20 }}>
        <SecurityBadge message="AES-256-GCM Encrypted — Your passwords are never stored in plain text" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 20 }}>
        <StatCard icon="🔐" label="Total Entries" value={stats.total} sub="Stored logins" accent="#e2f5ea" />
        <StatCard icon="🕒" label="Last Updated" value={stats.latest} sub="Most recent entry" accent="#edf0fc" />
        <StatCard icon="🛡️" label="Encryption" value="AES-256" sub="Military-grade security" accent="#fef8e7" />
      </div>

      <div style={{ marginBottom: 16 }}>
        <input className="input-field" placeholder="🔍  Search by platform or username…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>No entries found</div>
          <div style={{ fontSize: 13, marginBottom: 18 }}>Add your first password entry to get started.</div>
          <button className="btn btn-primary" onClick={openCreate}>+ Add Entry</button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700 }}>Stored Logins</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} entr{filtered.length === 1 ? 'y' : 'ies'}</span>
          </div>
          <div className="desktop-only" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  {['Platform','Username / Email','Password','Updated','Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '11px 14px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <motion.tr key={e._id} style={{ borderTop: '1px solid var(--border)' }} whileHover={{ backgroundColor: 'rgba(246,242,234,0.6)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, fontSize: 13 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🔐</div>
                        {e.platform}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{e.username}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontFamily: 'monospace' }}>
                      <span style={{ letterSpacing: '0.06em' }}>{visibleId === e._id ? (e.password || '—') : maskValue(e.password)}</span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(e.updatedAt)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 11, minHeight: 32 }} onClick={() => setVisibleId(visibleId === e._id ? null : e._id)}>
                          {visibleId === e._id ? '🙈 Hide' : '👁 Reveal'}
                        </button>
                        <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 11, minHeight: 32 }} onClick={() => copyToClipboard(e.password)}>📋 Copy</button>
                        <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 11, minHeight: 32 }} onClick={() => openEdit(e)}>Edit</button>
                        <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: 11, minHeight: 32 }} onClick={() => setDeleteConfirm(e._id)}>Delete</button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mobile-only" style={{ padding: '14px', display: 'grid', gap: 10 }}>
            {filtered.map(e => (
              <div key={e._id} style={{ border: '1px solid var(--border)', borderRadius: 14, padding: 14, background: 'var(--surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16 }}>🔐</span>{e.platform}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(e.updatedAt)}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{e.username}</div>
                <div style={{ fontSize: 13, fontFamily: 'monospace', marginBottom: 10 }}>
                  {visibleId === e._id ? (e.password || '—') : maskValue(e.password)}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 11, minHeight: 32 }} onClick={() => setVisibleId(visibleId === e._id ? null : e._id)}>
                    {visibleId === e._id ? '🙈' : '👁'} {visibleId === e._id ? 'Hide' : 'Reveal'}
                  </button>
                  <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 11, minHeight: 32 }} onClick={() => copyToClipboard(e.password)}>📋 Copy</button>
                  <button className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 11, minHeight: 32 }} onClick={() => openEdit(e)}>Edit</button>
                  <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: 11, minHeight: 32 }} onClick={() => setDeleteConfirm(e._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {deleteConfirm && (
        <Modal title="Delete Entry?" onClose={() => setDeleteConfirm(null)} maxWidth={380}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>This will permanently delete the password entry from your account.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <LoadingButton loading={saving} className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</LoadingButton>
          </div>
        </Modal>
      )}

      {showModal && (
        <Modal title={editEntry ? 'Edit Password' : 'Add Password'} onClose={() => setShowModal(false)} maxWidth={520}>
          <div style={{ marginBottom: 18 }}>
            <SecurityBadge message="This entry will be encrypted with AES-256-GCM" />
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 7 }}>Platform *</label>
                <input className="input-field" placeholder="e.g. Google, Facebook, LinkedIn" value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))} required autoFocus />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 7 }}>Username / Email *</label>
                <input className="input-field" placeholder="Enter username or email" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 7 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input-field"
                    placeholder="Enter password"
                    value={form.password}
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    style={{ paddingRight: 48 }}
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)' }}>
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>
                <PasswordStrength password={form.password} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <LoadingButton type="submit" loading={saving} loadingLabel="Encrypting…">{editEntry ? 'Save Changes' : 'Save Encrypted'}</LoadingButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
