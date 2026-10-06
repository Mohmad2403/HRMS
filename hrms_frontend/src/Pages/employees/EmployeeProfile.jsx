import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../services/api'
import { money } from '../../utils/payroll'

const TABS = ['Overview', 'Personal Info', 'Job Details']

export default function EmployeeProfile({ me = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('Overview')

  const profileUrl = me ? '/employees/me/' : `/employees/${id}/`
  const summaryUrl = me ? '/employees/me/summary/' : `/employees/${id}/summary/`

  useEffect(() => {
    setLoading(true)
    Promise.all([api.get(profileUrl), api.get(summaryUrl)])
      .then(([empRes, sumRes]) => { setEmployee(empRes.data); setSummary(sumRes.data) })
      .catch(() => setError('Could not load this employee.'))
      .finally(() => setLoading(false))
  }, [id, me])

  if (loading) return <div className="text-center py-5">Loading...</div>
  if (error) return <div className="alert alert-danger">{error}</div>
  if (!employee) return null

  const fullName = employee.user.first_name
    ? `${employee.user.first_name} ${employee.user.last_name || ''}`.trim()
    : employee.user.username

  const statCards = [
    { label: 'Leave Days Used', value: summary?.total_leave_days_used ?? '—', sub: 'This year', bg: '#e7faf0', icon: '📅' },
    { label: 'Present Days', value: summary?.present_days_this_month ?? '—', sub: 'This month', bg: '#e7f0ff', icon: '🕐' },
    { label: 'Performance Rating', value: summary?.overall_rating ?? '—', sub: 'Latest review', bg: '#f3ecff', icon: '⭐' },
    { label: 'Net Salary', value: summary?.net_salary_last_month != null ? `₹${money(summary.net_salary_last_month)}` : '—', sub: 'Last month', bg: '#fff6e5', icon: '🪙' },
  ]

  return (
    <div>
      {!me && (
        <button className="btn btn-sm btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
          ← Back to List
        </button>
      )}

      {/* Header card */}
      <div className="card border-0 shadow-sm p-4 mb-4">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div className="avatar-circle" style={{ width: 72, height: 72, fontSize: '1.7rem' }}>
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2">
              <h4 className="mb-0">{fullName}</h4>
              <span className={`badge rounded-pill ${employee.is_active ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                {employee.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="text-muted small mb-1">
              {employee.employee_id} · {employee.employment_type?.replace('_', ' ')}
            </div>
            <div className="d-flex flex-wrap gap-3 text-muted small">
              <span>✉ {employee.user.email}</span>
              {employee.phone && <span>📞 {employee.phone}</span>}
              <span>📅 Joined {employee.date_of_joining}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        {statCards.map((c) => (
          <div className="col-md-3" key={c.label}>
            <div className="p-3 rounded" style={{ background: c.bg }}>
              <div className="text-muted small">{c.icon} {c.label}</div>
              <div className="fs-4 fw-bold">{c.value}</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        {TABS.map((tab) => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          </li>
        ))}
      </ul>

      <div className="card border-0 shadow-sm p-4">
        {activeTab === 'Overview' && (
          <div className="row g-3">
            <div className="col-md-6"><div className="text-muted small">Email</div><div>{employee.user.email}</div></div>
            <div className="col-md-6"><div className="text-muted small">Phone</div><div>{employee.phone || '—'}</div></div>
            <div className="col-md-6"><div className="text-muted small">Date of Joining</div><div>{employee.date_of_joining}</div></div>
            <div className="col-md-6"><div className="text-muted small">Employment Type</div><div className="text-capitalize">{employee.employment_type.replace('_', ' ')}</div></div>
          </div>
        )}

        {activeTab === 'Personal Info' && (
          <div className="row g-3">
            <div className="col-md-6"><div className="text-muted small">Date of Birth</div><div>{employee.date_of_birth || '—'}</div></div>
            <div className="col-md-6"><div className="text-muted small">Gender</div><div className="text-capitalize">{employee.gender || '—'}</div></div>
            <div className="col-12"><div className="text-muted small">Address</div><div>{employee.address || '—'}</div></div>
            <div className="col-md-6"><div className="text-muted small">Emergency Contact</div><div>{employee.emergency_contact || '—'}</div></div>
          </div>
        )}

        {activeTab === 'Job Details' && (
          <div className="row g-3">
            <div className="col-md-6"><div className="text-muted small">Department</div><div>{employee.department_detail?.name || '—'}</div></div>
            <div className="col-md-6"><div className="text-muted small">Designation</div><div>{employee.designation_detail?.title || '—'}</div></div>
            <div className="col-md-6"><div className="text-muted small">Manager</div><div>{employee.manager_detail?.employee_id || '—'}</div></div>
          </div>
        )}
      </div>
    </div>
  )
}