import { useEffect, useMemo, useState } from 'react'
import { Modal, ProgressBar, SelectField, Badge } from '../components/common'

const CATEGORY_OPTIONS = ['Career', 'Learning', 'Health', 'Finance', 'Personal Growth', 'Other']
const STATUS_OPTIONS = ['not-started', 'in-progress', 'completed', 'paused']
const PRIORITY_OPTIONS = ['low', 'medium', 'high']
const STORAGE_KEY = 'lifeportal.dailyTasks'

const todayISO = new Date().toISOString().slice(0, 10)

const addDays = (dateStr, days) => {
  const next = new Date(dateStr)
  next.setDate(next.getDate() + days)
  return next.toISOString().slice(0, 10)
}

const INITIAL_TASKS = [
  {
    id: 1,
    title: 'Apply for 1 new role',
    date: todayISO,
    category: 'Career',
    status: 'in-progress',
    priority: 'high',
    notes: ''
  },
  {
    id: 2,
    title: 'Complete VU assignment',
    date: todayISO,
    category: 'Learning',
    status: 'completed',
    priority: 'medium',
    notes: ''
  },
  {
    id: 3,
    title: 'Quran research notes',
    date: todayISO,
    category: 'Personal Growth',
    status: 'not-started',
    priority: 'low',
    notes: ''
  },
  {
    id: 4,
    title: 'Evening walk (30 min)',
    date: todayISO,
    category: 'Health',
    status: 'not-started',
    priority: 'low',
    notes: ''
  },
  {
    id: 5,
    title: 'Review budget targets',
    date: addDays(todayISO, 1),
    category: 'Finance',
    status: 'not-started',
    priority: 'medium',
    notes: ''
  }
]

const EMPTY_FORM = {
  title: '',
  date: todayISO,
  category: 'Learning',
  status: 'not-started',
  priority: 'low',
  notes: ''
}

const formatStatus = (status) => ({
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  completed: 'Completed',
  paused: 'Paused'
}[status] || status)

