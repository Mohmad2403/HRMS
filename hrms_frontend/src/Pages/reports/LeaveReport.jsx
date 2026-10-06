import { useEffect, useState } from 'react'
import api from '../../services/api'

const toCSV = (rows) => {
  const headers = ['Employee ID', 'Name', 'Pending', 'Approved', 'Rejected', 'Total Requests']
  const lines = rows.map((r) => [
    r.employee__employee_id,
    r.employee__user__first_name || r.employee__user__username,
    r.pending, r.approved, r.rejected, r.total_requests,
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

const STATUS_COLORS = { approved: '#198754', rejected: '#dc3545', pending: '#fd7e14' }

export default function LeaveReport() {
  const [byStatus, setByStatus] = useState([])
  const [byType, setByType] = useState([])
  const [byEmployee, setByEmployee] = useState([])
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    api.get('/leaves/report/', { params: { year } })
      .then((res) => {
        setByStatus(res.data.by_status)
        setByType(res.data.by_type)
        setByEmployee(res.data.by_employee)
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  return (
    <div>
      <h4 className="mb-0">Leave Report</h4>
      <div className="breadcrumb-muted mb-4">Dashboard / Reports / Leave</div>

      <div className="card border-0 shadow-sm p-4 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label small">Year</label>
            <input type="number" className="form-control" value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
          <div className="col-md-3">
            <button className="btn btn-primary" onClick={load}>Apply Filter</button>
          </div>
          <div className="col-md-6 text-md-end">
            <button
              className="btn btn-outline-secondary"
              disabled={byEmployee.length === 0}
              onClick={() => downloadCSV(toCSV(byEmployee), `leave_report_${year}.csv`)}
            >
              ⬇ Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4">
            <h6 className="text-muted text-uppercase small mb-3">By Status</h6>
            {byStatus.length === 0 ? (
              <p className="text-muted mb-0">No data for this year.</p>
            ) : byStatus.map((s) => (
              <div key={s.status} className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-capitalize">
                  <span
                    className="d-inline-block rounded-circle me-2"
                    style={{ width: 10, height: 10, background: STATUS_COLORS[s.status] || '#999' }}
                  />
                  {s.status}
                </span>
                <span className="fw-bold">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4">
            <h6 className="text-muted text-uppercase small mb-3">By Leave Type</h6>
            {byType.length === 0 ? (
              <p className="text-muted mb-0">No data for this year.</p>
            ) : byType.map((t) => (
              <div key={t.leave_type__name} className="d-flex justify-content-between align-items-center mb-2">
                <span>{t.leave_type__name}</span>
                <span className="fw-bold">{t.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr className="text-muted small text-uppercase">
                <th>Employee</th><th>Pending</th><th>Approved</th><th>Rejected</th><th>Total</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
              ) : byEmployee.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-4 text-muted">No data for this year.</td></tr>
              ) : byEmployee.map((r) => (
                <tr key={r.employee__employee_id}>
                  <td>
                    <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                      {r.employee__user__first_name || r.employee__user__username}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>{r.employee__employee_id}</div>
                  </td>
                  <td>{r.pending}</td>
                  <td>{r.approved}</td>
                  <td>{r.rejected}</td>
                  <td className="fw-semibold">{r.total_requests}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}