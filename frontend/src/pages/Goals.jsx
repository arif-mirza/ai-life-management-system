import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchGoals, createGoal, updateGoal, deleteGoal, toggleTarget, setFilters } from '../store/goalsSlice'
import { PageHeader, Badge, ProgressBar, Modal, EmptyState, LoadingSpinner, SelectField } from '../components/common'
import toast from 'react-hot-toast'

const CATEGORIES = ['Career', 'Health', 'Finance', 'Learning', 'Personal Growth', 'Relationships', 'Travel', 'Other']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1, CURRENT_YEAR + 2]

const EMPTY_FORM = {
  title: '', description: '', category: 'Career', year: CURRENT_YEAR,
  priority: 'medium', status: 'not-started', tags: '', monthlyTargets: []
}

export default function Goals() {
  const dispatch = useDispatch()
  const { items: goals, loading, filters } = useSelector(s => s.goals)
  const [showModal, setShowModal] = useState(false)
  const [editGoal, setEditGoal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [newTarget, setNewTarget] = useState({ month: 1, target: '' })
  const [expandedId, setExpandedId] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => { dispatch(fetchGoals(filters)) }, [filters])

  const openCreate = () => { setForm(EMPTY_FORM); setEditGoal(null); setShowModal(true) }
  const openEdit = (goal) => {
    setEditGoal(goal)
    setForm({
      title: goal.title, description: goal.description || '', category: goal.category,
      year: goal.year, priority: goal.priority, status: goal.status,
      tags: goal.tags?.join(', ') || '', monthlyTargets: goal.monthlyTargets || []
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] }
    const action = editGoal
      ? dispatch(updateGoal({ id: editGoal._id, data }))
      : dispatch(createGoal(data))
    const result = await action
    if (!result.error) {
      toast.success(editGoal ? 'Goal updated!' : 'Goal created! 🎯')
      setShowModal(false)
      dispatch(fetchGoals(filters))
    } else toast.error(result.payload)
  }

  const handleDelete = async (id) => {
    const result = await dispatch(deleteGoal(id))
    if (!result.error) { toast.success('Goal deleted'); setDeleteConfirm(null) }
  }

  const handleToggleTarget = async (goalId, targetId) => {
    await dispatch(toggleTarget({ goalId, targetId }))
  }

  const addTarget = () => {
    if (!newTarget.target.trim()) return
    setForm(p => ({ ...p, monthlyTargets: [...p.monthlyTargets, { ...newTarget, completed: false }] }))
    setNewTarget({ month: 1, target: '' })
  }

  const removeTarget = (idx) => setForm(p => ({ ...p, monthlyTargets: p.monthlyTargets.filter((_, i) => i !== idx) }))

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Goals"
        subtitle={`${goals.length} goals tracked`}
        actions={
          <button className="btn btn-primary" onClick={openCreate}>+ New Goal</button>
        }
      />

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="input-field"
          placeholder="🔍 Search goals..."
          value={filters.search}
          onChange={e => dispatch(setFilters({ search: e.target.value }))}
          style={{ width: 220, padding: '8px 12px' }}
        />
        <select className="input-field" value={filters.year} onChange={e => dispatch(setFilters({ year: parseInt(e.target.value) }))} style={{ width: 100 }}>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="input-field" value={filters.category} onChange={e => dispatch(setFilters({ category: e.target.value }))} style={{ width: 140 }}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input-field" value={filters.status} onChange={e => dispatch(setFilters({ status: e.target.value }))} style={{ width: 150 }}>
          <option value="">All statuses</option>
          <option value="not-started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="paused">Paused</option>
        </select>
        {(filters.search || filters.category || filters.status) &&
          <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => dispatch(setFilters({ search: '', category: '', status: '' }))}>
            ✕ Clear
          </button>
        }
      </div>

      {loading ? <LoadingSpinner /> : goals.length === 0 ? (
        <EmptyState icon="🎯" title="No goals yet" description="Set your first goal and start tracking your progress towards your dreams."
          action={<button className="btn btn-primary" onClick={openCreate}>Create your first goal</button>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {goals.map(goal => (
            <div key={goal._id} className="card" style={{ padding: '20px 24px', cursor: 'pointer' }}>
              <div onClick={() => setExpandedId(expandedId === goal._id ? null : goal._id)}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{goal.title}</span>
                      <Badge type={goal.status}>{goal.status.replace('-', ' ')}</Badge>
                      <Badge type={goal.priority}>{goal.priority}</Badge>
                      <Badge type={goal.category}>{goal.category}</Badge>
                    </div>
                    {goal.description && <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 10px' }}>{goal.description}</p>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <ProgressBar value={goal.progress} color={
                        goal.status === 'completed' ? '#1E8449' : goal.status === 'in-progress' ? '#5C6BC0' : '#C77B2A'
                      } />
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{goal.progress}%</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{goal.year}</span>
                    <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 13 }} onClick={e => { e.stopPropagation(); openEdit(goal) }}>✏️</button>
                    <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: 13 }} onClick={e => { e.stopPropagation(); setDeleteConfirm(goal._id) }}>🗑</button>
                    <span style={{ fontSize: 16, color: 'var(--text-muted)', padding: '0 4px' }}>{expandedId === goal._id ? '▾' : '▸'}</span>
                  </div>
                </div>
              </div>

              {/* Monthly targets */}
              {expandedId === goal._id && goal.monthlyTargets?.length > 0 && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Monthly Targets</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                    {goal.monthlyTargets.map(t => (
                      <div
                        key={t._id}
                        onClick={e => { e.stopPropagation(); handleToggleTarget(goal._id, t._id) }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                          background: t.completed ? '#EAFAF1' : 'var(--surface-2)',
                          border: `1px solid ${t.completed ? '#A9DFBF' : 'var(--border)'}`,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{
                          width: 18, height: 18, borderRadius: 5,
                          border: `2px solid ${t.completed ? '#1E8449' : '#C0BDB8'}`,
                          background: t.completed ? '#1E8449' : 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, fontSize: 11, color: 'white'
                        }}>{t.completed ? '✓' : ''}</div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: t.completed ? '#1E8449' : 'var(--text-muted)', textTransform: 'uppercase' }}>{MONTHS[t.month - 1]}</div>
                          <div style={{ fontSize: 12, color: t.completed ? '#1E8449' : 'var(--text-primary)', textDecoration: t.completed ? 'line-through' : 'none', opacity: t.completed ? 0.7 : 1 }}>{t.target}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <Modal title="Delete Goal?" onClose={() => setDeleteConfirm(null)} maxWidth={380}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>This will permanently delete the goal and all its monthly targets. This cannot be undone.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete Goal</button>
          </div>
        </Modal>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <Modal title={editGoal ? 'Edit Goal' : 'Create New Goal'} onClose={() => setShowModal(false)} maxWidth={600}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Goal Title *</label>
                <input className="input-field" placeholder="e.g. Learn Spanish" value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Description</label>
                <textarea className="input-field" placeholder="What's this goal about?" value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={2} style={{ resize: 'vertical' }} />
              </div>
              <SelectField label="Category" value={form.category} onChange={v => setForm(p => ({ ...p, category: v }))}
                options={CATEGORIES.map(c => ({ value: c, label: c }))} />
              <SelectField label="Year" value={form.year} onChange={v => setForm(p => ({ ...p, year: parseInt(v) }))}
                options={YEARS.map(y => ({ value: y, label: y }))} />
              <SelectField label="Priority" value={form.priority} onChange={v => setForm(p => ({ ...p, priority: v }))}
                options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }]} />
              <SelectField label="Status" value={form.status} onChange={v => setForm(p => ({ ...p, status: v }))}
                options={[
                  { value: 'not-started', label: 'Not Started' }, { value: 'in-progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' }, { value: 'paused', label: 'Paused' }
                ]} />
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Tags (comma separated)</label>
                <input className="input-field" placeholder="e.g. language, skill, priority" value={form.tags}
                  onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
              </div>
            </div>

            {/* Monthly targets */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Monthly Targets</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <select className="input-field" value={newTarget.month} onChange={e => setNewTarget(p => ({ ...p, month: parseInt(e.target.value) }))} style={{ width: 100 }}>
                  {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                </select>
                <input className="input-field" placeholder="Target description"
                  value={newTarget.target} onChange={e => setNewTarget(p => ({ ...p, target: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTarget())} />
                <button type="button" className="btn btn-secondary" onClick={addTarget} style={{ whiteSpace: 'nowrap' }}>+ Add</button>
              </div>
              {form.monthlyTargets.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 160, overflow: 'auto' }}>
                  {form.monthlyTargets.map((t, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'var(--surface-2)', borderRadius: 6 }}>
                      <span style={{ fontSize: 13 }}><strong style={{ color: 'var(--accent)' }}>{MONTHS[t.month - 1]}:</strong> {t.target}</span>
                      <button type="button" onClick={() => removeTarget(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 15, padding: '0 4px' }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editGoal ? 'Save Changes' : 'Create Goal'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
