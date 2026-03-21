import { memo } from 'react'
import { motion } from 'framer-motion'

const hoverLift = {
  whileHover: { y: -4, scale: 1.01 },
  whileTap: { scale: 0.985 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
}

export const StatCard = memo(function StatCard({ icon, label, value, sub, accent }) {
  return (
    <motion.div
      className="card stat-card"
      style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}
      {...hoverLift}
    >
      <div className="stat-card-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="stat-card-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{label}</div>
          <div className="stat-card-value" style={{ fontSize: 30, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
          {sub && <div className="stat-card-sub" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
        </div>
        <motion.div
          className="stat-card-icon"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: accent || 'var(--accent-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            flexShrink: 0
          }}
          whileHover={{ rotate: -4, scale: 1.06 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.div>
      </div>
    </motion.div>
  )
})

export const ProgressBar = memo(function ProgressBar({ value, color = 'var(--accent)', height = 6, showLabel = false }) {
  return (
    <div>
      <div className="progress-bar" style={{ height }}>
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, value || 0)}%` }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          style={{ background: color }}
        />
      </div>
      {showLabel && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, textAlign: 'right' }}>{value || 0}%</div>}
    </div>
  )
})

export const Badge = memo(function Badge({ children, type = 'default', style }) {
  const styles = {
    completed: { background: '#EAFAF1', color: '#1E8449' },
    'in-progress': { background: '#EEF0FD', color: '#5C6BC0' },
    'not-started': { background: '#F2F2F2', color: '#666' },
    pending: { background: '#F2F2F2', color: '#666' },
    paused: { background: '#FEF9E7', color: '#D68910' },
    high: { background: '#FDECEB', color: '#C0392B' },
    medium: { background: '#FDF3E7', color: '#C77B2A' },
    low: { background: '#F2F2F2', color: '#666' },
    Career: { background: '#EEF0FD', color: '#5C6BC0' },
    Health: { background: '#EAFAF1', color: '#1E8449' },
    Finance: { background: '#FDF3E7', color: '#C77B2A' },
    Learning: { background: '#E8F5EE', color: '#2D6A4F' },
    'Personal Growth': { background: '#FEF9E7', color: '#D68910' },
    default: { background: '#F2F2F2', color: '#666' }
  }
  const computedStyle = { ...(styles[type] || styles[children] || styles.default), ...(style || {}) }
  return <span className="badge" style={computedStyle}>{children}</span>
})

export const EmptyState = memo(function EmptyState({ icon, title, description, action }) {
  return (
    <motion.div
      style={{ textAlign: 'center', padding: '60px 24px' }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 400, marginBottom: 8 }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 0, marginBottom: 24, maxWidth: 320, marginInline: 'auto' }}>{description}</p>
      {action && action}
    </motion.div>
  )
})

export const Modal = memo(function Modal({ title, onClose, children, maxWidth = 540 }) {
  return (
    <div className="modal-overlay" onClick={event => { if (event.target === event.currentTarget) onClose() }}>
      <motion.div
        className="card modal-card"
        style={{ width: '100%', maxWidth, maxHeight: '90vh', overflow: 'auto', padding: 0 }}
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
      >
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 className="modal-title" style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 400, margin: 0 }}>{title}</h2>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 18 }}>x</button>
        </div>
        <div className="modal-body" style={{ padding: '24px' }}>{children}</div>
      </motion.div>
    </div>
  )
})

export const LoadingSpinner = memo(function LoadingSpinner({ size = 32, label = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 10, padding: 40 }}>
      <div style={{ width: size, height: size, border: `3px solid rgba(45,106,79,0.15)`, borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      {label && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>}
    </div>
  )
})

export const SkeletonBlock = memo(function SkeletonBlock({ height = 16, width = '100%', radius = 12, style }) {
  return <div className="skeleton-block" style={{ height, width, borderRadius: radius, ...(style || {}) }} />
})

export const PageSkeleton = memo(function PageSkeleton() {
  return (
    <div className="page-skeleton">
      <div className="page-skeleton-header">
        <SkeletonBlock height={14} width={140} radius={999} />
        <SkeletonBlock height={48} width="58%" radius={18} />
        <SkeletonBlock height={14} width="42%" />
      </div>
      <div className="page-skeleton-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card page-skeleton-card">
            <SkeletonBlock height={12} width={96} />
            <SkeletonBlock height={34} width="48%" style={{ marginTop: 12 }} />
            <SkeletonBlock height={12} width="62%" style={{ marginTop: 14 }} />
          </div>
        ))}
      </div>
      <div className="card page-skeleton-panel">
        <SkeletonBlock height={14} width={160} />
        <SkeletonBlock height={12} width="36%" style={{ marginTop: 10 }} />
        <div className="page-skeleton-lines">
          <SkeletonBlock height={12} width="100%" />
          <SkeletonBlock height={12} width="92%" />
          <SkeletonBlock height={12} width="84%" />
        </div>
      </div>
    </div>
  )
})

export const LoadingButton = memo(function LoadingButton({
  loading,
  children,
  loadingLabel = 'Please wait...',
  className = 'btn btn-primary',
  style,
  disabled,
  type = 'button',
  ...props
}) {
  return (
    <motion.button
      type={type}
      className={className}
      style={style}
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

export const PageHeader = memo(function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
      <div>
        <h1 className="page-title" style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, margin: 0, color: 'var(--text-primary)' }}>{title}</h1>
        {subtitle && <p className="page-subtitle" style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>{subtitle}</p>}
      </div>
      {actions && <div className="page-header-actions" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  )
})

export const SelectField = memo(function SelectField({ label, value, onChange, options, style }) {
  return (
    <div style={style}>
      {label && <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{label}</label>}
      <select
        className="input-field"
        value={value}
        onChange={event => onChange(event.target.value)}
        style={{ cursor: 'pointer' }}
      >
        {options.map(option => (
          <option key={option.value ?? option} value={option.value ?? option}>{option.label ?? option}</option>
        ))}
      </select>
    </div>
  )
})
