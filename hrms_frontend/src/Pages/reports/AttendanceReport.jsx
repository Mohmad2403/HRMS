import { useEffect, useState } from 'react'
import api from '../../services/api'

const STATUS_COLORS = {
  present: '#198754', late: '#fd7e14', absent: '#dc3545', leave: '#6c757d', half_day: '#0dcaf0',
}

const toCSV = (rows) => {
  const headers = ['Employee ID', 'Name', 'Present', 'Late', 'Half Day', 'Leave', 'Absent']
  const lines = rows.map((r) => [
    r.employee__employee_id,
    r.employee__user__first_name || r.employee__user__username,
    r.present, r.late, r.half_day, r.leave, r.absent,
  ].join(','))
  return [headers.join(','), ...lines].join('\n')
}

const downloadCSV = (csv, filename) => {
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function AttendanceReport() {
  const [byStatus, setByStatus] = useState([])
  const [byEmployee, setByEmployee] = useState([])
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    const params = {}
    if (from) params.from = from
    if (to) params.to = to
    api.get('/attendance/report/', { params })
      .then((res) => { setByStatus(res.data.by_status); setByEmployee(res.data.by_employee) })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const totalDays = byStatus.reduce((sum, s) => sum + s.count, 0)

  return (
    <div>
      <h4 className="mb-0">Attendance Report</h4>
      <div className="breadcrumb-muted mb-4">Dashboard / Reports / Attendance</div>

      <div className="card border-0 shadow-sm p-4 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label small">From</label>
            <input type="date" className="form-control" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label small">To</label>
            <input type="date" className="form-control" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="col-md-3">
            <button className="btn btn-primary" onClick={load}>Apply Filter</button>
          </div>
          <div className="col-md-3 text-md-end">
            <button
              className="btn btn-outline-secondary"
              disabled={byEmployee.length === 0}
              onClick={() => downloadCSV(toCSV(byEmployee), `attendance_report_${from || 'all'}_${to || 'all'}.csv`)}
            >
              ⬇ Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Status summary chips */}
      <div className="row g-3 mb-4">
        {byStatus.map((s) => (
          <div className="col-md-2" key={s.status}>
            <div className="card border-0 shadow-sm p-3 text-center">
              <div style={{ color: STATUS_COLORS[s.status] || '#333', fontWeight: 700, fontSize: '1.5rem' }}>
                {s.count}
              </div>
              <div className="text-muted small text-capitalize">{s.status.replace('_', ' ')}</div>
            </div>
          </div>
        ))}
        {totalDays > 0 && (
          <div className="col-md-2">
            <div className="card border-0 shadow-sm p-3 text-center bg-light">
              <div className="fw-bold fs-5">{totalDays}</div>
              <div className="text-muted small">Total Records</div>
            </div>
          </div>
        )}
      </div>

      {/* Per-employee table */}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr className="text-muted small text-uppercase">
                <th>Employee</th><th>Present</th><th>Late</th><th>Half Day</th><th>Leave</th><th>Absent</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
              ) : byEmployee.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4 text-muted">No data for this range.</td></tr>
              ) : byEmployee.map((r) => (
                <tr key={r.employee__employee_id}>
                  <td>
                    <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                      {r.employee__user__first_name || r.employee__user__username}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>{r.employee__employee_id}</div>
                  </td>
                  <td>{r.present}</td>
                  <td>{r.late}</td>
                  <td>{r.half_day}</td>
                  <td>{r.leave}</td>
                  <td>{r.absent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}