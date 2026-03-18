import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchNotes, createNote, updateNote, deleteNote } from '../store/notesSlice'
import { PageHeader, Modal, EmptyState, LoadingSpinner, Badge, SelectField } from '../components/common'
import toast from 'react-hot-toast'

const CATEGORIES = ['General', 'Goal', 'Reflection', 'Idea', 'Journal', 'Quote']
const COLORS = ['#FFFFFF', '#FEF9E7', '#EAFAF1', '#EEF0FD', '#FDECEB', '#FDF3E7', '#E8F5EE']

const EMPTY_FORM = { title: '', content: '', category: 'General', tags: '', isPinned: false, color: '#FFFFFF' }

export default function Notes() {
  const dispatch = useDispatch()
  const { items: notes, loading } = useSelector(s => s.notes)
  const [showModal, setShowModal] = useState(false)
  const [editNote, setEditNote] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')

  useEffect(() => { dispatch(fetchNotes()) }, [])

  const filtered = notes.filter(n => {
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.content.toLowerCase().includes(search.toLowerCase())) return false
    if (catFilter && n.category !== catFilter) return false
    return true
  })

  const pinned = filtered.filter(n => n.isPinned)
  const unpinned = filtered.filter(n => !n.isPinned)

  const openCreate = () => { setForm(EMPTY_FORM); setEditNote(null); setShowModal(true) }
  const openEdit = (note) => {
    setEditNote(note)
    setForm({ title: note.title, content: note.content, category: note.category, tags: note.tags?.join(', ') || '', isPinned: note.isPinned, color: note.color || '#FFFFFF' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] }
    const action = editNote ? dispatch(updateNote({ id: editNote._id, data })) : dispatch(createNote(data))
    const result = await action
    if (!result.error) { toast.success(editNote ? 'Note updated!' : 'Note saved! 📝'); setShowModal(false) }
    else toast.error(result.payload)
  }

  const handleTogglePin = async (note) => {
    const result = await dispatch(updateNote({ id: note._id, data: { isPinned: !note.isPinned } }))
    if (!result.error) toast.success(note.isPinned ? 'Unpinned' : 'Pinned! 📌')
  }

  const handleDelete = async (id) => {
    const result = await dispatch(deleteNote(id))
    if (!result.error) { toast.success('Note deleted'); setDeleteConfirm(null) }
  }

  const NoteCard = ({ note }) => (
    <div className="card" style={{ padding: '18px 20px', background: note.color || '#fff', cursor: 'pointer', position: 'relative' }}
      onClick={() => openEdit(note)}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            {note.isPinned && <span style={{ fontSize: 12 }}>📌</span>}
            <Badge type="default" style={{ fontSize: 10 }}>{note.category}</Badge>
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.title}</h3>
        </div>
        <div style={{ display: 'flex', gap: 3 }} onClick={e => e.stopPropagation()}>
          <button className="btn btn-ghost" style={{ padding: '3px 6px', fontSize: 13 }} onClick={() => handleTogglePin(note)} title={note.isPinned ? 'Unpin' : 'Pin'}>
            {note.isPinned ? '📌' : '📍'}
          </button>
          <button className="btn btn-danger" style={{ padding: '3px 6px', fontSize: 13 }} onClick={() => setDeleteConfirm(note._id)}>🗑</button>
        </div>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
        {note.content}
      </p>
      {note.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10 }}>
          {note.tags.map(t => <span key={t} style={{ fontSize: 11, background: 'rgba(0,0,0,0.06)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: 99 }}>#{t}</span>)}
        </div>
      )}
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
        {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>
    </div>
  )

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Notes"
        subtitle={`${notes.length} notes saved`}
        actions={<button className="btn btn-primary" onClick={openCreate}>+ New Note</button>}
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <input className="input-field" placeholder="🔍 Search notes..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ width: 240, padding: '8px 12px' }} />
        <select className="input-field" value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ width: 150 }}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(search || catFilter) && (
          <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => { setSearch(''); setCatFilter('') }}>✕ Clear</button>
        )}
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState icon="📝" title="No notes yet" description="Capture your thoughts, ideas, reflections and goals."
          action={<button className="btn btn-primary" onClick={openCreate}>Write your first note</button>}
        />
      ) : (
        <>
          {pinned.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>📌 Pinned</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 24 }}>
                {pinned.map(note => <NoteCard key={note._id} note={note} />)}
              </div>
            </>
          )}
          {unpinned.length > 0 && (
            <>
              {pinned.length > 0 && <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>All Notes</div>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                {unpinned.map(note => <NoteCard key={note._id} note={note} />)}
              </div>
            </>
          )}
        </>
      )}

      {deleteConfirm && (
        <Modal title="Delete Note?" onClose={() => setDeleteConfirm(null)} maxWidth={380}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>This note will be permanently deleted.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
          </div>
        </Modal>
      )}

      {showModal && (
        <Modal title={editNote ? 'Edit Note' : 'New Note'} onClose={() => setShowModal(false)} maxWidth={580}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Title *</label>
              <input className="input-field" placeholder="Note title" value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required autoFocus />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Content *</label>
              <textarea className="input-field" placeholder="Write your thoughts..."
                value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                required rows={6} style={{ resize: 'vertical' }} />
            </div>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <SelectField label="Category" value={form.category} onChange={v => setForm(p => ({ ...p, category: v }))}
                options={CATEGORIES.map(c => ({ value: c, label: c }))} />
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Color</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))}
                      style={{ width: 28, height: 28, borderRadius: 7, background: c, border: `2px solid ${form.color === c ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer' }} />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Tags (comma separated)</label>
              <input className="input-field" placeholder="idea, career, personal..." value={form.tags}
                onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <input type="checkbox" id="pinned" checked={form.isPinned} onChange={e => setForm(p => ({ ...p, isPinned: e.target.checked }))} style={{ width: 16, height: 16, cursor: 'pointer' }} />
              <label htmlFor="pinned" style={{ fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Pin this note</label>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editNote ? 'Save Changes' : 'Save Note'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
