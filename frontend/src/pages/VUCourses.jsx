import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, ProgressBar, SelectField, StatCard, Badge, LoadingSpinner } from '../components/common'
import {
  fetchEducation,
  addSemester,
  updateSemester,
  deleteSemester,
  addCourse,
  updateCourse,
  deleteCourse
} from '../store/educationSlice'

const STATUS_OPTIONS = ['not-started', 'in-progress', 'completed']

const formatStatus = (status) => ({
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  completed: 'Completed'
}[status] || status)

const EMPTY_SEMESTER = {
  title: '',
  year: new Date().getFullYear()
}

const EMPTY_COURSE = {
  name: '',
  totalLectures: 0,
  covered: 0,
  examDate: '',
  status: 'not-started',
  notes: ''
}

const getSemesterTotals = (semester) => {
  const courses = semester.courses || []
  const totalLectures = courses.reduce((sum, c) => sum + (Number(c.totalLectures) || 0), 0)
  const covered = courses.reduce((sum, c) => sum + (Number(c.covered) || 0), 0)
  const progress = totalLectures ? Math.round((covered / totalLectures) * 100) : 0
  const status = progress === 100 && courses.length > 0 ? 'completed' : covered > 0 ? 'in-progress' : 'not-started'
  return { totalLectures, covered, progress, status, coursesCount: courses.length }
}

