import { useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/authSlice'
import { toggleSidebar, setSidebarOpen } from '../store/uiSlice'

const NAV_GROUPS = [
  {
    title: 'Main',
    items: [
      { path: '/', icon: '□', label: 'Dashboard' },
      { path: '/daily-tasks', icon: '✓', label: 'Daily Tasks' },
      { path: '/goals', icon: '🎯', label: 'Life Goals' },
      { path: '/notes', icon: '📝', label: 'Notes' }
    ]
  },
  {
    title: 'Learning',
    items: [
      { path: '/se-hub', icon: '💻', label: 'SE Hub' },
      { path: '/vu-courses', icon: '🎓', label: 'Education' }
    ]
  },
  {
    title: 'Spiritual',
    items: [
      { path: '/namaz-tracker', icon: '🕌', label: 'Namaz Tracker' }
    ]
  },
  {
    title: 'Business',
    items: [
      { path: '/tailor-business', icon: '🧵', label: 'Tailor Business' }
    ]
  },
  {
    title: 'Tools',
    items: [
      { path: '/accounts', icon: '💰', label: 'Accounts' },
      { path: '/passwords', icon: '🔒', label: 'Passwords' },
      { path: '/records', icon: '📦', label: 'Records' },
      { path: '/diary', icon: '📔', label: 'Diary' }
    ]
  },
  {
    title: 'Insights',
    items: [
      { path: '/habits', icon: '🔁', label: 'Habits' },
      { path: '/reports', icon: '📊', label: 'Reports' }
    ]
  }
]

export default function AppLayout() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { sidebarOpen } = useSelector(s => s.ui)
  const location = useLocation()

  useEffect(() => {
    dispatch(setSidebarOpen(false))
  }, [dispatch, location.pathname])

  const initials = user?.name?.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {sidebarOpen && (
        <div
          onClick={() => dispatch(setSidebarOpen(false))}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.24)',
            zIndex: 99,
            backdropFilter: 'blur(5px)'
          }}
        />
      )}

      <aside
        style={{
          width: 260,
          background: 'rgba(255,255,255,0.9)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 100,
          transform: sidebarOpen ? 'translateX(0)' : undefined,
          transition: 'transform 0.25s ease'
        }}
        className="sidebar-el app-sidebar"
      >
        <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid var(--border-soft, #F0EDE6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="app-mark" style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19 }}>
              ✦
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 17, fontWeight: 400, color: 'var(--text-primary)' }}>LifePortal</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: -2 }}>Life Management System</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '14px 12px', overflowY: 'auto' }}>
          {NAV_GROUPS.map(group => (
            <div key={group.title} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '6px 12px 8px' }}>
                {group.title}
              </div>
              {group.items.map(({ path, icon, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  end={path === '/'}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <span style={{ fontSize: 16, width: 22, textAlign: 'center' }}>{icon}</span>
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--accent-light)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0
              }}
            >
              {initials}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Profile</div>
            </div>
          </NavLink>
          <button
            onClick={() => dispatch(logout())}
            className="btn btn-ghost"
            style={{ width: '100%', marginTop: 6, justifyContent: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}
          >
            <span>↩</span> Sign out
          </button>
        </div>
      </aside>

      <div
        style={{
          flex: 1,
          marginLeft: 260,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
        className="main-content"
      >
        <header
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '12px 14px',
            borderBottom: '1px solid rgba(232, 228, 220, 0.9)',
            position: 'sticky',
            top: 0,
            zIndex: 50
          }}
          className="mobile-header glass-topbar"
        >
          <button onClick={() => dispatch(toggleSidebar())} className="mobile-menu-btn" aria-label="Open navigation">
            <span style={{ lineHeight: 1 }}>☰</span>
          </button>
          <div className="mobile-brand">
            <div className="mobile-brand-mark">✦</div>
            <div className="mobile-brand-copy">
              <div className="mobile-brand-title">LifePortal</div>
              <div className="mobile-brand-subtitle">Personal dashboard</div>
            </div>
          </div>
          <div className="mobile-avatar">
            {initials}
          </div>
        </header>

        <main style={{ flex: 1, padding: '32px 32px' }} className="page-main">
          <div className="page-content">
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-el { transform: translateX(-100%); }
          .main-content { margin-left: 0 !important; }
          .mobile-header { display: flex !important; }
          .page-main { padding: 18px 14px 24px !important; }
        }
      `}</style>
    </div>
  )
}
