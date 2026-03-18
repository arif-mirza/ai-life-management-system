import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal, PageHeader, StatCard, ProgressBar, Badge, LoadingSpinner } from '../components/common'
import {
  fetchAccounts,
  createAccount,
  updateAccount,
  deleteAccount
} from '../store/accountsSlice'

const TYPE_OPTIONS = [
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' }
]

const CATEGORY_OPTIONS = ['Salary', 'Business', 'Freelance', 'Education', 'Health', 'Family', 'Bills', 'Travel', 'Savings', 'Other']

const EMPTY_FORM = {
  type: 'income',
  category: 'Salary',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  note: ''
}

const formatCurrency = (value) => {
  const num = Number(value) || 0
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

const formatDate = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Accounts() {
  const dispatch = useDispatch()
  const { items, loading } = useSelector(s => s.accounts)

  const [showModal, setShowModal] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => { dispatch(fetchAccounts()) }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter(item => {
      const matchesType = typeFilter === 'all' ? true : item.type === typeFilter
      const matchesSearch = q
        ? (item.category || '').toLowerCase().includes(q) || (item.note || '').toLowerCase().includes(q)
        : true
      return matchesType && matchesSearch
    })
  }, [items, search, typeFilter])

  const summary = useMemo(() => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()
    const totals = items.reduce((acc, item) => {
      const amount = Number(item.amount) || 0
      if (item.type === 'income') acc.totalIncome += amount
      else acc.totalExpense += amount
      const d = new Date(item.date)
      if (d.getMonth() === month && d.getFullYear() === year) {
        if (item.type === 'income') acc.monthIncome += amount
        else acc.monthExpense += amount
      }
      return acc
    }, { totalIncome: 0, totalExpense: 0, monthIncome: 0, monthExpense: 0 })
    return {
      ...totals,
      net: totals.totalIncome - totals.totalExpense,
      monthNet: totals.monthIncome - totals.monthExpense
    }
  }, [items])

  const openCreate = () => {
    setEditEntry(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (entry) => {
    setEditEntry(entry)
    setForm({
      type: entry.type,
      category: entry.category || 'Other',
      amount: entry.amount ?? '',
      date: entry.date ? entry.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      note: entry.note || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount) return
    const payload = {
      type: form.type,
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
      note: form.note
    }
    if (editEntry) {
      await dispatch(updateAccount({ id: editEntry._id, data: payload }))
    } else {
      await dispatch(createAccount(payload))
    }
    setShowModal(false)
  }

  const handleDelete = async (id) => {
    await dispatch(deleteAccount(id))
    setDeleteConfirm(null)
  }

  if (loading && items.length === 0) return <LoadingSpinner size={40} />

  const progress = summary.totalIncome > 0
    ? Math.min(100, Math.round((summary.totalExpense / summary.totalIncome) * 100))
    : 0

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Accounts"
        subtitle="Track income, expenses, and your net balance"
        actions={<button className="btn btn-primary" onClick={openCreate}>+ Add Entry</button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
        <StatCard icon="💰" label="Total Income" value={formatCurrency(summary.totalIncome)} sub="All time" />
        <StatCard icon="💸" label="Total Expenses" value={formatCurrency(summary.totalExpense)} sub="All time" accent="#FDF3E7" />
        <StatCard icon="🧾" label="Net Balance" value={formatCurrency(summary.net)} sub="Income - expenses" accent="#EEF0FD" />
        <StatCard icon="📅" label="This Month" value={formatCurrency(summary.monthNet)} sub="Net this month" accent="#EAFAF1" />
      </div>

      <div className="card" style={{ padding: '16px 20px', marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontWeight: 600 }}>Expense Ratio</div>
          <div style={{ fontWeight: 700, color: 'var(--accent)' }}>{progress}%</div>
        </div>
        <ProgressBar value={progress} color="#C77B2A" />
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
          {formatCurrency(summary.totalExpense)} spent from {formatCurrency(summary.totalIncome)} earned
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <input
          className="input-field"
          placeholder="Search category or note..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: '1 1 240px' }}
        />
        <select
          className="input-field"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{ width: 160 }}
        >
          <option value="all">All Types</option>
          {TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
          No account entries yet. Add your first income or expense.
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Transactions</div>
          <div className="desktop-only" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead>
                <tr style={{ background: 'var(--surface-2)' }}>
                  {['Type', 'Category', 'Amount', 'Date', 'Note', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 12, color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(entry => (
                  <tr key={entry._id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>
                      <Badge type={entry.type === 'income' ? 'completed' : 'paused'}>
                        {entry.type === 'income' ? 'Income' : 'Expense'}
                      </Badge>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>{entry.category || 'General'}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: entry.type === 'income' ? '#1E8449' : '#C0392B' }}>
                      {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 12 }}>{formatDate(entry.date)}</td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-secondary)' }}>{entry.note || '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-ghost" style={{ padding: '4px 10px' }} onClick={() => openEdit(entry)}>Edit</button>
                        <button className="btn btn-danger" style={{ padding: '4px 10px' }} onClick={() => setDeleteConfirm(entry._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mobile-only" style={{ padding: '16px 20px', display: 'grid', gap: 12 }}>
            {filtered.map(entry => (
              <div key={entry._id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <Badge type={entry.type === 'income' ? 'completed' : 'paused'}>
                    {entry.type === 'income' ? 'Income' : 'Expense'}
                  </Badge>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatDate(entry.date)}</div>
                </div>
                <div style={{ fontWeight: 600, marginTop: 6 }}>{entry.category || 'General'}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: entry.type === 'income' ? '#1E8449' : '#C0392B', marginTop: 4 }}>
                  {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>{entry.note || '—'}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button className="btn btn-ghost" style={{ padding: '4px 10px' }} onClick={() => openEdit(entry)}>Edit</button>
                  <button className="btn btn-danger" style={{ padding: '4px 10px' }} onClick={() => setDeleteConfirm(entry._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {deleteConfirm && (
        <Modal title="Delete Entry?" onClose={() => setDeleteConfirm(null)} maxWidth={380}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>This will permanently delete the entry.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
          </div>
        </Modal>
      )}

      {showModal && (
        <Modal title={editEntry ? 'Edit Entry' : 'Add Entry'} onClose={() => setShowModal(false)} maxWidth={560}>
          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Type</label>
                <select className="input-field" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  {TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Category</label>
                <select className="input-field" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORY_OPTIONS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Amount</label>
                <input type="number" className="input-field" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Date</label>
                <input type="date" className="input-field" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: 13, marginBottom: 6 }}>Note</label>
                <textarea className="input-field" rows={3} value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editEntry ? 'Save Changes' : 'Save Entry'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
