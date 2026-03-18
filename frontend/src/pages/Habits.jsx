import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchHabits, createHabit, updateHabit, deleteHabit, logHabit, removeHabitLog } from '../store/habitsSlice'
import { PageHeader, Modal, EmptyState, LoadingSpinner, Badge, SelectField } from '../components/common'
import toast from 'react-hot-toast'

const CATEGORIES = ['Health', 'Learning', 'Productivity', 'Mindfulness', 'Finance', 'Social', 'Other']
const ICONS = ['🏃', '📚', '💪', '🧘', '💻', '🍎', '💤', '✍️', '🎸', '🌿', '🧠', '💰', '🤸', '📖', '🔬']
const COLORS = ['#2D6A4F', '#5C6BC0', '#C77B2A', '#1E8449', '#D68910', '#C0392B', '#8E44AD', '#2980B9']

const EMPTY_FORM = { name: '', description: '', icon: '⭐', color: '#2D6A4F', category: 'Health', type: 'boolean', unit: '', targetValue: 1, frequency: 'daily' }

function getDaysInWeek() {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d)
  }
  return days
}

function isLogged(habit, date) {
  const d = new Date(date); d.setHours(0, 0, 0, 0)
  return habit.logs?.some(l => {
    const ld = new Date(l.date); ld.setHours(0, 0, 0, 0)
    return ld.getTime() === d.getTime()
  })
}

