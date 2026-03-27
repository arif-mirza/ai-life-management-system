import { memo, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'

const hoverLift = {
  whileHover: { y: -4, scale: 1.01 },
  whileTap: { scale: 0.985 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
}

// ── Page Loader ──────────────────────────────────────────────────
export const PageLoader = memo(function PageLoader() {
  return (
    <div className="page-loader-overlay">
      <div className="page-loader-logo">✦</div>
      <div>
        <div className="page-loader-brand">LifePortal</div>
        <div className="page-loader-sub">Life Management System</div>
      </div>
      <div className="page-loader-dots">
        <div className="page-loader-dot" />
        <div className="page-loader-dot" />
        <div className="page-loader-dot" />
      </div>
    </div>
  )
})

// ── Top Progress Bar ─────────────────────────────────────────────
export const TopProgressBar = memo(function TopProgressBar() {
  const loadingStates = useSelector(s => [
    s.dailyTasks?.loading,
    s.namaz?.loading,
    s.dashboard?.loading,
    s.goals?.loading,
    s.habits?.loading,
    s.notes?.loading,
    s.passwords?.loading,
  ])
  const isLoading = loadingStates.some(Boolean)
  const [visible, setVisible] = useState(false)
  const [done, setDone] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (isLoading) {
      setDone(false)
      setVisible(true)
    } else if (visible) {
      setDone(true)
      timerRef.current = setTimeout(() => setVisible(false), 600)
    }
    return () => clearTimeout(timerRef.current)
  }, [isLoading, visible])

  if (!visible) return null
  return <div className={`top-progress-bar${done ? ' done' : ''}`} />
})

// ── StatCard ─────────────────────────────────────────────────────
export const StatCard = memo(function StatCard({ icon, label, value, sub, accent }) {
  return (
    <motion.div
      className="card stat-card"
      style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}
      {...hoverLift}
    >
      <div className="stat-card-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="stat-card-label" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
          <div className="stat-card-value" style={{ fontSize: 30, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
          {sub && <div className="stat-card-sub" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>{sub}</div>}
        </div>
        <motion.div
          className="stat-card-icon"
          style={{ width: 46, height: 46, borderRadius: 14, background: accent || 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}
          whileHover={{ rotate: -6, scale: 1.08 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.div>
      </div>
    </motion.div>
  )
})

// ── ProgressBar ──────────────────────────────────────────────────
export const ProgressBar = memo(function ProgressBar({ value, color = 'var(--accent)', height = 6, showLabel = false }) {
  return (
    <div>
      <div className="progress-bar" style={{ height }}>
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, value || 0)}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ background: color }}
        />
      </div>
      {showLabel && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>{value || 0}%</div>}
    </div>
  )
})

// ── PrayerRing (SVG circular progress) ───────────────────────────
export const PrayerRing = memo(function PrayerRing({ value = 0, size = 64, strokeWidth = 6, color = 'var(--accent)' }) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(100, value) / 100) * circ
  return (
    <div className="prayer-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="prayer-ring-label">{value}%</div>
    </div>
  )
})

// ── SecurityBadge ─────────────────────────────────────────────────
export const SecurityBadge = memo(function SecurityBadge({ message = 'AES-256 Encrypted — Your passwords are stored securely' }) {
  return (
    <div className="security-badge">
      <span className="security-badge-icon">🔐</span>
      <span>{message}</span>
    </div>
  )
})

// ── PasswordStrength ──────────────────────────────────────────────
export const PasswordStrength = memo(function PasswordStrength({ password }) {
  const getStrength = (pw) => {
    if (!pw) return { score: 0, label: '', color: '' }
    let score = 0
    if (pw.length >= 8) score++
    if (pw.length >= 12) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    if (score <= 1) return { score, label: 'Weak', color: '#e53e3e', pct: 20 }
    if (score === 2) return { score, label: 'Fair', color: '#dd6b20', pct: 40 }
    if (score === 3) return { score, label: 'Good', color: '#d69e2e', pct: 60 }
    if (score === 4) return { score, label: 'Strong', color: '#38a169', pct: 80 }
    return { score, label: 'Very Strong', color: '#276749', pct: 100 }
  }
  const { label, color, pct } = getStrength(password)
  if (!password) return null
  return (
    <div style={{ marginTop: 6 }}>
      <div className="pw-strength-track">
        <motion.div
          className="pw-strength-fill"
          animate={{ width: `${pct}%`, background: color }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <div style={{ fontSize: 11, color, marginTop: 4, fontWeight: 600 }}>{label}</div>
    </div>
  )
})

// ── Badge ─────────────────────────────────────────────────────────
export const Badge = memo(function Badge({ children, type = 'default', style }) {
  const styles = {
    completed:      { background: '#e6f6ed', color: '#1a6b42' },
    'in-progress':  { background: '#edf0fc', color: '#4a57b5' },
    'not-started':  { background: '#f5f5f5', color: '#666' },
    pending:        { background: '#f5f5f5', color: '#666' },
    paused:         { background: '#fef8e8', color: '#c47c10' },
    high:           { background: '#fce8e6', color: '#b83225' },
    medium:         { background: '#fdf3e6', color: '#b86810' },
    low:            { background: '#f5f5f5', color: '#666' },
    Career:         { background: '#edf0fc', color: '#4a57b5' },
    Health:         { background: '#e6f6ed', color: '#1a6b42' },
    Finance:        { background: '#fdf3e6', color: '#b86810' },
    Learning:       { background: '#e6f2ec', color: '#1f5c42' },
    'Personal Growth': { background: '#fef8e8', color: '#c47c10' },
    default:        { background: '#f5f5f5', color: '#666' },
  }
  const computedStyle = { ...(styles[type] || styles[children] || styles.default), ...(style || {}) }
  return <span className="badge" style={computedStyle}>{children}</span>
})

// ── EmptyState ────────────────────────────────────────────────────
export const EmptyState = memo(function EmptyState({ icon, title, description, action }) {
  return (
    <motion.div
      style={{ textAlign: 'center', padding: '56px 24px' }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ fontSize: 52, marginBottom: 18, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, marginBottom: 10 }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28, maxWidth: 340, marginInline: 'auto' }}>{description}</p>
      {action && action}
    </motion.div>
  )
})

