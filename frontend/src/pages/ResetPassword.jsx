import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'
import { LoadingButton } from '../components/common'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { token } = useParams()
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      await api.post(`/auth/reset-password/${token}`, form)
      toast.success('Password reset successfully')
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: 34 }}>
          <div className="auth-mark">*</div>
          <h1 className="hero-title" style={{ margin: 0 }}>Reset password</h1>
          <p className="hero-subtitle" style={{ color: 'var(--text-secondary)', margin: '8px auto 0', fontSize: 14 }}>
            Choose a new password for your LifePortal account.
          </p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: 'var(--text-primary)' }}>New Password</label>
              <input
                className="input-field"
                type="password"
                placeholder="Enter new password"
                value={form.password}
                onChange={event => setForm(prev => ({ ...prev, password: event.target.value }))}
                required
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: 'var(--text-primary)' }}>Confirm Password</label>
              <input
                className="input-field"
                type="password"
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={event => setForm(prev => ({ ...prev, confirmPassword: event.target.value }))}
                required
              />
            </div>

            <LoadingButton type="submit" loading={loading} loadingLabel="Resetting..." className="btn btn-primary" style={{ width: '100%', padding: '12px 18px', fontSize: 15 }}>
              Reset password
            </LoadingButton>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: 13 }}>
            Back to{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
