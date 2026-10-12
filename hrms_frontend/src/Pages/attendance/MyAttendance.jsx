import { useEffect, useState } from 'react'
import api from '../../services/api'
import { fmtHours, fmtTime, statusClass, statusLabel } from '../../utils/attendance'
import CheckInCard from './CheckInCard'

export default function MyAttendance() {
  const [rows, setRows] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchRows = () => {
    setLoading(true)
    api.get('/attendance/my/', { params: { page } })
      .then((res) => { setRows(res.data.results); setCount(res.data.count) })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchRows()
  }, [page])

  const totalPages = Math.ceil(count / 10)

  return (
    <div>
      <h4 className="mb-0">My Attendance</h4>
      <div className="breadcrumb-muted mb-4">Dashboard / My Attendance</div>

      <CheckInCard onUpdate={fetchRows} />

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr className="text-muted small text-uppercase">
                <th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-4 text-muted">No records yet.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td>{fmtTime(r.check_in)}</td>
                  <td>{fmtTime(r.check_out)}</td>
                  <td>{fmtHours(r.working_hours)}</td>
                  <td><span className={statusClass(r.status)}>{statusLabel(r.status)}</span></td>
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