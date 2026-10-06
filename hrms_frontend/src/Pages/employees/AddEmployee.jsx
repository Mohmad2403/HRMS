import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const passwordStrength = (pw) => {
  if (!pw) return 0
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score // 0-4
}

const STRENGTH_LABEL = ['Too short', 'Weak', 'Fair', 'Good', 'Strong']
const STRENGTH_COLOR = ['bg-danger', 'bg-danger', 'bg-warning', 'bg-info', 'bg-success']

export default function AddEmployee() {
  const navigate = useNavigate()
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')

  const [form, setForm] = useState({
    username: '', email: '', password: '', first_name: '', last_name: '', role: 'employee',
    employee_id: '', department: '', designation: '', phone: '', date_of_joining: '',
    date_of_birth: '', address: '',
  })

  useEffect(() => {
    api.get('/departments/').then((res) => setDepartments(res.data.results))
  }, [])

  useEffect(() => {
    if (!form.department) { setDesignations([]); return }
    api.get('/departments/designations/', { params: { department: form.department } })
      .then((res) => setDesignations(res.data.results))
  }, [form.department])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const emailValid = form.email === '' ? null : EMAIL_RE.test(form.email)
  const strength = passwordStrength(form.password)
  const passwordsMatch = confirmPassword === '' ? null : confirmPassword === form.password

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      await api.post('/employees/', form)
      navigate('../employees')
    } catch (err) {
      const data = err.response?.data
      setError(data ? JSON.stringify(data) : 'Failed to create employee.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="d-flex align-items-start gap-3 mb-4">
        <div className="eval-icon" style={{ background: '#e7f0ff' }}>👤</div>
        <div>
          <h4 className="mb-0">Add Employee</h4>
          <div className="breadcrumb-muted">Dashboard / Employees / Add Employee</div>
        </div>
      </div>

      {error && <div className="alert alert-danger" style={{ wordBreak: 'break-word' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="card border-0 shadow-sm p-4">
        {/* Login & Personal Details */}
        <h6 className="text-muted text-uppercase small fw-bold mb-3">Login & Personal Details</h6>
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <label className="form-label">Username *</label>
            <input name="username" className="form-control" value={form.username} onChange={handleChange} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Email *</label>
            <div className="position-relative">
              <input
                type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required
              />
              {emailValid !== null && (
                <span className="position-absolute top-50 end-0 translate-middle-y me-3">
                  {emailValid ? '✅' : '❌'}
                </span>
              )}
            </div>
          </div>
          <div className="col-md-4">
            <label className="form-label">Role *</label>
            <select name="role" className="form-select" value={form.role} onChange={handleChange}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Password *</label>
            <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} required />
            {form.password && (
              <>
                <div className="progress mt-1" style={{ height: 5 }}>
                  <div className={`progress-bar ${STRENGTH_COLOR[strength]}`} style={{ width: `${(strength / 4) * 100}%` }} />
                </div>
                <div className="form-text">{STRENGTH_LABEL[strength]}</div>
              </>
            )}
          </div>
          <div className="col-md-4">
            <label className="form-label">Confirm Password *</label>
            <input
              type="password" className="form-control"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {passwordsMatch !== null && (
              <div className={`form-text ${passwordsMatch ? 'text-success' : 'text-danger'}`}>
                {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
              </div>
            )}
          </div>
          <div className="col-md-4">
            <label className="form-label">First Name *</label>
            <input name="first_name" className="form-control" value={form.first_name} onChange={handleChange} required />
          </div>

          <div className="col-md-4">
            <label className="form-label">Last Name</label>
            <input name="last_name" className="form-control" value={form.last_name} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Date of Birth</label>
            <input type="date" name="date_of_birth" className="form-control" value={form.date_of_birth} onChange={handleChange} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Phone</label>
            <input name="phone" className="form-control" value={form.phone} onChange={handleChange} />
          </div>
        </div>

        {/* Job Details */}
        <h6 className="text-muted text-uppercase small fw-bold mb-3">Job Details</h6>
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <label className="form-label">Employee ID *</label>
            <input name="employee_id" className="form-control" value={form.employee_id} onChange={handleChange} required />
          </div>
          <div className="col-md-4">
            <label className="form-label">Department</label>
            <select name="department" className="form-select" value={form.department} onChange={handleChange}>
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Designation</label>
            <select name="designation" className="form-select" value={form.designation} onChange={handleChange} disabled={!form.department}>
              <option value="">Select designation</option>
              {designations.map((d) => (
                <option key={d.id} value={d.id}>{d.title}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Date of Joining *</label>
            <input type="date" name="date_of_joining" className="form-control" value={form.date_of_joining} onChange={handleChange} required />
          </div>
        </div>

        {/* Additional Information */}
        <h6 className="text-muted text-uppercase small fw-bold mb-3">Additional Information</h6>
        <div className="row g-3 mb-4">
          <div className="col-12">
            <label className="form-label">Full Address</label>
            <textarea name="address" className="form-control" rows="2" value={form.address} onChange={handleChange} />
          </div>
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('../employees')}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Employee'}
          </button>
        </div>
      </form>
    </div>
  )
}