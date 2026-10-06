import { useEffect, useState } from 'react'
import api from '../../services/api'
import { fmtHours, fmtTime, statusClass, statusLabel } from '../../utils/attendance'

export default function CheckInCard() {
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/attendance/today/')
      .then((res) => setRecord(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Could not load attendance.'))
      .finally(() => setLoading(false))
  }, [])

  const act = async (endpoint) => {
    setBusy(true)
    setError('')
    try {
      const res = await api.post(`/attendance/${endpoint}/`)
      setRecord(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <div className="card border-0 shadow-sm p-4">Loading...</div>

  const checkedIn = !!record?.check_in
  const checkedOut = !!record?.check_out

  return (
    <div className="card border-0 shadow-sm p-4 mb-4">
      <h6 className="text-muted text-uppercase small mb-3">Today's Attendance</h6>
      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="row g-3 align-items-center">
        <div className="col-md-3">
          <div className="text-muted small">Check In</div>
          <div className="fs-5 fw-semibold">{fmtTime(record?.check_in)}</div>
        </div>
        <div className="col-md-3">
          <div className="text-muted small">Check Out</div>
          <div className="fs-5 fw-semibold">{fmtTime(record?.check_out)}</div>
        </div>
        <div className="col-md-3">
          <div className="text-muted small">Hours / Status</div>
          <div>
            {fmtHours(record?.working_hours)}{' '}
            {record && <span className={statusClass(record.status)}>{statusLabel(record.status)}</span>}
          </div>
        </div>
        <div className="col-md-3 text-md-end">
          {!checkedIn && (
            <button className="btn btn-primary" disabled={busy} onClick={() => act('check-in')}>
              Check In
            </button>
          )}
          {checkedIn && !checkedOut && (
            <button className="btn btn-outline-danger" disabled={busy} onClick={() => act('check-out')}>
              Check Out
            </button>
          )}
          {checkedOut && <span className="text-muted">Done for today</span>}
        </div>
      </div>
    </div>
  )
}