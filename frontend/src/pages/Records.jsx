import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { PageHeader, ProgressBar, StatCard, Badge, LoadingSpinner } from '../components/common'
import { fetchGoals } from '../store/goalsSlice'
import { fetchHabits } from '../store/habitsSlice'
import { fetchNotes } from '../store/notesSlice'
import { fetchEducation } from '../store/educationSlice'
import { fetchSEHub } from '../store/seHubSlice'

const formatDate = (value) => {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const getSemesterTotals = (semester) => {
  const courses = semester.courses || []
  const totalLectures = courses.reduce((sum, c) => sum + (Number(c.totalLectures) || 0), 0)
  const covered = courses.reduce((sum, c) => sum + (Number(c.covered) || 0), 0)
  const progress = totalLectures ? Math.round((covered / totalLectures) * 100) : 0
  return { totalLectures, covered, progress, coursesCount: courses.length }
}

export default function Records() {
  const dispatch = useDispatch()
  const { items: goals, loading: goalsLoading } = useSelector(s => s.goals)
  const { items: habits, loading: habitsLoading } = useSelector(s => s.habits)
  const { items: notes, loading: notesLoading } = useSelector(s => s.notes)
  const { data: education, loading: educationLoading } = useSelector(s => s.education)
  const { data: seHub, loading: seHubLoading } = useSelector(s => s.seHub)

  useEffect(() => {
    dispatch(fetchGoals())
    dispatch(fetchHabits())
    dispatch(fetchNotes())
    dispatch(fetchEducation())
    dispatch(fetchSEHub())
  }, [dispatch])

  const semesters = education?.semesters || []
  const seHubTasks = seHub?.tasks || []

  const stats = useMemo(() => {
    const totalGoals = goals.length
    const completedGoals = goals.filter(g => g.status === 'completed').length
    const activeHabits = habits.length
    const totalNotes = notes.length
    const totalCourses = semesters.reduce((sum, s) => sum + (s.courses?.length || 0), 0)
    const totalSEHubTasks = seHubTasks.length
    return { totalGoals, completedGoals, activeHabits, totalNotes, totalCourses, totalSEHubTasks }
  }, [goals, habits, notes, semesters, seHubTasks])

  const recentActivity = useMemo(() => {
    const goalItems = goals.map(g => ({
      id: `goal-${g._id}`,
      type: 'Goal',
      title: g.title,
      date: g.updatedAt || g.createdAt,
      meta: `${g.status?.replace('-', ' ') || 'not-started'} • ${g.progress ?? 0}%`
    }))

    const noteItems = notes.map(n => ({
      id: `note-${n._id}`,
      type: 'Note',
      title: n.title || 'Untitled Note',
      date: n.updatedAt || n.createdAt,
      meta: n.tags?.length ? `#${n.tags.join(' #')}` : 'No tags'
    }))

    const habitItems = habits.flatMap(h => {
      const logs = h.logs || []
      return logs.map((log, idx) => ({
        id: `habit-${h._id}-${idx}`,
        type: 'Habit Log',
        title: h.name,
        date: log.date,
        meta: log.note || `${log.value || 1} ${h.unit || ''}`.trim()
      }))
    })

    const educationItems = semesters.flatMap(s => {
      const semesterActivity = [{
        id: `semester-${s._id}`,
        type: 'Semester',
        title: `${s.title} (${s.year})`,
        date: s.updatedAt || s.createdAt,
        meta: `${s.courses?.length || 0} courses`
      }]
      const courseActivity = (s.courses || []).map(c => ({
        id: `course-${c._id}`,
        type: 'Course',
        title: c.name,
        date: c.updatedAt || c.createdAt,
        meta: `${c.covered || 0}/${c.totalLectures || 0} lectures`
      }))
      return semesterActivity.concat(courseActivity)
    })

    const seHubItems = seHubTasks.map(task => ({
      id: `sehub-${task._id}`,
      type: 'SE Hub',
      title: task.title,
      date: task.updatedAt || task.createdAt,
      meta: `${task.status?.replace('-', ' ') || 'pending'} • ${task.category}`
    }))

    return [...goalItems, ...noteItems, ...habitItems, ...educationItems, ...seHubItems]
      .filter(item => item.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8)
  }, [goals, notes, habits, semesters, seHubTasks])

  const isLoading = goalsLoading || habitsLoading || notesLoading || educationLoading || seHubLoading

  const seHubSummary = useMemo(() => {
    const total = seHubTasks.length
    const completed = seHubTasks.filter(task => task.status === 'completed').length
    const inProgress = seHubTasks.filter(task => task.status === 'in-progress').length
    const progress = total ? Math.round((completed / total) * 100) : 0
    return { total, completed, inProgress, progress }
  }, [seHubTasks])

  if (isLoading && !goals.length && !notes.length && !habits.length && semesters.length === 0 && seHubTasks.length === 0) {
    return <LoadingSpinner size={40} />
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Records"
        subtitle="All your saved activity, goals, habits, notes, education progress, and SE Hub history"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
        <StatCard icon="🎯" label="Total Goals" value={stats.totalGoals} sub={`${stats.completedGoals} completed`} />
        <StatCard icon="🔁" label="Active Habits" value={stats.activeHabits} sub="Tracked habits" accent="#EEF0FD" />
        <StatCard icon="📝" label="Notes" value={stats.totalNotes} sub="Saved entries" accent="#FEF9E7" />
        <StatCard icon="🎓" label="Courses" value={stats.totalCourses} sub="Across semesters" accent="#EAFAF1" />
        <StatCard icon="💻" label="SE Hub Tasks" value={stats.totalSEHubTasks} sub={`${seHubSummary.completed} completed`} accent="#FFF3E2" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Recent Activity</div>
          {recentActivity.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '18px 0' }}>
              No activity yet. Start adding goals, notes, habits, courses, or SE Hub tasks.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentActivity.map(item => (
                <div
                  key={item.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      {item.type} • {item.meta}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatDate(item.date)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Goals Snapshot</div>
          {goals.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '18px 0' }}>
              No goals added yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {goals.slice(0, 4).map(goal => (
                <div key={goal._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{goal.title}</div>
                    <Badge type={goal.status}>{goal.status?.replace('-', ' ')}</Badge>
                  </div>
                  <ProgressBar value={goal.progress} color={goal.status === 'completed' ? '#1E8449' : '#2D6A4F'} showLabel />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>SE Hub Progress</div>
          {seHubTasks.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '18px 0' }}>
              No SE Hub tasks saved yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {seHubSummary.completed} completed • {seHubSummary.inProgress} in progress
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{seHubSummary.progress}%</div>
                </div>
                <ProgressBar value={seHubSummary.progress} color="var(--accent)" showLabel />
              </div>
              {seHubTasks.slice(0, 4).map(task => (
                <div key={task._id} style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)' }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{task.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    {task.category} • {task.status?.replace('-', ' ')}
                  </div>
                  {task.details && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>{task.details}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Education Overview</div>
          {semesters.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '18px 0' }}>
              No semesters tracked yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {semesters.map(semester => {
                const totals = getSemesterTotals(semester)
                return (
                  <div key={semester._id} style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{semester.title} ({semester.year})</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {totals.coursesCount} courses • {totals.covered}/{totals.totalLectures} lectures
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{totals.progress}%</div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <ProgressBar value={totals.progress} color="var(--accent)" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 12 }}>Notes Archive</div>
          {notes.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '18px 0' }}>
              No notes saved yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notes.slice(0, 5).map(note => (
                <div key={note._id} style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)' }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{note.title || 'Untitled Note'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    {note.tags?.length ? note.tags.map(t => `#${t}`).join(' ') : 'No tags'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{formatDate(note.updatedAt || note.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
