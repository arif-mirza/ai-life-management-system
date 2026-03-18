import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { Modal, ProgressBar, StatCard, Badge, LoadingSpinner, EmptyState } from '../components/common'
import { fetchSEHub, addSEHubTask, updateSEHubTask, deleteSEHubTask } from '../store/seHubSlice'

const CATEGORY_OPTIONS = ['Frontend', 'Backend', 'DevOps', 'Interview Prep', 'System Design', 'Project', 'Core CS', 'Other']
const STATUS_OPTIONS = ['pending', 'in-progress', 'completed']
const PRIORITY_OPTIONS = ['low', 'medium', 'high']

const EMPTY_FORM = {
  title: '',
  category: 'Frontend',
  status: 'pending',
  priority: 'medium',
  details: ''
}

const CATEGORY_STYLES = {
  Frontend: { background: '#EEF0FD', color: '#5C6BC0' },
  Backend: { background: '#E8F5EE', color: '#2D6A4F' },
  DevOps: { background: '#F2F2F2', color: '#6B6560' },
  'Interview Prep': { background: '#FEF9E7', color: '#D68910' },
  'System Design': { background: '#FDECEB', color: '#C77B2A' },
  Project: { background: '#EAF3FF', color: '#245B9E' },
  'Core CS': { background: '#F6EFFF', color: '#7551B2' },
  Other: { background: '#F2F2F2', color: '#666' }
}

const STATUS_LABELS = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed'
}

const PRIORITY_STYLES = {
  low: { background: '#F2F2F2', color: '#666' },
  medium: { background: '#FDF3E7', color: '#C77B2A' },
  high: { background: '#FDECEB', color: '#C0392B' }
}

const STATUS_STYLES = {
  pending: { background: '#F2F2F2', color: '#6B6560' },
  'in-progress': { background: '#EEF0FD', color: '#5C6BC0' },
  completed: { background: '#EAFAF1', color: '#1E8449' }
}

