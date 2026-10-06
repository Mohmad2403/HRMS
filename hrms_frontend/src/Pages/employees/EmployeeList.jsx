import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function EmployeeList() {
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = location.pathname.split('/employees')[0]

  const [employees, setEmployees] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [status, setStatus] = useState('')
  const [departments, setDepartments] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    api.get('/departments/').then((res) => setDepartments(res.data.results || res.data))
    api.get('/employees/stats/').then((res) => setStats(res.data))
  }, [])

  const load = () => {
    setLoading(true)
    setError('')
    const params = { page }
    if (search) params.search = search
    if (department) params.department = department
    if (status) params.is_active = status

    api.get('/employees/', { params })
      .then((res) => { setEmployees(res.data.results); setCount(res.data.count) })
      .catch(() => setError('Could not load employees.'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [page, search, department, status])

  const clearFilters = () => {
    setSearch(''); setDepartment(''); setStatus(''); setPage(1)
  }

  const toggleActive = async (id) => {
    setBusyId(id)
    try {
      await api.post(`/employees/${id}/deactivate/`)
      load()
    } catch {
      setError('Could not update status.')
    } finally {
      setBusyId(null)
    }
  }

  const totalPages = Math.ceil(count / 10)

  const cards = stats
    ? [
        { label: 'Total Employees', value: stats.total_employees, icon: '👥', bg: '#e7f0ff' },
        { label: 'Active', value: stats.active_employees, icon: '✅', bg: '#e7faf0' },
        { label: 'On Leave', value: stats.on_leave_today, icon: '📅', bg: '#fff6e5' },
        { label: 'Inactive', value: stats.inactive_employees, icon: '⏸', bg: '#f1f3f5' },
      ]
    : []

  return (
    <div>
      {/* Page header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div className="d-flex align-items-start gap-3">
          <div className="eval-icon" style={{ background: '#e7f0ff' }}>👥</div>
          <div>
            <h4 className="mb-0">Employees</h4>
            <div className="breadcrumb-muted">Manage and view all employee details in one place.</div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => navigate(`${basePath}/employees/add`)}>
          + Add Employee
        </button>
      </div>

      {/* Stat cards */}
      {stats && (
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
      )}

      {/* Filters */}
      <div className="card border-0 shadow-sm p-3 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <input
              className="form-control"
              placeholder="Search by name, email, employee ID..."
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value) }}
            />
          </div>
          <div className="col-md-3">
            <select className="form-select" value={department} onChange={(e) => { setPage(1); setDepartment(e.target.value) }}>
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value) }}>
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="col-md-2 text-md-end">
            {(search || department || status) && (
              <button className="btn btn-link btn-sm" onClick={clearFilters}>Clear Filters</button>
            )}
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Table card */}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr className="text-muted small text-uppercase">
                <th>Name</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4">Loading...</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4 text-muted">No employees found.</td></tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="avatar-circle" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                          {emp.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{emp.full_name}</div>
                          <div className="text-muted" style={{ fontSize: '0.78rem' }}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{emp.employee_id}</td>
                    <td>{emp.department_name || '-'}</td>
                    <td>{emp.designation_title || '-'}</td>
                    <td>
                      <span className={`badge rounded-pill ${emp.is_active ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}`}>
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => navigate(`${basePath}/employees/${emp.id}`)}
                          title="View profile"
                        >
                          👁
                        </button>
                        <button
                          className={`btn btn-sm ${emp.is_active ? 'btn-outline-secondary' : 'btn-outline-success'}`}
                          disabled={busyId === emp.id}
                          onClick={() => toggleActive(emp.id)}
                          title={emp.is_active ? 'Deactivate' : 'Reactivate'}
                        >
                          {emp.is_active ? '⏸' : '✅'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center px-3 py-3 border-top">
            <span className="text-muted small">
              Showing page {page} of {totalPages} ({count} total)
            </span>
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