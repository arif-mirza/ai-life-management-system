import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchTasks, createTask, updateTask, deleteTask } from '../store/dailyTasksSlice'
import { Modal, ProgressBar, SelectField, Badge, LoadingSpinner, EmptyState, LoadingButton } from '../components/common'

const CATEGORY_OPTIONS = ['Career', 'Learning', 'Health', 'Finance', 'Personal Growth', 'Other']
const STATUS_OPTIONS = ['not-started', 'in-progress', 'completed', 'paused']
const PRIORITY_OPTIONS = ['low', 'medium', 'high']

const todayISO = new Date().toISOString().slice(0, 10)

const PRIORITY_COLORS = { high: '#e53e3e', medium: '#d69e2e', low: '#38a169' }

const formatStatus = s => ({ 'not-started': 'Not Started', 'in-progress': 'In Progress', completed: 'Completed', paused: 'Paused' }[s] || s)
const formatPriority = p => p ? `${p[0].toUpperCase()}${p.slice(1)}` : ''
const formatDate = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

const EMPTY_FORM = { title: '', date: todayISO, category: 'Learning', status: 'not-started', priority: 'medium', notes: '' }

export default function DailyTasks() {
  const dispatch = useDispatch()
  const { items: tasks, loading, saving } = useSelector(s => s.dailyTasks)
  const [filters, setFilters] = useState({ search: '', date: todayISO, category: 'All', status: 'All' })
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => { dispatch(fetchTasks()) }, [dispatch])

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const q = filters.search.toLowerCase().trim()
      const matchSearch = q ? task.title.toLowerCase().includes(q) : true
      const matchDate = filters.date ? task.date === filters.date : true
      const matchCat = filters.category === 'All' ? true : task.category === filters.category
      const matchStatus = filters.status === 'All' ? true : task.status === filters.status
      return matchSearch && matchDate && matchCat && matchStatus
    })
  }, [tasks, filters])

  const completedCount = filteredTasks.filter(t => t.status === 'completed').length
  const totalCount = filteredTasks.length
  const progress = totalCount ? Math.round((completedCount / totalCount) * 100) : 0

  const displayDate = new Date((filters.date || todayISO) + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  })

  const handleToggle = async (task) => {
    const next = task.status === 'completed' ? 'not-started' : 'completed'
    dispatch(updateTask({ id: task._id, data: { ...task, status: next } }))
  }

  const openCreate = () => { setEditTask(null); setForm(EMPTY_FORM); setShowModal(true) }
  const openEdit = (task) => {
    setEditTask(task)
    setForm({ title: task.title, date: task.date, category: task.category, status: task.status, priority: task.priority, notes: task.notes || '' })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const payload = { ...form, title: form.title.trim(), date: form.date || todayISO }
    if (editTask) {
      await dispatch(updateTask({ id: editTask._id, data: payload }))
    } else {
      await dispatch(createTask(payload))
    }
    setShowModal(false); setEditTask(null)
  }

  const handleDelete = async (id) => {
    await dispatch(deleteTask(id))
    setDeleteConfirm(null)
  }

  if (loading && tasks.length === 0) return <LoadingSpinner size={48} label="Loading your tasks…" />

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>Daily Tasks</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 400, margin: 0, letterSpacing: '-0.02em' }}>Task Manager</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 14 }}>Track what you accomplish each day — stored securely in the cloud.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{displayDate}</span>
          <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)', fontSize: 12 }}>{progress}% done</span>
          <button className="btn btn-primary" onClick={openCreate} id="add-task-btn">+ Add Task</button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="card card-premium" style={{ padding: '22px 26px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{completedCount} of {totalCount} completed</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {filters.date === todayISO ? "Today's tasks" : `Tasks for ${formatDate(filters.date)}`}
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)' }}>{progress}%</div>
        </div>
        <ProgressBar value={progress} color="var(--accent)" height={8} />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 18 }}>
        <div style={{ flex: '1 1 220px' }}>
          <input className="input-field" placeholder="🔍  Search tasks…" value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value }))} />
        </div>
        <div style={{ flex: '0 1 170px' }}>
          <input type="date" className="input-field" value={filters.date} onChange={e => setFilters(p => ({ ...p, date: e.target.value }))} />
        </div>
        <div style={{ flex: '0 1 155px' }}>
          <select className="input-field" value={filters.category} onChange={e => setFilters(p => ({ ...p, category: e.target.value }))}>
            {['All', ...CATEGORY_OPTIONS].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div style={{ flex: '0 1 155px' }}>
          <select className="input-field" value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
            {['All', ...STATUS_OPTIONS].map(o => <option key={o} value={o}>{o === 'All' ? 'All Status' : formatStatus(o)}</option>)}
          </select>
        </div>
      </div>

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <AnimatePresence mode="popLayout">
          {filteredTasks.length === 0 ? (
            <EmptyState icon="✅" title="No tasks found" description="Add a new task or adjust your filters to see tasks here." action={<button className="btn btn-primary" onClick={openCreate}>+ Add Task</button>} />
          ) : filteredTasks.map((task, i) => (
            <motion.div
              key={task._id}
              className="task-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
              layout
            >
              {/* Priority strip */}
              <div className="task-card-priority-strip" style={{ background: PRIORITY_COLORS[task.priority] || '#ccc' }} />

              <input
                type="checkbox"
                className="task-checkbox"
                checked={task.status === 'completed'}
                onChange={() => handleToggle(task)}
                id={`task-cb-${task._id}`}
              />

              <div className="task-content">
                <div className="task-title" style={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none', color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                  {task.title}
                </div>
                <div className="task-meta">
                  <Badge type={task.priority}>{formatPriority(task.priority)}</Badge>
                  <Badge type={task.category}>{task.category}</Badge>
                  <Badge type={task.status}>{formatStatus(task.status)}</Badge>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(task.date)}</span>
                  {task.notes && <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>"{task.notes}"</span>}
                </div>
              </div>

              <div className="task-actions">
                <button className="btn btn-ghost" onClick={() => openEdit(task)} style={{ padding: '6px 12px', fontSize: 12, minHeight: 34 }}>Edit</button>
                <button className="btn btn-danger" onClick={() => setDeleteConfirm(task._id)} style={{ padding: '6px 12px', fontSize: 12, minHeight: 34 }}>Delete</button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <Modal title="Delete Task?" onClose={() => setDeleteConfirm(null)} maxWidth={380}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>This task will be permanently removed from your account.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <LoadingButton loading={saving} className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete Task</LoadingButton>
          </div>
        </Modal>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editTask ? 'Edit Task' : 'Add New Task'} onClose={() => { setShowModal(false); setEditTask(null) }} maxWidth={580}>
          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 7 }}>Task Title *</label>
                <input className="input-field" placeholder="What do you want to accomplish?" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required autoFocus />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 7 }}>Date</label>
                <input type="date" className="input-field" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <SelectField label="Category" value={form.category} onChange={v => setForm(p => ({ ...p, category: v }))} options={CATEGORY_OPTIONS} />
              <SelectField label="Priority" value={form.priority} onChange={v => setForm(p => ({ ...p, priority: v }))} options={PRIORITY_OPTIONS} />
              <SelectField label="Status" value={form.status} onChange={v => setForm(p => ({ ...p, status: v }))} options={STATUS_OPTIONS.map(s => ({ value: s, label: formatStatus(s) }))} />
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 7 }}>Notes</label>
                <input className="input-field" placeholder="Optional notes or context…" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <LoadingButton type="submit" loading={saving} loadingLabel="Saving…">{editTask ? 'Save Changes' : 'Save Task'}</LoadingButton>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
