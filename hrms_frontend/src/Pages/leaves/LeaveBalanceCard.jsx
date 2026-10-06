import { useEffect, useState } from 'react'
import api from '../../services/api'

export default function LeaveBalanceCard() {
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/leaves/balance/')
      .then((res) => setBalances(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null

  return (
    <div className="card border-0 shadow-sm p-4 mb-4">
      <h6 className="text-muted text-uppercase small mb-3">Leave Balance</h6>
      <div className="row g-3">
        {balances.map((b) => (
          <div className="col-md-4" key={b.leave_type}>
            <div className="border rounded p-3">
              <div className="text-muted small">{b.name}</div>
              <div className="fs-4 fw-bold">{b.remaining}</div>
              <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                {b.used} used of {b.total}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}