export default function Habits() {
  const dispatch = useDispatch()
  const { items: habits, loading } = useSelector(s => s.habits)
  const [showModal, setShowModal] = useState(false)
  const [editHabit, setEditHabit] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const weekDays = getDaysInWeek()
  const today = new Date()

  useEffect(() => { dispatch(fetchHabits()) }, [])

  const openCreate = () => { setForm(EMPTY_FORM); setEditHabit(null); setShowModal(true) }
  const openEdit = (h) => { setEditHabit(h); setForm({ name: h.name, description: h.description || '', icon: h.icon, color: h.color, category: h.category, type: h.type, unit: h.unit || '', targetValue: h.targetValue, frequency: h.frequency }); setShowModal(true) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const action = editHabit
      ? dispatch(updateHabit({ id: editHabit._id, data: form }))
      : dispatch(createHabit(form))
    const result = await action
    if (!result.error) { toast.success(editHabit ? 'Habit updated!' : 'Habit created! 🔁'); setShowModal(false) }
    else toast.error(result.payload)
  }

  const handleToggle = async (habit, date) => {
    const dateStr = new Date(date).toISOString()
    if (isLogged(habit, date)) {
      const result = await dispatch(removeHabitLog({ id: habit._id, date: dateStr }))
      if (!result.error) toast.success('Log removed')
    } else {
      const result = await dispatch(logHabit({ id: habit._id, data: { date: dateStr } }))
      if (!result.error) toast.success('Logged! ✅')
    }
  }

  const handleDelete = async (id) => {
    const result = await dispatch(deleteHabit(id))
    if (!result.error) { toast.success('Habit archived'); setDeleteConfirm(null) }
  }

  const getMonthRate = (habit) => {
    const now = new Date()
    const m = now.getMonth() + 1; const y = now.getFullYear()
    const daysInMonth = new Date(y, m, 0).getDate()
    const logs = habit.logs?.filter(l => {
      const d = new Date(l.date)
      return d.getMonth() + 1 === m && d.getFullYear() === y
    }).length || 0
    return Math.round((logs / daysInMonth) * 100)
  }

  const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Habit Tracker"
        subtitle="Build consistency, one day at a time"
        actions={<button className="btn btn-primary" onClick={openCreate}>+ New Habit</button>}
      />

      {/* Week view header */}
      {habits.length > 0 && (
        <>
        <div className="card desktop-only" style={{ padding: '20px 24px', marginBottom: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>This Week</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>

          {/* Grid */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '0 0 12px', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>Habit</th>
                  {weekDays.map((d, i) => (
                    <th key={i} style={{ textAlign: 'center', padding: '0 6px 12px', width: 48 }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{DAY_LABELS[d.getDay()]}</div>
                      <div style={{
                        fontSize: 13, fontWeight: 600,
                        color: d.toDateString() === today.toDateString() ? 'var(--accent)' : 'var(--text-secondary)',
                        marginTop: 2
                      }}>{d.getDate()}</div>
                    </th>
                  ))}
                  <th style={{ textAlign: 'center', padding: '0 0 12px', fontSize: 12, color: 'var(--text-muted)' }}>Month</th>
                  <th style={{ textAlign: 'center', padding: '0 0 12px', fontSize: 12, color: 'var(--text-muted)' }}>Streak</th>
                </tr>
              </thead>
              <tbody>
                {habits.map(habit => (
                  <tr key={habit._id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{habit.icon}</span>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13 }}>{habit.name}</div>
                          <Badge type={habit.category} style={{ fontSize: 10 }}>{habit.category}</Badge>
                        </div>
                      </div>
                    </td>
                    {weekDays.map((d, i) => {
                      const logged = isLogged(habit, d)
                      const isFuture = d > today
                      return (
                        <td key={i} style={{ textAlign: 'center', padding: '10px 6px' }}>
                          <button
                            onClick={() => !isFuture && handleToggle(habit, d)}
                            style={{
                              width: 30, height: 30, borderRadius: 8,
                              border: `2px solid ${logged ? habit.color : '#E8E4DC'}`,
                              background: logged ? habit.color : 'white',
                              cursor: isFuture ? 'not-allowed' : 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 14, color: 'white', margin: '0 auto',
                              opacity: isFuture ? 0.3 : 1,
                              transition: 'all 0.15s ease'
                            }}
                            title={isFuture ? "Can't log future dates" : logged ? 'Click to unlog' : 'Click to log'}
                          >{logged ? '✓' : ''}</button>
                        </td>
                      )
                    })}
                    <td style={{ textAlign: 'center', padding: '10px 0' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{getMonthRate(habit)}%</span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '10px 0' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: habit.streak > 0 ? '#C77B2A' : 'var(--text-muted)' }}>
                        {habit.streak > 0 ? `🔥 ${habit.streak}` : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card mobile-only" style={{ padding: '16px', marginBottom: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>This Week</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
            {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {habits.map(habit => (
              <div key={habit._id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 18 }}>{habit.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{habit.name}</div>
                      <Badge type={habit.category} style={{ fontSize: 10 }}>{habit.category}</Badge>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{getMonthRate(habit)}%</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginTop: 10 }}>
                  {weekDays.map((d, i) => {
                    const logged = isLogged(habit, d)
                    const isFuture = d > today
                    return (
                      <button
                        key={i}
                        onClick={() => !isFuture && handleToggle(habit, d)}
                        style={{
                          height: 28,
                          borderRadius: 6,
                          border: `2px solid ${logged ? habit.color : '#E8E4DC'}`,
                          background: logged ? habit.color : 'white',
                          color: 'white',
                          fontSize: 12,
                          opacity: isFuture ? 0.3 : 1,
                          cursor: isFuture ? 'not-allowed' : 'pointer'
                        }}
                        title={isFuture ? "Can't log future dates" : logged ? 'Click to unlog' : 'Click to log'}
                      >
                        {logged ? '✓' : ''}
                      </button>
                    )
                  })}
                </div>
                <div style={{ fontSize: 12, color: habit.streak > 0 ? '#C77B2A' : 'var(--text-muted)', marginTop: 8 }}>
                  {habit.streak > 0 ? `🔥 Streak ${habit.streak}` : 'No streak yet'}
                </div>
              </div>
            ))}
          </div>
        </div>
        </>
      )}

      {/* Habit cards */}
      {loading ? <LoadingSpinner /> : habits.length === 0 ? (
        <EmptyState icon="🔁" title="No habits yet" description="Start building positive habits. Track anything from exercise to reading."
          action={<button className="btn btn-primary" onClick={openCreate}>Create your first habit</button>}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {habits.map(habit => (
            <div key={habit._id} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: habit.color + '20', border: `2px solid ${habit.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
                  }}>{habit.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{habit.name}</div>
                    <Badge type={habit.category}>{habit.category}</Badge>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-ghost" style={{ padding: '4px 6px', fontSize: 13 }} onClick={() => openEdit(habit)}>✏️</button>
                  <button className="btn btn-danger" style={{ padding: '4px 6px', fontSize: 13 }} onClick={() => setDeleteConfirm(habit._id)}>🗑</button>
                </div>
              </div>

              {habit.description && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>{habit.description}</p>}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div style={{ textAlign: 'center', padding: '8px', background: 'var(--surface-2)', borderRadius: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: habit.streak > 0 ? '#C77B2A' : 'var(--text-muted)' }}>{habit.streak > 0 ? `🔥 ${habit.streak}` : '0'}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Streak</div>
                </div>
                <div style={{ textAlign: 'center', padding: '8px', background: 'var(--surface-2)', borderRadius: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>{getMonthRate(habit)}%</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>This month</div>
                </div>
                <div style={{ textAlign: 'center', padding: '8px', background: 'var(--surface-2)', borderRadius: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#5C6BC0' }}>{habit.longestStreak}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Best streak</div>
                </div>
              </div>

              {/* Today toggle */}
              <button
                onClick={() => handleToggle(habit, new Date())}
                style={{
                  width: '100%', marginTop: 12, padding: '8px',
                  borderRadius: 8, border: `2px solid ${isLogged(habit, new Date()) ? habit.color : 'var(--border)'}`,
                  background: isLogged(habit, new Date()) ? habit.color + '15' : 'white',
                  color: isLogged(habit, new Date()) ? habit.color : 'var(--text-secondary)',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                  fontFamily: 'inherit', transition: 'all 0.15s ease'
                }}
              >
                {isLogged(habit, new Date()) ? '✓ Done today!' : '○ Mark today as done'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <Modal title="Archive Habit?" onClose={() => setDeleteConfirm(null)} maxWidth={380}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>This will archive the habit. Your log history will be preserved.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Archive</button>
          </div>
        </Modal>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <Modal title={editHabit ? 'Edit Habit' : 'Create New Habit'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Habit Name *</label>
                <input className="input-field" placeholder="e.g. Morning Run" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Description</label>
                <input className="input-field" placeholder="Optional details" value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Icon</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {ICONS.map(ic => (
                    <button key={ic} type="button" onClick={() => setForm(p => ({ ...p, icon: ic }))}
                      style={{ width: 34, height: 34, borderRadius: 8, border: `2px solid ${form.icon === ic ? 'var(--accent)' : 'var(--border)'}`, background: form.icon === ic ? 'var(--accent-light)' : 'white', fontSize: 16, cursor: 'pointer' }}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Color</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))}
                      style={{ width: 28, height: 28, borderRadius: 7, background: c, border: `3px solid ${form.color === c ? '#1A1714' : 'transparent'}`, cursor: 'pointer' }} />
                  ))}
                </div>
              </div>

              <SelectField label="Category" value={form.category} onChange={v => setForm(p => ({ ...p, category: v }))}
                options={CATEGORIES.map(c => ({ value: c, label: c }))} />
              <SelectField label="Type" value={form.type} onChange={v => setForm(p => ({ ...p, type: v }))}
                options={[{ value: 'boolean', label: 'Done / Not Done' }, { value: 'quantity', label: 'Track Quantity' }]} />
              {form.type === 'quantity' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Unit</label>
                    <input className="input-field" placeholder="hours, pages, km..." value={form.unit}
                      onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Daily Target</label>
                    <input className="input-field" type="number" min="1" value={form.targetValue}
                      onChange={e => setForm(p => ({ ...p, targetValue: parseInt(e.target.value) }))} />
                  </div>
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editHabit ? 'Save Changes' : 'Create Habit'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
