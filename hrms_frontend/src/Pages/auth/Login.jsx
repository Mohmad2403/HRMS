import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { dashboardPath } from '../../utils/roles'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to={dashboardPath(user.role)} replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const loggedInUser = await login(username, password)
      navigate(dashboardPath(loggedInUser.role), { replace: true })
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid username or password.')
      } else {
        setError('Cannot reach the server. Is Django running?')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="login-split">
      {/* Left: form */}
      <div className="login-form-side">
        <div className="login-form-wrap">
          <div className="d-flex align-items-center gap-2 mb-5">
            <div className="login-logo">H</div>
            <div>
              <div className="fw-bold" style={{ fontSize: '1.1rem', lineHeight: 1 }}>HRMS</div>
              <div className="text-muted" style={{ fontSize: '0.72rem' }}>Manage People · Build Future</div>
            </div>
          </div>

          <h3 className="fw-bold mb-1">Welcome Back!</h3>
          <p className="text-muted mb-4">Sign in to your account to continue</p>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Email or Username</label>
              <input
                className="form-control form-control-lg"
                placeholder="Enter your email or username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="mb-2">
              <label className="form-label small fw-semibold">Password</label>
              <div className="input-group input-group-lg">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword((s) => !s)}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div className="text-end mb-4">
              <a href="#" className="small text-decoration-none">Forgot password?</a>
            </div>

            <button className="btn btn-primary btn-lg w-100 mb-4" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-muted small mb-0">
            Don't have an account? <a href="#" className="text-decoration-none">Contact your admin</a>
          </p>
        </div>
      </div>

      {/* Right: illustration panel */}
      <div className="login-art-side">
        <div className="login-art-dots" />
        <div className="login-art-content">
          <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="110" cy="110" r="100" fill="#e9e4ff" />
            <rect x="60" y="120" width="100" height="60" rx="6" fill="#ffffff" />
            <rect x="70" y="130" width="80" height="8" rx="2" fill="#c9bfff" />
            <rect x="70" y="145" width="55" height="8" rx="2" fill="#dcd4ff" />
            <circle cx="110" cy="80" r="28" fill="#7c5cff" />
            <rect x="95" y="105" width="30" height="45" rx="10" fill="#5b3fe0" />
          </svg>
          <h4 className="fw-bold mt-4 mb-2">Better People</h4>
          <h4 className="fw-bold mb-3">Better Workplace</h4>
          <p className="text-muted px-4">
            Manage your team, track progress and build a brighter future.
          </p>
        </div>
      </div>
    </div>
  )
}