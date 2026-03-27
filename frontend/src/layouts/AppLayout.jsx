import { useCallback, useEffect, useMemo } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import { logout } from '../store/authSlice'
import { toggleSidebar, setSidebarOpen, setDarkMode } from '../store/uiSlice'

const NAV_GROUPS = [
  {
    title: 'Main',
    items: [
      { path: '/',            icon: '⊞',  label: 'Dashboard' },
      { path: '/daily-tasks', icon: '✓',  label: 'Daily Tasks' },
      { path: '/goals',       icon: '◎',  label: 'Life Goals' },
      { path: '/notes',       icon: '✎',  label: 'Notes' }
    ]
  },
  {
    title: 'Learning',
    items: [
      { path: '/se-hub',     icon: 'SE', label: 'SE Hub' },
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
    title: 'Tools',
    items: [
      { path: '/accounts',  icon: '💳', label: 'Accounts' },
      { path: '/passwords', icon: '🔐', label: 'Passwords' },
      { path: '/records',   icon: '📋', label: 'Records' },
      { path: '/diary',     icon: '📔', label: 'Diary' }
    ]
  },
  {
    title: 'Insights',
    items: [
      { path: '/habits',  icon: '🔄', label: 'Habits' },
      { path: '/reports', icon: '📊', label: 'Reports' }
    ]
  }
]

export default function AppLayout() {
  const dispatch = useDispatch()
  const { user } = useSelector(s => s.auth)
  const { sidebarOpen, darkMode } = useSelector(s => s.ui)
  const location = useLocation()

  useEffect(() => { dispatch(setSidebarOpen(false)) }, [dispatch, location.pathname])

  // Sync dark mode class on <html>
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [darkMode])

  // Sync initial theme from profile
  useEffect(() => {
    if (user?.preferences?.theme) {
      dispatch(setDarkMode(user.preferences.theme === 'dark'))
    }
  }, [dispatch, user?.preferences?.theme])

  const closeSidebar = useCallback(() => dispatch(setSidebarOpen(false)), [dispatch])
  const handleToggle = useCallback(() => dispatch(toggleSidebar()), [dispatch])
  const handleLogout = useCallback(() => dispatch(logout()), [dispatch])

  const initials = useMemo(
    () => user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U',
    [user?.name]
  )

  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Overlay */}
      {sidebarOpen && (
        <div onClick={closeSidebar} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.26)', zIndex: 99, backdropFilter: 'blur(6px)' }} />
      )}

      {/* ── Sidebar ── */}
      <aside
        className="sidebar-el app-sidebar"
        style={{
          width: 264,
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          position: 'fixed', top: 0, left: 0, height: '100vh',
          zIndex: 100,
          transform: sidebarOpen ? 'translateX(0)' : undefined,
          transition: 'transform 0.26s cubic-bezier(0.22,1,0.36,1)'
        }}
      >
        {/* Brand */}
        <div style={{ padding: '22px 20px 16px', borderBottom: '1px solid var(--border-soft, #ede7d8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="app-mark" style={{ width: 42, height: 42, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontFamily: 'var(--font-serif)', flexShrink: 0 }}>
              ✦
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>LifePortal</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1, letterSpacing: '0.05em' }}>Life Management System</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {NAV_GROUPS.map(group => (
            <div key={group.title} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '6px 12px 6px' }}>
                {group.title}
              </div>
              {group.items.map(({ path, icon, label }) => (
                <NavLink
                  key={path} to={path} end={path === '/'}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                >
                  <span style={{ fontSize: 15, width: 24, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontSize: 13 }}>{label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 10px 16px', borderTop: '1px solid var(--border)' }}>
          <NavLink to="/profile" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0, border: '2px solid rgba(31,92,66,0.12)' }}>
              {initials}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>My Profile</div>
            </div>
          </NavLink>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ width: '100%', marginTop: 2, justifyContent: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-muted)', minHeight: 36 }}>
            <span>←</span> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="main-content" style={{ flex: 1, marginLeft: 264, minWidth: 0, minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
        {/* Mobile topbar */}
        <header className="mobile-header glass-topbar" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 14px', borderBottom: '1px solid rgba(226,217,200,0.9)', position: 'sticky', top: 0, zIndex: 50 }}>
          <button onClick={handleToggle} className="mobile-menu-btn" aria-label="Open navigation">
            <span style={{ lineHeight: 1, fontSize: 20 }}>☰</span>
          </button>
          <div className="mobile-brand">
            <div className="mobile-brand-mark" style={{ fontFamily: 'var(--font-serif)' }}>✦</div>
            <div className="mobile-brand-copy">
              <div className="mobile-brand-title">LifePortal</div>
              <div className="mobile-brand-subtitle">Personal dashboard</div>
            </div>
          </div>
          <div className="mobile-avatar">{initials}</div>
        </header>

        <main className="page-main" style={{ flex: 1, minWidth: 0, overflowX: 'hidden', padding: '32px 32px' }}>
          <div className="page-content">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                className="route-motion-shell"
                initial={{ opacity: 0, y: 16, filter: 'blur(5px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-el { transform: translateX(-100%); }
          .main-content { margin-left: 0 !important; }
          .mobile-header { display: flex !important; }
          .page-main { padding: 18px 14px 28px !important; }
        }
      `}</style>
    </div>
  )
}
