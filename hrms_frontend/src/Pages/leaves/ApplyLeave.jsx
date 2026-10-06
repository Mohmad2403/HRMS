import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../../services/api'

const TYPE_STYLE = {
  'Casual Leave': { icon: '☀️', bg: '#fff6e5' },
  'Sick Leave': { icon: '💗', bg: '#ffe9ec' },
  'Earned Leave': { icon: '📅', bg: '#e7f0ff' },
}

export default function ApplyLeave() {
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.split('/leaves')[0]

  const [balances, setBalances] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    leave_type: '', start_date: '', end_date: '', reason: '',
  })

  useEffect(() => {
    api.get('/leaves/balance/').then((res) => setBalances(res.data))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.post('/leaves/apply/', form)
      navigate(`${basePath}/leaves/my`)
    } catch (err) {
      const data = err.response?.data
      const message = data?.non_field_errors?.[0] || data?.detail || JSON.stringify(data)
      setError(message || 'Failed to submit leave request.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="d-flex align-items-start gap-3 mb-4">
        <div className="eval-icon" style={{ background: '#e7f0ff' }}>📝</div>
        <div>
          <h4 className="mb-0">Apply Leave</h4>
          <div className="breadcrumb-muted">Dashboard / Leave Management / Apply Leave</div>
        </div>
      </div>

      {error && <div className="alert alert-danger" style={{ wordBreak: 'break-word' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="card border-0 shadow-sm p-4">
        <label className="form-label fw-semibold mb-2">Leave Type *</label>
        <div className="row g-3 mb-4">
          {balances.map((b) => {
            const style = TYPE_STYLE[b.name] || { icon: '📋', bg: '#f1f3f5' }
            const selected = String(form.leave_type) === String(b.leave_type)
            const disabled = b.remaining <= 0
            return (
              <div className="col-md-4" key={b.leave_type}>
                <div
                  className={`p-3 rounded border ${selected ? 'border-primary border-2' : 'border'} ${disabled ? 'opacity-50' : 'cursor-pointer'}`}
                  style={{ background: style.bg, cursor: disabled ? 'not-allowed' : 'pointer' }}
                  onClick={() => !disabled && setForm({ ...form, leave_type: b.leave_type })}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <span style={{ fontSize: '1.4rem' }}>{style.icon}</span>
                    {selected && <span className="badge bg-primary rounded-circle" style={{ width: 22, height: 22 }}>✓</span>}
                  </div>
                  <div className="fw-semibold mt-2">{b.name}</div>
                  <div className="text-muted small">
                    {disabled ? 'No days left' : `${b.remaining} remaining`}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label">Start Date *</label>
            <input
              type="date"
              name="start_date"
              className="form-control form-control-lg"
              value={form.start_date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">End Date *</label>
            <input
              type="date"
              name="end_date"
              className="form-control form-control-lg"
              value={form.end_date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mb-2">
          <label className="form-label">Reason *</label>
          <textarea
            name="reason"
            className="form-control"
            rows="3"
            maxLength={500}
            placeholder="Enter reason for leave..."
            value={form.reason}
            onChange={handleChange}
            required
          />
          <div className="text-end text-muted small mt-1">{form.reason.length}/500</div>
        </div>

        <div className="alert alert-info d-flex align-items-start gap-2 mb-4">
          <span>ℹ️</span>
          <span className="small">
            Your leave request will be reviewed by your manager or HR. You'll see the outcome on this page once it's approved or rejected.
          </span>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(`${basePath}/leaves/my`)}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={submitting || !form.leave_type}>
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  )
}