const formatDate = (value) => {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function SEHub() {
  const dispatch = useDispatch()
  const { data, loading } = useSelector(s => s.seHub)
  const [filters, setFilters] = useState({ search: '', category: 'All', status: 'All' })
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    dispatch(fetchSEHub())
  }, [dispatch])

  const tasks = data?.tasks || []
  const summary = data?.summary || { total: 0, completed: 0, inProgress: 0, pending: 0, progress: 0 }

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = filters.search
        ? task.title.toLowerCase().includes(filters.search.toLowerCase().trim()) ||
          (task.details || '').toLowerCase().includes(filters.search.toLowerCase().trim())
        : true
      const matchesCategory = filters.category === 'All' ? true : task.category === filters.category
      const matchesStatus = filters.status === 'All' ? true : task.status === filters.status
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [tasks, filters])

  const openCreate = () => {
    setEditTask(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (task) => {
    setEditTask(task)
    setForm({
      title: task.title,
      category: task.category,
      status: task.status,
      priority: task.priority,
      details: task.details || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return

    const payload = {
      title: form.title.trim(),
      category: form.category,
      status: form.status,
      priority: form.priority,
      details: form.details.trim()
    }

    const result = editTask
      ? await dispatch(updateSEHubTask({ taskId: editTask._id, data: payload }))
      : await dispatch(addSEHubTask(payload))

    if (result.error) {
      toast.error(result.payload || 'Unable to save task')
      return
    }

    toast.success(editTask ? 'SE Hub task updated' : 'SE Hub task created')
    setShowModal(false)
    setEditTask(null)
    setForm(EMPTY_FORM)
  }

  const handleDelete = async (taskId) => {
    const result = await dispatch(deleteSEHubTask(taskId))
    if (result.error) {
      toast.error(result.payload || 'Unable to delete task')
      return
    }

    toast.success('SE Hub task deleted')
    setDeleteConfirm(null)
  }

  const handleToggleComplete = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed'
    const result = await dispatch(updateSEHubTask({
      taskId: task._id,
      data: { status: nextStatus }
    }))

    if (result.error) {
      toast.error(result.payload || 'Unable to update status')
      return
    }

    toast.success(nextStatus === 'completed' ? 'Task marked completed' : 'Task moved back to pending')
  }

  const todayText = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  if (loading && tasks.length === 0) return <LoadingSpinner size={40} />

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 400 }}>SE Hub</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{todayText}</div>
          <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
            {summary.progress}% complete
          </span>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, margin: 0 }}>Software Engineer Hub</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
          Your personal SE task inventory for projects, learning, and interview prep.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16, marginBottom: 18 }}>
        <StatCard icon="✓" label="Completed" value={summary.completed} sub={`of ${summary.total} tasks`} accent="#EAFAF1" />
        <StatCard icon="••" label="In Progress" value={summary.inProgress} sub="Currently active" accent="#EEF0FD" />
        <StatCard icon="○" label="Pending" value={summary.pending} sub="Still to start" accent="#F2F2F2" />
        <StatCard icon="↗" label="Progress" value={`${summary.progress}%`} sub="Overall completion" accent="#FDF3E7" />
      </div>

      <div className="card" style={{ padding: '18px 20px', marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontWeight: 600 }}>Overall Completion</div>
          <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{summary.progress}%</div>
        </div>
        <ProgressBar value={summary.progress} color="var(--accent)" />
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 18 }}>
        <div style={{ flex: '1 1 300px' }}>
          <input
            className="input-field"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        <div style={{ flex: '0 1 180px' }}>
          <select
            className="input-field"
            value={filters.category}
            onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            {['All', ...CATEGORY_OPTIONS].map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: '0 1 180px' }}>
          <select
            className="input-field"
            value={filters.status}
            onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
          >
            <option value="All">All Status</option>
            {STATUS_OPTIONS.map(option => (
              <option key={option} value={option}>{STATUS_LABELS[option]}</option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Task</button>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="card" style={{ padding: 0 }}>
          <EmptyState
            icon="💻"
            title={tasks.length === 0 ? 'No SE tasks yet' : 'No tasks match these filters'}
            description={tasks.length === 0 ? 'Create your first SE Hub task and it will stay saved for this user account.' : 'Try adjusting search, category, or status filters.'}
            action={tasks.length === 0 ? <button className="btn btn-primary" onClick={openCreate}>Create your first task</button> : null}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredTasks.map(task => (
            <div
              key={task._id}
              className="card"
              style={{
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 16
              }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1 }}>
                <button
                  type="button"
                  onClick={() => handleToggleComplete(task)}
                  aria-label={task.status === 'completed' ? 'Move task back to pending' : 'Mark task complete'}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    border: `1.5px solid ${task.status === 'completed' ? '#1E8449' : 'var(--border)'}`,
                    background: task.status === 'completed' ? '#1E8449' : '#fff',
                    color: '#fff',
                    marginTop: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    flexShrink: 0
                  }}
                >
                  {task.status === 'completed' ? '✓' : ''}
                </button>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, textDecoration: task.status === 'completed' ? 'line-through' : 'none', color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {task.title}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                    <Badge style={STATUS_STYLES[task.status]}>{STATUS_LABELS[task.status]}</Badge>
                    <Badge style={CATEGORY_STYLES[task.category] || CATEGORY_STYLES.Other}>{task.category}</Badge>
                    <Badge style={PRIORITY_STYLES[task.priority]}>{task.priority}</Badge>
                  </div>
                  {task.details && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                      {task.details}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                    Updated {formatDate(task.updatedAt || task.createdAt)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button className="btn btn-ghost" style={{ padding: '6px 8px', fontSize: 12 }} onClick={() => openEdit(task)}>✎</button>
                <button className="btn btn-danger" style={{ padding: '6px 8px', fontSize: 12 }} onClick={() => setDeleteConfirm(task)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editTask ? 'Edit SE Hub Task' : 'Add SE Hub Task'} onClose={() => setShowModal(false)} maxWidth={620}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="form-grid">
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Task Title</label>
                <input
                  className="input-field"
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Build portfolio website"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Category</label>
                <select className="input-field" value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}>
                  {CATEGORY_OPTIONS.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Status</label>
                <select className="input-field" value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}>
                  {STATUS_OPTIONS.map(option => (
                    <option key={option} value={option}>{STATUS_LABELS[option]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Priority</label>
                <select className="input-field" value={form.priority} onChange={e => setForm(prev => ({ ...prev, priority: e.target.value }))}>
                  {PRIORITY_OPTIONS.map(option => (
                    <option key={option} value={option}>{option[0].toUpperCase() + option.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Details</label>
                <input
                  className="input-field"
                  value={form.details}
                  onChange={e => setForm(prev => ({ ...prev, details: e.target.value }))}
                  placeholder="React + Tailwind, JWT auth, MongoDB"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editTask ? 'Save Changes' : 'Add Task'}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal title="Delete Task?" onClose={() => setDeleteConfirm(null)} maxWidth={380}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
            This will permanently remove <strong>{deleteConfirm.title}</strong> from your SE Hub.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm._id)}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
