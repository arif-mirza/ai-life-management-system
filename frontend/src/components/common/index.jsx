export function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div
      className="card stat-card"
      style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 8, transition: 'transform 0.2s ease' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div className="stat-card-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="stat-card-label" style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>{label}</div>
          <div className="stat-card-value" style={{ fontSize: 30, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
          {sub && <div className="stat-card-sub" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
        </div>
        <div
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
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

export function ProgressBar({ value, color = 'var(--accent)', height = 6, showLabel = false }) {
  return (
    <div>
      <div className="progress-bar" style={{ height }}>
        <div className="progress-fill" style={{ width: `${Math.min(100, value || 0)}%`, background: color }} />
      </div>
      {showLabel && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, textAlign: 'right' }}>{value || 0}%</div>}
    </div>
  )
}

export function Badge({ children, type = 'default', style }) {
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
  const s = { ...(styles[type] || styles[children] || styles.default), ...(style || {}) }
  return <span className="badge" style={s}>{children}</span>
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 400, marginBottom: 8 }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 0, marginBottom: 24, maxWidth: 320, marginInline: 'auto' }}>{description}</p>
      {action && action}
    </div>
  )
}

export function Modal({ title, onClose, children, maxWidth = 540 }) {
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="card modal-card" style={{ width: '100%', maxWidth, maxHeight: '90vh', overflow: 'auto', padding: 0 }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 className="modal-title" style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 400, margin: 0 }}>{title}</h2>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 18 }}>x</button>
        </div>
        <div className="modal-body" style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  )
}

export function LoadingSpinner({ size = 32 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
      <div style={{ width: size, height: size, border: `3px solid rgba(45,106,79,0.15)`, borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, gap: 16, flexWrap: 'wrap' }}>
      <div>
        <h1 className="page-title" style={{ fontFamily: 'var(--font-serif)', fontSize: 26, fontWeight: 400, margin: 0, color: 'var(--text-primary)' }}>{title}</h1>
        {subtitle && <p className="page-subtitle" style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>{subtitle}</p>}
      </div>
      {actions && <div className="page-header-actions" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  )
}

export function SelectField({ label, value, onChange, options, style }) {
  return (
    <div style={style}>
      {label && <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{label}</label>}
      <select
        className="input-field"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ cursor: 'pointer' }}
      >
        {options.map(opt => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>{opt.label ?? opt}</option>
        ))}
      </select>
    </div>
  )
}
