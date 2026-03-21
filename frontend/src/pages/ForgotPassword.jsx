import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../services/api'
import { LoadingButton } from '../components/common'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)

    try {
      const response = await api.post('/auth/forgot-password', { email })
      const resetUrl = response.data?.resetUrl || ''
      const resetPath = resetUrl ? new URL(resetUrl).pathname : '/login'

      toast.success('Reset link generated successfully')
      navigate(resetPath)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to generate reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-panel animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: 34 }}>
          <div className="auth-mark">*</div>
          <h1 className="hero-title" style={{ margin: 0 }}>Forgot password</h1>
          <p className="hero-subtitle" style={{ color: 'var(--text-secondary)', margin: '8px auto 0', fontSize: 14 }}>
            Enter your email and we&apos;ll generate a password reset link for you.
          </p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6, color: 'var(--text-primary)' }}>Email</label>
              <input
                className="input-field"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={event => setEmail(event.target.value)}
                required
                autoFocus
              />
            </div>

            <LoadingButton type="submit" loading={loading} loadingLabel="Generating..." className="btn btn-primary" style={{ width: '100%', padding: '12px 18px', fontSize: 15 }}>
              Generate reset link
            </LoadingButton>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: 13 }}>
            Remembered your password?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
