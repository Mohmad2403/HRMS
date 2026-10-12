import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import CheckInCard from '../attendance/CheckInCard'

const COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2', '#db2777']

const QUICK_LINKS = [
  { label: 'Add Employee', icon: '👤', to: 'employees/add', bg: '#e7f0ff' },
  { label: 'Generate Payslip', icon: '💰', to: 'payroll', bg: '#e7faf0' },
  { label: 'New Evaluation', icon: '⭐', to: 'performance/new', bg: '#fff6e5' },
  { label: 'Leave Approvals', icon: '📋', to: 'leaves', bg: '#f3ecff' },
  { label: 'Attendance Report', icon: '📊', to: 'reports/attendance', bg: '#ffe9ec' },
]

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.split('/dashboard')[0]
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/employees/stats/')
      .then((res) => setStats(res.data))
      .catch(() => setError('Could not load dashboard data.'))
  }, [])

  if (error) return <div className="alert alert-danger">{error}</div>
  if (!stats) return <div className="text-center py-5">Loading...</div>

  const chartData = stats.department_distribution.map((d) => ({ name: d.department, value: d.count }))

  const cards = [
    { label: 'Total Employees', value: stats.total_employees, icon: '👥', bg: '#e7f0ff' },
    { label: 'Active Employees', value: stats.active_employees, icon: '✅', bg: '#e7faf0' },
    { label: 'Departments', value: stats.total_departments, icon: '🏢', bg: '#f3ecff' },
    { label: 'Inactive Employees', value: stats.inactive_employees, icon: '⏸', bg: '#f1f3f5' },
  ]

  return (
    <div>
      <h4 className="mb-4">{user?.role === 'hr' ? 'HR Dashboard' : 'Admin Dashboard'}</h4>

      {user?.role === 'hr' && <CheckInCard />}

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        {cards.map((c) => (
          <div className="col-md-3" key={c.label}>
            <div className="card border-0 shadow-sm p-3 d-flex flex-row align-items-center gap-3">
              <div className="eval-icon" style={{ background: c.bg }}>{c.icon}</div>
              <div>
                <div className="text-muted small">{c.label}</div>
                <div className="fs-4 fw-bold">{c.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mb-4">
        {/* Donut chart */}
        <div className="col-md-7">
          <div className="card border-0 shadow-sm p-4 h-100">
            <div className="d-flex align-items-start gap-3 mb-2">
              <div className="eval-icon" style={{ background: '#e7f0ff' }}>🏢</div>
              <div>
                <h6 className="mb-0 fw-bold">Employees by Department</h6>
                <div className="text-muted small">Hover a slice for details</div>
              </div>
            </div>
            {chartData.length === 0 ? (
              <p className="text-muted mb-0">No department data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={2}
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} employees`, name]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="col-md-5">
          <div className="card border-0 shadow-sm p-4 h-100">
            <div className="d-flex align-items-start gap-3 mb-3">
              <div className="eval-icon" style={{ background: '#fff6e5' }}>⚡</div>
              <div>
                <h6 className="mb-0 fw-bold">Quick Actions</h6>
                <div className="text-muted small">Jump straight to a task</div>
              </div>
            </div>
            <div className="d-flex flex-column gap-2">
              {QUICK_LINKS.map((q) => (
                <button
                  key={q.label}
                  className="btn text-start d-flex align-items-center gap-3 border-0"
                  style={{ background: q.bg }}
                  onClick={() => navigate(`${basePath}/${q.to}`)}
                >
                  <span style={{ fontSize: '1.2rem' }}>{q.icon}</span>
                  <span className="fw-semibold">{q.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}