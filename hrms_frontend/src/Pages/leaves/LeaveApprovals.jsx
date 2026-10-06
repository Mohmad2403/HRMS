import { useEffect, useState } from 'react'
import api from '../../services/api'
import { leaveStatusClass, leaveStatusLabel } from '../../utils/leave'

export default function LeaveApprovals() {
  const [rows, setRows] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('pending')
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')

  const load = () => {
    const params = { page }
    if (status) params.status = status
    api.get('/leaves/', { params })
      .then((res) => { setRows(res.data.results); setCount(res.data.count) })
  }

  useEffect(load, [page, status])

  const act = async (id, action) => {
    setBusyId(id)
    setError('')
    try {
      await api.post(`/leaves/${id}/${action}/`)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setBusyId(null)
    }
  }

  const totalPages = Math.ceil(count / 10)

  return (
    <div>
      <h4 className="mb-0">Leave Approvals</h4>
      <div className="breadcrumb-muted mb-4">Dashboard / Leave Management / Approvals</div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="d-flex gap-2 mb-3">
        <select
          className="form-select"
          style={{ maxWidth: 180 }}
          value={status}
          onChange={(e) => { setPage(1); setStatus(e.target.value) }}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">All</option>
        </select>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr className="text-muted small text-uppercase">
                <th>Employee</th><th>Leave Type</th><th>Dates</th><th>Days</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4 text-muted">No requests found.</td></tr>
              ) : rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{r.employee_name}</div>
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>{r.employee_code}</div>
                  </td>
                  <td>{r.leave_type_name}</td>
                  <td>{r.start_date} to {r.end_date}</td>
                  <td>{r.total_days}</td>
                  <td><span className={leaveStatusClass(r.status)}>{leaveStatusLabel(r.status)}</span></td>
                  <td>
                    {r.status === 'pending' ? (
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-success"
                          disabled={busyId === r.id}
                          onClick={() => act(r.id, 'approve')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          disabled={busyId === r.id}
                          onClick={() => act(r.id, 'reject')}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted small">
                        by {r.reviewed_by_name || '—'}
                      </span>
                    )}
                  </td>
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