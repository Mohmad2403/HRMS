import { useEffect, useState } from 'react'
import api from '../../services/api'
import { overallBadge, ratingStars } from '../../utils/performance'

const periodRange = (period) => {
  const match = period.match(/Q([1-4])/)
  if (!match) return ''
  const ranges = { 1: 'Jan - Mar', 2: 'Apr - Jun', 3: 'Jul - Sep', 4: 'Oct - Dec' }
  return ranges[match[1]] || ''
}

export default function MyPerformance() {
  const [allRows, setAllRows] = useState([])
  const [rows, setRows] = useState([])
  const [periodFilter, setPeriodFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/performance/my/')
      .then((res) => {
        const data = res.data.results || res.data
        setAllRows(data)
        setRows(data)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleFilter = (e) => {
    const value = e.target.value
    setPeriodFilter(value)
    setRows(value ? allRows.filter((r) => r.period === value) : allRows)
  }

  const periods = [...new Set(allRows.map((r) => r.period))]

  const overallAvg = allRows.length
    ? (allRows.reduce((sum, r) => sum + r.overall_rating, 0) / allRows.length).toFixed(1)
    : null

  const latestPeriod = allRows[0]?.period

  return (
    <div>
      <h4 className="mb-0">My Performance</h4>
      <div className="breadcrumb-muted mb-4">Dashboard / Performance / My Performance</div>

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3 d-flex flex-row align-items-center gap-3">
            <div className="eval-icon" style={{ background: '#e7f0ff' }}>⭐</div>
            <div>
              <div className="text-muted small">Overall Rating</div>
              <div className="fs-4 fw-bold">{overallAvg ?? '—'} {overallAvg && '/ 5'}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3 d-flex flex-row align-items-center gap-3">
            <div className="eval-icon" style={{ background: '#e7faf0' }}>📊</div>
            <div>
              <div className="text-muted small">Total Reviews</div>
              <div className="fs-4 fw-bold">{allRows.length}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3 d-flex flex-row align-items-center gap-3">
            <div className="eval-icon" style={{ background: '#f3ecff' }}>📅</div>
            <div>
              <div className="text-muted small">Latest Period</div>
              <div className="fs-4 fw-bold">{latestPeriod || '—'}</div>
              {latestPeriod && <div className="text-muted small">{periodRange(latestPeriod)}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews table */}
      <div className="card border-0 shadow-sm p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-start gap-3">
            <div className="eval-icon" style={{ background: '#e7f0ff' }}>📄</div>
            <div>
              <h6 className="mb-0 fw-bold">Performance Reviews</h6>
              <div className="text-muted small">View your past performance reviews and ratings.</div>
            </div>
          </div>
          <select className="form-select" style={{ maxWidth: 180 }} value={periodFilter} onChange={handleFilter}>
            <option value="">All Periods</option>
            {periods.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr className="text-muted small text-uppercase">
                <th>Period</th><th>Technical</th><th>Communication</th><th>Teamwork</th><th>Problem Solving</th><th>Overall</th><th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4 text-muted">No reviews yet.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="fw-semibold">{r.period}</div>
                    <div className="text-muted small">{periodRange(r.period)}</div>
                  </td>
                  <td>
                    <span className="text-warning">{ratingStars(r.technical_skills)}</span>{' '}
                    <span className="text-muted small">{r.technical_skills.toFixed(1)}</span>
                  </td>
                  <td>
                    <span className="text-warning">{ratingStars(r.communication)}</span>{' '}
                    <span className="text-muted small">{r.communication.toFixed(1)}</span>
                  </td>
                  <td>
                    <span className="text-warning">{ratingStars(r.teamwork)}</span>{' '}
                    <span className="text-muted small">{r.teamwork.toFixed(1)}</span>
                  </td>
                  <td>
                    <span className="text-warning">{ratingStars(r.problem_solving)}</span>{' '}
                    <span className="text-muted small">{r.problem_solving.toFixed(1)}</span>
                  </td>
                  <td><span className={`badge rounded-pill ${overallBadge(r.overall_rating)}`}>{r.overall_rating}</span></td>
                  <td className="text-muted" style={{ fontSize: '0.85rem', maxWidth: 220 }}>{r.comments || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && rows.length > 0 && (
          <div className="text-muted small mt-2">Showing {rows.length} of {allRows.length} reviews</div>
        )}
      </div>
    </div>
  )
}