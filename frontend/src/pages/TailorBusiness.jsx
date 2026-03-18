import { useMemo, useState } from 'react'
import { PageHeader, StatCard } from '../components/common'

const INITIAL_ORDERS = [
  { id: 1, customer: 'Amjad NGA', amount: 1700, rate: 850, suits: 2, expense: 320, task: 'Completed', status: 'Satisfy' },
  { id: 2, customer: 'Mazhar', amount: 500, rate: 500, suits: 1, expense: 130, task: 'Completed', status: 'Satisfy' },
  { id: 3, customer: 'Ali Zain', amount: 1000, rate: 1000, suits: 1, expense: 130, task: 'Completed', status: 'Satisfy' },
  { id: 4, customer: 'Hafiz APS', amount: 1800, rate: 900, suits: 2, expense: 130, task: 'Completed', status: 'Satisfy' },
  { id: 5, customer: 'Azam', amount: 1000, rate: 1000, suits: 1, expense: 250, task: 'Completed', status: 'Satisfy' }
]

export default function TailorBusiness() {
  const [orders] = useState(INITIAL_ORDERS)

  const summary = useMemo(() => {
    const income = orders.reduce((s, o) => s + (o.amount || 0), 0)
    const expenses = orders.reduce((s, o) => s + (o.expense || 0), 0)
    const profit = income - expenses
    return { income, expenses, profit }
  }, [orders])

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Tailor Business"
        subtitle="Manage orders, income, and expenses"
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard icon="💰" label="Total Income" value={summary.income} sub="All orders" />
        <StatCard icon="🧵" label="Total Expenses" value={summary.expenses} sub="Materials + labor" accent="#FEF9E7" />
        <StatCard icon="📈" label="Net Profit" value={summary.profit} sub="Income minus expense" accent="#EAFAF1" />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Orders</div>
        <div className="desktop-only" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                {['Customer', 'Amount', 'Rate', 'Suits', 'Expense', 'Profit', 'Task', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 12, color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>{o.customer}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>{o.amount}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>{o.rate}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>{o.suits}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>{o.expense}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>{(o.amount || 0) - (o.expense || 0)}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>{o.task}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mobile-only" style={{ padding: '16px 20px', display: 'grid', gap: 12 }}>
          {orders.map(o => (
            <div key={o.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: 'var(--surface)' }}>
              <div style={{ fontWeight: 600 }}>{o.customer}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Suits: {o.suits} • Rate: {o.rate}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap', fontSize: 12 }}>
                <span>Amount: {o.amount}</span>
                <span>Expense: {o.expense}</span>
                <span>Profit: {(o.amount || 0) - (o.expense || 0)}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
                {o.task} • {o.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
