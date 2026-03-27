import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfile, logout } from '../store/authSlice'
import { setDarkMode } from '../store/uiSlice'
import { PageHeader } from '../components/common'
import toast from 'react-hot-toast'

export default function Profile() {
  const dispatch = useDispatch()
  const { user, loading } = useSelector(s => s.auth)
  const [form, setForm] = useState({ name: '', preferences: { theme: 'light', currency: 'USD', timezone: 'UTC' } })

  useEffect(() => {
    if (user) {
      setForm({ name: user.name, preferences: user.preferences || { theme: 'light', currency: 'USD', timezone: 'UTC' } })
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(updateProfile(form))
    if (!result.error) toast.success('Profile updated!')
    else toast.error(result.payload)
  }

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U'
  const joined = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'

  return (
    <div className="animate-fade-in profile-shell">
      <PageHeader title="Profile" subtitle="Manage your account settings" />

      <div className="card profile-hero" style={{ padding: '28px 32px', marginBottom: 20 }}>
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            background: 'var(--accent-light)',
            border: '3px solid var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--accent)',
            flexShrink: 0
          }}
        >
          {initials}
        </div>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, margin: 0 }}>{user?.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '4px 0 0' }}>{user?.email}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '2px 0 0' }}>Member since {joined}</p>
        </div>
      </div>

      <div className="card" style={{ padding: '28px 32px', marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 400, marginBottom: 20 }}>Edit Profile</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Full Name</label>
            <input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Email</label>
            <input className="input-field" value={user?.email} disabled style={{ background: 'var(--surface-2)', color: 'var(--text-muted)', cursor: 'not-allowed' }} />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Email cannot be changed</p>
          </div>

          <div className="two-col-grid" style={{ marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Theme</label>
              <select
                className="input-field"
                value={form.preferences.theme}
                onChange={e => {
                  const newTheme = e.target.value
                  setForm(p => ({ ...p, preferences: { ...p.preferences, theme: newTheme } }))
                  dispatch(setDarkMode(newTheme === 'dark'))
                }}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Currency</label>
              <select
                className="input-field"
                value={form.preferences.currency}
                onChange={e => setForm(p => ({ ...p, preferences: { ...p.preferences, currency: e.target.value } }))}
              >
                {['USD', 'EUR', 'GBP', 'PKR', 'INR', 'AED', 'SAR'].map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: '24px 32px', borderColor: '#f5c8c3' }}>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 400, marginBottom: 8, color: '#c0392b' }}>Account Actions</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>Sign out of your account on this device.</p>
        <button className="btn btn-danger" onClick={() => dispatch(logout())}>Sign Out</button>
      </div>
    </div>
  )
}
