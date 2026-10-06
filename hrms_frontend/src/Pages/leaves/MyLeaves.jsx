import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { leaveStatusClass, leaveStatusLabel } from '../../utils/leave'

export default function MyLeaves() {
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.split('/leaves')[0]

  const [rows, setRows] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get('/leaves/my/', { params: { page } })
      .then((res) => { setRows(res.data.results); setCount(res.data.count) })
      .finally(() => setLoading(false))
  }, [page])

  const totalPages = Math.ceil(count / 10)

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 className="mb-0">My Leaves</h4>
          <div className="breadcrumb-muted">Dashboard / Leave Management</div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate(`${basePath}/leaves/apply`)}>
          + Apply Leave
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr className="text-muted small text-uppercase">
                <th>Leave Type</th><th>Dates</th><th>Days</th><th>Reason</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-4 text-muted">No leave requests yet.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.leave_type_name}</td>
                  <td>{r.start_date} to {r.end_date}</td>
                  <td>{r.total_days}</td>
                  <td>{r.reason}</td>
                  <td><span className={leaveStatusClass(r.status)}>{leaveStatusLabel(r.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center px-3 py-3 border-top">
            <span className="text-muted small">Page {page} of {totalPages}</span>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <button className="btn btn-sm btn-outline-secondary" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}