const formatPriority = (priority) => priority ? `${priority[0].toUpperCase()}${priority.slice(1)}` : ''

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function DailyTasks() {
  const [tasks, setTasks] = useState(() => {
    if (typeof window === 'undefined') return INITIAL_TASKS
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      return Array.isArray(parsed) ? parsed : INITIAL_TASKS
    } catch {
      return INITIAL_TASKS
    }
  })
  const [filters, setFilters] = useState({
    search: '',
    date: todayISO,
    category: 'All',
    status: 'All'
  })
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch {
      // Ignore storage errors (e.g. private mode)
    }
  }, [tasks])

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = filters.search
        ? task.title.toLowerCase().includes(filters.search.toLowerCase().trim())
        : true
      const matchesDate = filters.date ? task.date === filters.date : true
      const matchesCategory = filters.category === 'All' ? true : task.category === filters.category
      const matchesStatus = filters.status === 'All' ? true : task.status === filters.status
      return matchesSearch && matchesDate && matchesCategory && matchesStatus
    })
  }, [tasks, filters])

  const completedCount = filteredTasks.filter(t => t.status === 'completed').length
  const totalCount = filteredTasks.length
  const progress = totalCount ? Math.round((completedCount / totalCount) * 100) : 0

  const displayDate = new Date(filters.date || todayISO).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  })

  const addTask = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    if (editTask) {
      setTasks(prev => prev.map(task => (
        task.id === editTask.id
          ? {
            ...task,
            title: form.title.trim(),
            date: form.date || todayISO,
            category: form.category,
            status: form.status,
            priority: form.priority,
            notes: form.notes
          }
          : task
      )))
    } else {
      setTasks(prev => [{
        id: Date.now(),
        title: form.title.trim(),
        date: form.date || todayISO,
        category: form.category,
        status: form.status,
        priority: form.priority,
        notes: form.notes
      }, ...prev])
    }
    setForm(EMPTY_FORM)
    setShowModal(false)
    setEditTask(null)
  }

  const toggleTask = (id) => {
    setTasks(prev => prev.map(task => (
      task.id === id
        ? { ...task, status: task.status === 'completed' ? 'not-started' : 'completed' }
        : task
    )))
  }

  const openEdit = (task) => {
    setEditTask(task)
    setForm({
      title: task.title,
      date: task.date,
      category: task.category,
      status: task.status,
      priority: task.priority,
      notes: task.notes || ''
    })
    setShowModal(true)
  }

  const handleDelete = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id))
    setDeleteConfirm(null)
    if (editTask?.id === id) {
      setEditTask(null)
      setForm(EMPTY_FORM)
    }
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 400 }}>Daily Tasks</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{displayDate}</div>
          <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
            {progress}% today
          </span>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, margin: 0 }}>Daily Task Manager</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Track what you accomplish each day. Build momentum.</p>
      </div>

      <div className="card" style={{ padding: '18px 20px', marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontWeight: 600 }}>{completedCount}/{totalCount} tasks completed</div>
          <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{progress}%</div>
        </div>
        <ProgressBar value={progress} color="var(--accent)" />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <div style={{ flex: '1 1 260px' }}>
          <input
            className="input-field"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        <div style={{ flex: '0 1 170px' }}>
          <input
            type="date"
            className="input-field"
            value={filters.date}
            onChange={e => setFilters(prev => ({ ...prev, date: e.target.value }))}
          />
        </div>
        <div style={{ flex: '0 1 160px' }}>
          <select
            className="input-field"
            value={filters.category}
            onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            {['All', ...CATEGORY_OPTIONS].map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: '0 1 160px' }}>
          <select
            className="input-field"
            value={filters.status}
            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            {['All', ...STATUS_OPTIONS].map(opt => (
              <option key={opt} value={opt}>{opt === 'All' ? 'All Status' : formatStatus(opt)}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-secondary" type="button">Categories</button>
        <button className="btn btn-primary" type="button" onClick={() => { setEditTask(null); setForm(EMPTY_FORM); setShowModal(true) }}>+ Add Task</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Daily Tasks</div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredTasks.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '24px 0' }}>
              No tasks found for these filters.
            </div>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)'
                }}
              >
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={() => toggleTask(task.id)}
                  style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 600,
                    textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                    color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)'
                  }}>
                    {task.title}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginTop: 6 }}>
                    <Badge type={task.priority}>{formatPriority(task.priority)}</Badge>
                    <Badge type={task.category}>{task.category}</Badge>
                    <Badge type={task.status}>{formatStatus(task.status)}</Badge>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(task.date)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => openEdit(task)}
                    style={{ padding: '6px 10px', fontSize: 12 }}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    type="button"
                    onClick={() => setDeleteConfirm(task.id)}
                    style={{ padding: '6px 10px', fontSize: 12 }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {deleteConfirm && (
        <Modal title="Delete Task?" onClose={() => setDeleteConfirm(null)} maxWidth={380}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>This will permanently delete the task.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete Task</button>
          </div>
        </Modal>
      )}

      {showModal && (
        <Modal title={editTask ? 'Edit Task' : 'Add Task'} onClose={() => { setShowModal(false); setEditTask(null) }} maxWidth={620}>
          <form onSubmit={addTask}>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Task Title</label>
                <input
                  className="input-field"
                  placeholder="What do you want to accomplish?"
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.date}
                  onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <SelectField
                label="Category"
                value={form.category}
                onChange={v => setForm(prev => ({ ...prev, category: v }))}
                options={CATEGORY_OPTIONS}
              />
              <SelectField
                label="Priority"
                value={form.priority}
                onChange={v => setForm(prev => ({ ...prev, priority: v }))}
                options={PRIORITY_OPTIONS}
              />
              <SelectField
                label="Status"
                value={form.status}
                onChange={v => setForm(prev => ({ ...prev, status: v }))}
                options={STATUS_OPTIONS.map(s => ({ value: s, label: formatStatus(s) }))}
              />
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Notes</label>
                <input
                  className="input-field"
                  placeholder="Optional notes"
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editTask ? 'Save Changes' : 'Save Task'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