export default function VUCourses() {
  const dispatch = useDispatch()
  const { data, loading } = useSelector(s => s.education)

  const [showSemesterModal, setShowSemesterModal] = useState(false)
  const [editSemester, setEditSemester] = useState(null)
  const [semesterForm, setSemesterForm] = useState(EMPTY_SEMESTER)

  const [showCourseModal, setShowCourseModal] = useState(false)
  const [editCourse, setEditCourse] = useState(null)
  const [courseSemesterId, setCourseSemesterId] = useState(null)
  const [courseForm, setCourseForm] = useState(EMPTY_COURSE)

  useEffect(() => { dispatch(fetchEducation()) }, [])

  const semesters = data?.semesters || []
  const overallStats = useMemo(() => {
    const totals = semesters.reduce((acc, sem) => {
      const { totalLectures, covered, coursesCount } = getSemesterTotals(sem)
      acc.totalLectures += totalLectures
      acc.covered += covered
      acc.courses += coursesCount
      return acc
    }, { totalLectures: 0, covered: 0, courses: 0 })
    const progress = totals.totalLectures ? Math.round((totals.covered / totals.totalLectures) * 100) : 0
    return { ...totals, progress }
  }, [semesters])

  const todayText = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  const openAddSemester = () => {
    setEditSemester(null)
    setSemesterForm(EMPTY_SEMESTER)
    setShowSemesterModal(true)
  }

  const openEditSemester = (semester) => {
    setEditSemester(semester)
    setSemesterForm({ title: semester.title, year: semester.year })
    setShowSemesterModal(true)
  }

  const submitSemester = async (e) => {
    e.preventDefault()
    if (!semesterForm.title.trim()) return
    const payload = { title: semesterForm.title.trim(), year: Number(semesterForm.year) }
    if (editSemester) {
      await dispatch(updateSemester({ semesterId: editSemester._id, data: payload }))
    } else {
      await dispatch(addSemester(payload))
    }
    setShowSemesterModal(false)
  }

  const removeSemester = async (semesterId) => {
    await dispatch(deleteSemester(semesterId))
  }

  const openAddCourse = (semesterId) => {
    setCourseSemesterId(semesterId)
    setEditCourse(null)
    setCourseForm(EMPTY_COURSE)
    setShowCourseModal(true)
  }

  const openEditCourse = (semesterId, course) => {
    setCourseSemesterId(semesterId)
    setEditCourse(course)
    setCourseForm({
      name: course.name,
      totalLectures: course.totalLectures || 0,
      covered: course.covered || 0,
      examDate: course.examDate ? course.examDate.slice(0, 10) : '',
      status: course.status || 'not-started',
      notes: course.notes || ''
    })
    setShowCourseModal(true)
  }

  const submitCourse = async (e) => {
    e.preventDefault()
    if (!courseForm.name.trim()) return
    const payload = {
      name: courseForm.name.trim(),
      totalLectures: Number(courseForm.totalLectures) || 0,
      covered: Number(courseForm.covered) || 0,
      examDate: courseForm.examDate || null,
      status: courseForm.status,
      notes: courseForm.notes
    }
    if (editCourse) {
      await dispatch(updateCourse({ semesterId: courseSemesterId, courseId: editCourse._id, data: payload }))
    } else {
      await dispatch(addCourse({ semesterId: courseSemesterId, data: payload }))
    }
    setShowCourseModal(false)
  }

  const removeCourse = async (semesterId, courseId) => {
    await dispatch(deleteCourse({ semesterId, courseId }))
  }

  if (loading && !data) return <LoadingSpinner size={40} />

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 400 }}>Education</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{todayText}</div>
          <span className="badge" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
            {overallStats.progress}% overall
          </span>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, margin: 0 }}>Education Study Manager</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Track semesters, courses, and lecture progress.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 18 }}>
        <StatCard icon="🎓" label="Semesters" value={semesters.length} sub="Total semesters" />
        <StatCard icon="📚" label="Total Courses" value={overallStats.courses} sub="Across all semesters" accent="#EEF0FD" />
        <StatCard icon="✅" label="Lectures Covered" value={`${overallStats.covered}/${overallStats.totalLectures}`} sub="All courses" accent="#FEF9E7" />
        <StatCard icon="📈" label="Overall Progress" value={`${overallStats.progress}%`} sub="Lecture completion" accent="#EAFAF1" />
      </div>

      <div className="card" style={{ padding: '16px 20px', marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontWeight: 600 }}>Overall Lecture Completion</div>
          <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{overallStats.progress}%</div>
        </div>
        <ProgressBar value={overallStats.progress} color="var(--accent)" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {semesters.length} semesters • {overallStats.courses} courses
        </div>
        <button className="btn btn-primary" onClick={openAddSemester}>+ Add Semester</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {semesters.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
            No semesters yet. Create your first semester to get started.
          </div>
        ) : (
          semesters.map(semester => {
            const { totalLectures, covered, progress, status, coursesCount } = getSemesterTotals(semester)
            return (
              <div key={semester._id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 12,
                      background: 'var(--accent-light)', color: 'var(--accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                    }}>🎓</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{semester.title} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({semester.year})</span></div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {coursesCount} courses • {covered}/{totalLectures} lectures
                      </div>
                    </div>
                    <Badge type={status}>{formatStatus(status)}</Badge>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>{progress}%</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>progress</div>
                    </div>
                    <button className="btn btn-ghost" onClick={() => openEditSemester(semester)} style={{ padding: '6px 8px', fontSize: 12 }}>✏️</button>
                    <button className="btn btn-danger" onClick={() => removeSemester(semester._id)} style={{ padding: '6px 8px', fontSize: 12 }}>🗑</button>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <ProgressBar value={progress} showLabel />
                </div>

                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {semester.courses.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '12px 0' }}>
                      No courses yet. Add one below.
                    </div>
                  ) : (
                    semester.courses.map(course => {
                      const courseProgress = course.totalLectures
                        ? Math.round((course.covered / course.totalLectures) * 100)
                        : 0
                      return (
                        <div key={course._id} style={{
                          padding: '12px 14px',
                          borderRadius: 10,
                          border: '1px solid var(--border)',
                          background: 'var(--surface)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                            <div>
                              <div style={{ fontWeight: 600 }}>{course.name}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                {course.covered}/{course.totalLectures} lectures • Exam: {course.examDate ? new Date(course.examDate).toLocaleDateString('en-US') : 'TBD'}
                              </div>
                              <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                <Badge type={course.status}>{formatStatus(course.status)}</Badge>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 14, fontWeight: 700 }}>{courseProgress}%</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>completion</div>
                              </div>
                              <button className="btn btn-ghost" onClick={() => openEditCourse(semester._id, course)} style={{ padding: '6px 8px', fontSize: 12 }}>✏️</button>
                              <button className="btn btn-danger" onClick={() => removeCourse(semester._id, course._id)} style={{ padding: '6px 8px', fontSize: 12 }}>🗑</button>
                            </div>
                          </div>
                          {course.notes && (
                            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                              {course.notes}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>

                <div style={{ marginTop: 14 }}>
                  <button className="btn btn-secondary" onClick={() => openAddCourse(semester._id)}>+ Add Course</button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {showSemesterModal && (
        <Modal title={editSemester ? 'Edit Semester' : 'Add Semester'} onClose={() => setShowSemesterModal(false)} maxWidth={520}>
          <form onSubmit={submitSemester}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Semester Title</label>
                <input className="input-field" value={semesterForm.title} onChange={e => setSemesterForm(p => ({ ...p, title: e.target.value }))} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Year</label>
                <input type="number" className="input-field" value={semesterForm.year} onChange={e => setSemesterForm(p => ({ ...p, year: e.target.value }))} required />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowSemesterModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editSemester ? 'Save Changes' : 'Save Semester'}</button>
            </div>
          </form>
        </Modal>
      )}

      {showCourseModal && (
        <Modal title={editCourse ? 'Edit Course' : 'Add Course'} onClose={() => setShowCourseModal(false)} maxWidth={620}>
          <form onSubmit={submitCourse}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Course Name</label>
                <input className="input-field" value={courseForm.name} onChange={e => setCourseForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Total Lectures</label>
                <input type="number" className="input-field" value={courseForm.totalLectures} onChange={e => setCourseForm(p => ({ ...p, totalLectures: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Covered</label>
                <input type="number" className="input-field" value={courseForm.covered} onChange={e => setCourseForm(p => ({ ...p, covered: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Exam Date</label>
                <input type="date" className="input-field" value={courseForm.examDate} onChange={e => setCourseForm(p => ({ ...p, examDate: e.target.value }))} />
              </div>
              <SelectField
                label="Status"
                value={courseForm.status}
                onChange={v => setCourseForm(p => ({ ...p, status: v }))}
                options={STATUS_OPTIONS.map(s => ({ value: s, label: formatStatus(s) }))}
              />
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Notes</label>
                <textarea className="input-field" rows={3} value={courseForm.notes} onChange={e => setCourseForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowCourseModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editCourse ? 'Save Changes' : 'Save Course'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
