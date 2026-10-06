import { useEffect, useState } from 'react'
import api from '../../services/api'
import { money, monthName, payslipStatusClass } from '../../utils/payroll'

const now = new Date()

export default function PayrollManage() {
  const [payslips, setPayslips] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [employees, setEmployees] = useState([])
  const [error, setError] = useState('')
  const [salaryMsg, setSalaryMsg] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [savingSalary, setSavingSalary] = useState(false)

  const [form, setForm] = useState({
    employee: '', month: now.getMonth() + 1, year: now.getFullYear(), bonus: 0, deductions: 0,
  })

  const [salaryForm, setSalaryForm] = useState({
    employee: '', basic: '', hra: '', allowances: '',
  })

  const loadEmployees = () => {
    api.get('/employees/', { params: { page_size: 100 } })
      .then((res) => setEmployees(res.data.results || res.data))
  }

  const load = () => {
    api.get('/payroll/', { params: { page } })
      .then((res) => { setPayslips(res.data.results); setCount(res.data.count) })
  }

  useEffect(load, [page])
  useEffect(loadEmployees, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handleSalaryChange = (e) => setSalaryForm({ ...salaryForm, [e.target.name]: e.target.value })

  const handleGenerate = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await api.post('/payroll/generate/', form)
      load()
      setForm({ ...form, employee: '', bonus: 0, deductions: 0 })
    } catch (err) {
      const data = err.response?.data
      setError(data?.detail || JSON.stringify(data) || 'Failed to generate payslip.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSetSalary = async (e) => {
    e.preventDefault()
    setSalaryMsg('')
    setSavingSalary(true)
    try {
      await api.post('/payroll/salary-structures/', salaryForm)
      setSalaryMsg('Salary structure saved.')
      setSalaryForm({ employee: '', basic: '', hra: '', allowances: '' })
    } catch (err) {
      const data = err.response?.data
      setSalaryMsg(data?.employee?.[0] || data?.detail || JSON.stringify(data) || 'Failed to save.')
    } finally {
      setSavingSalary(false)
    }
  }

  const markPaid = async (id) => {
    setBusyId(id)
    try {
      await api.post(`/payroll/${id}/mark-paid/`)
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not mark as paid.')
    } finally {
      setBusyId(null)
    }
  }

  const totalPages = Math.ceil(count / 10)

  return (
    <div>
      <h4 className="mb-0">Payroll</h4>
      <div className="breadcrumb-muted mb-4">Dashboard / Payroll</div>

      {/* Set Salary Structure */}
      <form onSubmit={handleSetSalary} className="card border-0 shadow-sm p-4 mb-4">
        <h6 className="text-muted text-uppercase small mb-3">Set Salary Structure</h6>
        {salaryMsg && (
          <div className={`alert py-2 ${salaryMsg.includes('saved') ? 'alert-success' : 'alert-danger'}`}>
            {salaryMsg}
          </div>
        )}
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label">Employee *</label>
            <select name="employee" className="form-select" value={salaryForm.employee} onChange={handleSalaryChange} required>
              <option value="">Select employee</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.full_name} ({e.employee_id})</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Basic *</label>
            <input type="number" name="basic" className="form-control" value={salaryForm.basic} onChange={handleSalaryChange} min="0" required />
          </div>
          <div className="col-md-2">
            <label className="form-label">HRA</label>
            <input type="number" name="hra" className="form-control" value={salaryForm.hra} onChange={handleSalaryChange} min="0" />
          </div>
          <div className="col-md-2">
            <label className="form-label">Allowances</label>
            <input type="number" name="allowances" className="form-control" value={salaryForm.allowances} onChange={handleSalaryChange} min="0" />
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-primary w-100" disabled={savingSalary}>
              {savingSalary ? 'Saving...' : 'Save Salary'}
            </button>
          </div>
        </div>
      </form>

      {error && <div className="alert alert-danger" style={{ wordBreak: 'break-word' }}>{error}</div>}

      {/* Generate Payslip */}
      <form onSubmit={handleGenerate} className="card border-0 shadow-sm p-4 mb-4">
        <h6 className="text-muted text-uppercase small mb-3">Generate Payslip</h6>
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label">Employee *</label>
            <select name="employee" className="form-select" value={form.employee} onChange={handleChange} required>
              <option value="">Select employee</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.full_name} ({e.employee_id})</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Month *</label>
            <select name="month" className="form-select" value={form.month} onChange={handleChange}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{monthName(m)}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label">Year *</label>
            <input type="number" name="year" className="form-control" value={form.year} onChange={handleChange} required />
          </div>
          <div className="col-md-2">
            <label className="form-label">Bonus</label>
            <input type="number" name="bonus" className="form-control" value={form.bonus} onChange={handleChange} min="0" />
          </div>
          <div className="col-md-2">
            <label className="form-label">Deductions</label>
            <input type="number" name="deductions" className="form-control" value={form.deductions} onChange={handleChange} min="0" />
          </div>
          <div className="col-md-1">
            <button className="btn btn-primary w-100" disabled={submitting}>
              {submitting ? '...' : 'Generate'}
            </button>
          </div>
        </div>
      </form>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr className="text-muted small text-uppercase">
                <th>Employee</th><th>Month</th><th>Gross</th><th>Deductions</th><th>Net</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payslips.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4 text-muted">No payslips generated yet.</td></tr>
              ) : payslips.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{p.employee_name}</div>
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>{p.employee_code}</div>
                  </td>
                  <td>{monthName(p.month)} {p.year}</td>
                  <td>₹{money(p.gross_salary)}</td>
                  <td>₹{money(p.deductions)}</td>
                  <td className="fw-semibold">₹{money(p.net_salary)}</td>
                  <td><span className={payslipStatusClass(p.status)}>{p.status === 'paid' ? 'Paid' : 'Pending'}</span></td>
                  <td>
                    {p.status === 'pending' ? (
                      <button
                        className="btn btn-sm btn-success"
                        disabled={busyId === p.id}
                        onClick={() => markPaid(p.id)}
                      >
                        Mark Paid
                      </button>
                    ) : (
                      <span className="text-muted small">—</span>
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