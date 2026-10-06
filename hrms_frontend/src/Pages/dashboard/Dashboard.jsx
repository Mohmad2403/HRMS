import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import CheckInCard from '../attendance/CheckInCard'
import LeaveBalanceCard from '../leaves/LeaveBalanceCard'
import AdminDashboard from './AdminDashboard'

function PerformanceSummaryCard() {
  const [latest, setLatest] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/performance/my/')
      .then((res) => {
        const rows = res.data.results || res.data
        setLatest(rows[0] || null)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null

  return (
    <div className="card border-0 shadow-sm p-4 mb-4">
      <div className="d-flex align-items-start gap-3">
        <div className="eval-icon" style={{ background: '#fff6e5' }}>⭐</div>
        <div className="flex-grow-1">
          <h6 className="mb-0 fw-bold">Latest Performance</h6>
          {latest ? (
            <>
              <div className="text-muted small">{latest.period}</div>
              <div className="d-flex align-items-center gap-2 mt-2">
                <span className="fs-4 fw-bold text-primary">{latest.overall_rating}</span>
                <span className="text-muted">/ 5 overall</span>
              </div>
            </>
          ) : (
            <div className="text-muted small mt-1">No reviews yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()

  if (user.role === 'admin' || user.role === 'hr') {
    return <AdminDashboard />
  }

  return (
    <div>
      <h4 className="mb-4">Welcome, {user.first_name || user.username}</h4>
      <LeaveBalanceCard />
      <PerformanceSummaryCard />
      <CheckInCard />
    </div>
  )
}