// ── Modal ─────────────────────────────────────────────────────────
export const Modal = memo(function Modal({ title, onClose, children, maxWidth = 540 }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const modalContent = (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div
        className="modal-card"
        style={{ width: '100%', maxWidth }}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Close modal">×</button>
        </div>
        <div className="modal-body">{children}</div>
      </motion.div>
    </div>
  )

  return createPortal(modalContent, document.body)
})

// ── LoadingSpinner ────────────────────────────────────────────────
export const LoadingSpinner = memo(function LoadingSpinner({ size = 48, label = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 16, padding: 48 }}>
      <div className="spinner-dual" style={{ width: size, height: size }} />
      {label && <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>}
    </div>
  )
})

// ── SkeletonBlock ─────────────────────────────────────────────────
export const SkeletonBlock = memo(function SkeletonBlock({ height = 16, width = '100%', radius = 12, style }) {
  return <div className="skeleton-block" style={{ height, width, borderRadius: radius, ...(style || {}) }} />
})

// ── PageSkeleton ──────────────────────────────────────────────────
export const PageSkeleton = memo(function PageSkeleton() {
  return (
    <div className="page-skeleton">
      <div className="page-skeleton-header">
        <SkeletonBlock height={13} width={140} radius={999} />
        <SkeletonBlock height={50} width="56%" radius={18} />
        <SkeletonBlock height={13} width="40%" />
      </div>
      <div className="page-skeleton-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card page-skeleton-card">
            <SkeletonBlock height={11} width={96} />
            <SkeletonBlock height={36} width="48%" style={{ marginTop: 12 }} />
            <SkeletonBlock height={11} width="62%" style={{ marginTop: 14 }} />
          </div>
        ))}
      </div>
      <div className="card page-skeleton-panel">
        <SkeletonBlock height={13} width={160} />
        <SkeletonBlock height={11} width="35%" style={{ marginTop: 10 }} />
        <div className="page-skeleton-lines">
          <SkeletonBlock height={11} width="100%" />
          <SkeletonBlock height={11} width="92%" />
          <SkeletonBlock height={11} width="84%" />
        </div>
      </div>
    </div>
  )
})

// ── LoadingButton ─────────────────────────────────────────────────
export const LoadingButton = memo(function LoadingButton({ loading, children, loadingLabel = 'Saving...', className = 'btn btn-primary', style, disabled, type = 'button', ...props }) {
  return (
    <motion.button
      type={type} className={className} style={style}
      disabled={loading || disabled}
      whileHover={!loading && !disabled ? { y: -1, scale: 1.01 } : {}}
      whileTap={!loading && !disabled ? { scale: 0.985 } : {}}
      transition={{ duration: 0.18 }}
      {...props}
    >
      {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> {loadingLabel}</> : children}
    </motion.button>
  )
})

// ── PageHeader ────────────────────────────────────────────────────
export const PageHeader = memo(function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
      <div>
        <h1 className="page-title" style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 400, margin: 0, color: 'var(--text-primary)' }}>{title}</h1>
        {subtitle && <p className="page-subtitle" style={{ color: 'var(--text-secondary)', marginTop: 5, fontSize: 14 }}>{subtitle}</p>}
      </div>
      {actions && <div className="page-header-actions" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  )
})

// ── SelectField ───────────────────────────────────────────────────
export const SelectField = memo(function SelectField({ label, value, onChange, options, style }) {
  return (
    <div style={style}>
      {label && <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 7, color: 'var(--text-primary)' }}>{label}</label>}
      <select className="input-field" value={value} onChange={e => onChange(e.target.value)} style={{ cursor: 'pointer' }}>
        {options.map(opt => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>{opt.label ?? opt}</option>
        ))}
      </select>
    </div>
  )
})
