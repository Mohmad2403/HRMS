import { useEffect, useState } from 'react'
import api from '../../services/api'
import { money, monthName, payslipStatusClass } from '../../utils/payroll'

const toCSV = (rows) => {
  const headers = ['Employee ID', 'Name', 'Month', 'Year', 'Gross', 'Deductions', 'Net', 'Status']
  const lines = rows.map((r) => [
    r.employee_code, r.employee_name, monthName(r.month), r.year,
    r.gross_salary, r.deductions, r.net_salary, r.status,
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

export default function PayrollReport() {
  const [totals, setTotals] = useState(null)
  const [payslips, setPayslips] = useState([])
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    const params = { year }
    if (month) params.month = month
    api.get('/payroll/report/', { params })
      .then((res) => { setTotals(res.data.totals); setPayslips(res.data.payslips) })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  return (
    <div>
      <h4 className="mb-0">Payroll Report</h4>
      <div className="breadcrumb-muted mb-4">Dashboard / Reports / Payroll</div>

      <div className="card border-0 shadow-sm p-4 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label small">Year</label>
            <input type="number" className="form-control" value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
          <div className="col-md-3">
            <label className="form-label small">Month</label>
            <select className="form-select" value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="">All months</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>{monthName(m)}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <button className="btn btn-primary" onClick={load}>Apply Filter</button>
          </div>
          <div className="col-md-3 text-md-end">
            <button
              className="btn btn-outline-secondary"
              disabled={payslips.length === 0}
              onClick={() => downloadCSV(toCSV(payslips), `payroll_report_${year}${month ? '_' + month : ''}.csv`)}
            >
              ⬇ Export CSV
            </button>
          </div>
        </div>
      </div>

      {totals && (
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3 text-center">
              <div className="fs-4 fw-bold text-primary">₹{money(totals.total_gross || 0)}</div>
              <div className="text-muted small">Total Gross Paid</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3 text-center">
              <div className="fs-4 fw-bold">₹{money(totals.total_deductions || 0)}</div>
              <div className="text-muted small">Total Deductions</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3 text-center">
              <div className="fs-4 fw-bold text-success">{totals.paid_count}</div>
              <div className="text-muted small">Paid</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm p-3 text-center">
              <div className="fs-4 fw-bold text-warning">{totals.pending_count}</div>
              <div className="text-muted small">Pending</div>
            </div>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr className="text-muted small text-uppercase">
                <th>Employee</th><th>Month</th><th>Gross</th><th>Deductions</th><th>Net</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
              ) : payslips.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4 text-muted">No payslips for this period.</td></tr>
              ) : payslips.map((p, i) => (
                <tr key={i}>
                  <td>
                    <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{p.employee_name}</div>
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>{p.employee_code}</div>
                  </td>
                  <td>{monthName(p.month)} {p.year}</td>
                  <td>₹{money(p.gross_salary)}</td>
                  <td>₹{money(p.deductions)}</td>
                  <td className="fw-semibold">₹{money(p.net_salary)}</td>
                  <td><span className={payslipStatusClass(p.status)}>{p.status === 'paid' ? 'Paid' : 'Pending'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}