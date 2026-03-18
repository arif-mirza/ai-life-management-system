import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { register, clearError } from '../store/authSlice'
import toast from 'react-hot-toast'

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector(s => s.auth)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [dispatch, error])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    const result = await dispatch(register({ name: form.name, email: form.email, password: form.password }))
    if (!result.error) {
      toast.success('Account created!')
      navigate('/')
    }
  }

  const field = (key, label, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{label}</label>
      <input
        className="input-field"
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        required
      />
    </div>
  )

  return (
    <div className="auth-shell">
      <div className="auth-panel animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: 34 }}>
          <div className="auth-mark">✦</div>
          <h1 className="hero-title" style={{ margin: 0 }}>Start your journey</h1>
          <p className="hero-subtitle" style={{ color: 'var(--text-secondary)', margin: '8px auto 0', fontSize: 14 }}>
            Create your LifePortal account and manage everything from one calm workspace.
          </p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit}>
            {field('name', 'Full Name', 'text', 'Muhammad Arif')}
            {field('email', 'Email', 'email', 'you@example.com')}
            {field('password', 'Password', 'password', '••••••••')}
            {field('confirm', 'Confirm Password', 'password', '••••••••')}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px 18px', fontSize: 15, marginTop: 8 }} disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating account...</> : 'Create account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: 13 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
