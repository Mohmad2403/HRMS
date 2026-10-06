import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const CRITERIA = [
  { key: 'technical_skills', label: 'Technical Skills', desc: 'Programming, tools, and domain knowledge.', icon: '💻', bg: '#e7f0ff' },
  { key: 'communication', label: 'Communication', desc: 'Clarity, listening, and collaboration with team members.', icon: '💬', bg: '#f3ecff' },
  { key: 'teamwork', label: 'Teamwork', desc: 'Cooperation, support, and team contribution.', icon: '🤝', bg: '#e7faf0' },
  { key: 'problem_solving', label: 'Problem Solving', desc: 'Analytical thinking and ability to find solutions.', icon: '💡', bg: '#fff6e5' },
]

export default function NewEvaluation() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    employee: '', period: '',
    technical_skills: 3, communication: 3, teamwork: 3, problem_solving: 3,
    comments: '',
  })

  useEffect(() => {
    api.get('/employees/', { params: { page_size: 100 } })
      .then((res) => setEmployees(res.data.results || res.data))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const average = (
    (Number(form.technical_skills) + Number(form.communication) + Number(form.teamwork) + Number(form.problem_solving)) / 4
  ).toFixed(1)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)
    try {
      await api.post('/performance/', form)
      setSuccess('Review submitted successfully.')
      setForm({ ...form, employee: '', period: '', comments: '' })
    } catch (err) {
      const data = err.response?.data
      const message =
        data?.employee?.[0] || data?.non_field_errors?.[0] || data?.detail || JSON.stringify(data)
      setError(message || 'Failed to submit review.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-light rounded-circle border" style={{ width: 38, height: 38 }} onClick={() => navigate(-1)}>
          ←
        </button>
        <div>
          <h4 className="mb-0">New Performance Evaluation</h4>
          <div className="breadcrumb-muted">Dashboard / Performance / New Evaluation</div>
        </div>
      </div>

      {error && <div className="alert alert-danger" style={{ wordBreak: 'break-word' }}>{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Employee & Period card */}
        <div className="card border-0 shadow-sm p-4 mb-3">
          <div className="d-flex align-items-start gap-3 mb-3">
            <div className="eval-icon" style={{ background: '#e7f0ff' }}>👤</div>
            <div>
              <h6 className="mb-0 fw-bold">Employee & Period</h6>
              <div className="text-muted small">Select the employee and evaluation period for this review.</div>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Employee *</label>
              <select name="employee" className="form-select" value={form.employee} onChange={handleChange} required>
                <option value="">Select employee</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.full_name} ({e.employee_id})</option>
                ))}
              </select>
              <div className="form-text">Managers only see their own team in this list.</div>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Period *</label>
              <input
                name="period"
                className="form-control"
                placeholder="e.g. 2026 Q3"
                value={form.period}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Ratings card */}
        <div className="card border-0 shadow-sm p-4 mb-3">
          <div className="d-flex align-items-start justify-content-between mb-4">
            <div className="d-flex align-items-start gap-3">
              <div className="eval-icon" style={{ background: '#fff2d9' }}>⭐</div>
              <div>
                <h6 className="mb-0 fw-bold">Ratings</h6>
                <div className="text-muted small">Rate the employee across each criterion.</div>
              </div>
            </div>
            <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis px-3 py-2">
              ⭐ {average} / 5 Average
            </span>
          </div>

          {CRITERIA.map((c) => (
            <div className="eval-criterion" key={c.key}>
              <div className="d-flex align-items-center gap-3">
                <div className="eval-icon" style={{ background: c.bg }}>{c.icon}</div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between">
                    <span className="fw-semibold">{c.label}</span>
                    <span className="text-muted small">{form[c.key]} / 5</span>
                  </div>
                  <div className="text-muted small mb-2">{c.desc}</div>
                  <input
                    type="range"
                    name={c.key}
                    className="form-range"
                    min="1"
                    max="5"
                    value={form[c.key]}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comments card */}
        <div className="card border-0 shadow-sm p-4 mb-4">
          <div className="d-flex align-items-start gap-3 mb-3">
            <div className="eval-icon" style={{ background: '#e7f0ff' }}>📝</div>
            <div>
              <h6 className="mb-0 fw-bold">Comments</h6>
              <div className="text-muted small">Add overall feedback, strengths, and areas for improvement.</div>
            </div>
          </div>
          <textarea
            name="comments"
            className="form-control"
            rows="4"
            maxLength={1000}
            placeholder="Write your comments here..."
            value={form.comments}
            onChange={handleChange}
          />
          <div className="text-end text-muted small mt-1">{form.comments.length}/1000</div>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  )
}