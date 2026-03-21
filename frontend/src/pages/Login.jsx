import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { login, clearError } from '../store/authSlice'
import toast from 'react-hot-toast'
import { LoadingButton } from '../components/common'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector(s => s.auth)
  const [form, setForm] = useState({ email: '', password: '' })

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [dispatch, error])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(login(form))
    if (!result.error) {
      toast.success('Welcome back!')
      navigate('/')
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: 34 }}>
          <div className="auth-mark">✦</div>
          <h1 className="hero-title" style={{ margin: 0 }}>Welcome back</h1>
          <p className="hero-subtitle" style={{ color: 'var(--text-secondary)', margin: '8px auto 0', fontSize: 14 }}>
            Sign in to your LifePortal and pick up right where you left off.
          </p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: 'var(--text-primary)' }}>Email</label>
              <input
                className="input-field"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
                autoFocus
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: 'var(--text-primary)' }}>Password</label>
              <input
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <Link to="/forgot-password" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none', fontSize: 12 }}>
                  Forgot password?
                </Link>
              </div>
            </div>

            <LoadingButton type="submit" loading={loading} loadingLabel="Signing in..." className="btn btn-primary" style={{ width: '100%', padding: '12px 18px', fontSize: 15 }}>
              Sign in
            </LoadingButton>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: 13 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Create one</Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, marginTop: 22 }}>
          Your personal life management system
        </p>
      </div>
    </div>
  )
}
