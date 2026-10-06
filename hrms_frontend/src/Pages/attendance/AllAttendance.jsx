import { useEffect, useState } from 'react'
import api from '../../services/api'
import { fmtHours, fmtTime, statusClass, statusLabel } from '../../utils/attendance'

export default function AllAttendance() {
  const [rows, setRows] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = { page }
    if (date) params.date = date
    if (status) params.status = status
    api.get('/attendance/', { params })
      .then((res) => { setRows(res.data.results); setCount(res.data.count) })
      .finally(() => setLoading(false))
  }, [page, date, status])

  const totalPages = Math.ceil(count / 10)

  return (
    <div>
      <h4 className="mb-0">Attendance</h4>
      <div className="breadcrumb-muted mb-4">Dashboard / Attendance</div>

      <div className="d-flex gap-2 mb-3">
        <input
          type="date"
          className="form-control"
          style={{ maxWidth: 180 }}
          value={date}
          onChange={(e) => { setPage(1); setDate(e.target.value) }}
        />
        <select
          className="form-select"
          style={{ maxWidth: 180 }}
          value={status}
          onChange={(e) => { setPage(1); setStatus(e.target.value) }}
        >
          <option value="">All statuses</option>
          <option value="present">Present</option>
          <option value="late">Late</option>
          <option value="half_day">Half Day</option>
          <option value="absent">Absent</option>
          <option value="leave">Leave</option>
        </select>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr className="text-muted small text-uppercase">
                <th>Employee</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4 text-muted">No records found.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{r.employee_name || r.employee_code}</div>
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>{r.employee_code}</div>
                  </td>
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
            <span className="text-muted small">Page {page} of {totalPages} ({count} total)</span>
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