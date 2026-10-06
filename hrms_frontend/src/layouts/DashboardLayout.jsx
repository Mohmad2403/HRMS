import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { menuByRole } from '../utils/menuConfig'
import { useTheme } from '../context/ThemeContext'

function SidebarGroup({ group }) {
  const location = useLocation()
  const hasActiveChild = group.children.some((c) => location.pathname === c.path)
  const [open, setOpen] = useState(hasActiveChild)

  return (
    <div className="mb-1">
      <button
        className="nav-link w-100 d-flex justify-content-between align-items-center border-0 bg-transparent"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{group.label}</span>
        <span style={{ fontSize: '0.7rem' }}>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="ms-3">
          {group.children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              end
              className={({ isActive }) => `nav-link sidebar-sublink ${isActive ? 'active' : ''}`}
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const links = menuByRole[user.role] || []
  const initials = (user.first_name || user.username).charAt(0).toUpperCase()

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="sidebar text-white p-3" style={{ width: 230, flexShrink: 0 }}>
        <div className="d-flex align-items-center gap-2 mb-4 px-1">
          <div className="avatar-circle">H</div>
          <div>
            <div className="fw-bold">HRMS</div>
            <div className="text-white-50" style={{ fontSize: '0.7rem' }}>
              Manage People
            </div>
          </div>
        </div>

        <nav className="nav flex-column">
          {links.map((item) =>
            item.children ? (
              <SidebarGroup key={item.label} group={item} />
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
              </NavLink>
            )
          )}
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex-grow-1 d-flex flex-column">
        <header className="d-flex justify-content-between align-items-center border-bottom px-4 py-2" style={{ background: 'var(--bg-card)' }}>          <span className="breadcrumb-muted text-uppercase">{user.role} panel</span>
          <div className="d-flex align-items-center gap-3">
            <div className="avatar-circle">{initials}</div>
            <div>
              <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                {user.first_name || user.username}
              </div>
              <div className="text-muted text-capitalize" style={{ fontSize: '0.75rem' }}>
                {user.role}
              </div>
            </div>
            <button className="btn btn-sm btn-outline-secondary" onClick={toggleTheme}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button className="btn btn-sm btn-outline-danger" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <main className="p-4 flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}