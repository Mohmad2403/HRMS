import { useEffect, useState } from 'react'
import api from '../../services/api'
import { money, monthName, payslipStatusClass } from '../../utils/payroll'

export default function MySalary() {
  const [structure, setStructure] = useState(null)
  const [payslips, setPayslips] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/payroll/my-salary/'),
      api.get('/payroll/my-payslips/'),
    ])
      .then(([salaryRes, payslipsRes]) => {
        setStructure(salaryRes.data)
        setPayslips(payslipsRes.data.results)
      })
      .catch((err) => setError(err.response?.data?.detail || 'Could not load salary details.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-5">Loading...</div>

  const chips = structure
    ? [
        { label: 'Basic', value: structure.basic, bg: '#e7f0ff', icon: '💳' },
        { label: 'HRA', value: structure.hra, bg: '#e7faf0', icon: '🏠' },
        { label: 'Allowances', value: structure.allowances, bg: '#f3ecff', icon: '🎁' },
        { label: 'Gross Salary', value: structure.gross, bg: '#ffe9ec', icon: '🪙' },
      ]
    : []

  return (
    <div>
      <div className="d-flex align-items-start gap-3 mb-4">
        <div className="eval-icon" style={{ background: '#f3ecff' }}>💰</div>
        <div>
          <h4 className="mb-0">My Salary</h4>
          <div className="breadcrumb-muted">Dashboard / Payroll / My Salary</div>
        </div>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      {structure && (
        <div className="card border-0 shadow-sm p-4 mb-4">
          <div className="d-flex align-items-start gap-3 mb-3">
            <div className="eval-icon" style={{ background: '#e7f0ff' }}>🧾</div>
            <div>
              <h6 className="mb-0 fw-bold">Salary Structure</h6>
              <div className="text-muted small">Your current salary breakdown</div>
            </div>
          </div>

          <div className="row g-3">
            {chips.map((c) => (
              <div className="col-md-3" key={c.label}>
                <div className="p-3 rounded" style={{ background: c.bg }}>
                  <div className="text-muted small">{c.icon} {c.label}</div>
                  <div className="fs-5 fw-bold">₹{money(c.value)}</div>
                </div>
              </div>
            ))}
          </div>

          {structure.updated_at && (
            <div className="text-muted small mt-3">
              Last updated: {new Date(structure.updated_at).toLocaleString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </div>
          )}
        </div>
      )}

      <div className="card border-0 shadow-sm p-4">
        <div className="d-flex align-items-start gap-3 mb-3">
          <div className="eval-icon" style={{ background: '#e7faf0' }}>🕐</div>
          <div>
            <h6 className="mb-0 fw-bold">Salary History</h6>
            <div className="text-muted small">Details of your past salary records</div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr className="text-muted small text-uppercase">
                <th>Month</th><th>Basic+HRA+Allow.</th><th>Bonus</th><th>Gross Salary</th><th>Deductions</th><th>Net Salary</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payslips.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4 text-muted">No payslips yet.</td></tr>
              ) : payslips.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="fw-semibold">{monthName(p.month)} {p.year}</div>
                    <div className="text-muted small">{monthName(p.month).slice(0, 3)} {p.year}</div>
                  </td>
                  <td>₹{money(Number(p.basic) + Number(p.hra) + Number(p.allowances))}</td>
                  <td>₹{money(p.bonus)}</td>
                  <td>₹{money(p.gross_salary)}</td>
                  <td>₹{money(p.deductions)}</td>
                  <td className="fw-semibold">₹{money(p.net_salary)}</td>
                  <td><span className={payslipStatusClass(p.status)}>{p.status === 'paid' ? 'Paid' : 'Pending'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payslips.length > 0 && (
          <div className="text-muted small mt-2">Showing {payslips.length} of {payslips.length} records</div>
        )}
      </div>
    </div>
  )
}