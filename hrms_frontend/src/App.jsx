import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import DashboardLayout from './layouts/DashboardLayout'
import Login from './Pages/auth/Login'
import Dashboard from './Pages/dashboard/Dashboard'
import EmployeeList from './Pages/employees/EmployeeList'
import ProtectedRoute from './routes/ProtectedRoute'
import { dashboardPath } from './utils/roles'
import AddEmployee from './Pages/employees/AddEmployee'
import EmployeeProfile from './Pages/employees/EmployeeProfile'
import MyAttendance from './Pages/attendance/MyAttendance'
import AllAttendance from './Pages/attendance/AllAttendance'
import ApplyLeave from './Pages/leaves/ApplyLeave'
import MyLeaves from './Pages/leaves/MyLeaves'
import LeaveApprovals from './Pages/leaves/LeaveApprovals'
import MySalary from './Pages/payroll/MySalary'
import PayrollManage from './Pages/payroll/PayrollManage'
import MyPerformance from './Pages/performance/MyPerformance'
import NewEvaluation from './Pages/performance/NewEvaluation'
import AttendanceReport from './Pages/reports/AttendanceReport'
import LeaveReport from './Pages/reports/LeaveReport'
import PayrollReport from './Pages/reports/PayRollReport'





const ROLES = ['admin', 'hr', 'manager', 'employee']



function HomeRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <div className="text-center mt-5">Loading...</div>
  return <Navigate to={user ? dashboardPath(user.role) : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {ROLES.map((role) => (
        <Route
          key={role}
          path={`/${role}`}
          element={
            <ProtectedRoute allowedRoles={[role]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="employees/add" element={<AddEmployee />} />
          <Route path="employees/:id" element={<EmployeeProfile />} />
          <Route path="attendance/my" element={<MyAttendance />} />
          {role !== 'employee' && <Route path="attendance" element={<AllAttendance />} />}
          <Route path="profile" element={<EmployeeProfile me />} />
          <Route path="leaves/my" element={<MyLeaves />} />
          <Route path="leaves/apply" element={<ApplyLeave />} />
          {role !== 'employee' && <Route path="leaves" element={<LeaveApprovals />} />}
          <Route path="payroll/my" element={<MySalary />} />
          {role !== 'employee' && <Route path="payroll" element={<PayrollManage />} />}
          <Route path="performance/my" element={<MyPerformance />} />
          {role !== 'employee' && <Route path="performance/new" element={<NewEvaluation />} />}
          {role !== 'employee' && <Route path="reports/attendance" element={<AttendanceReport />} />}
          {role !== 'employee' && <Route path="reports/leave" element={<LeaveReport />} />}
          {(role === 'admin' || role === 'hr') && <Route path="reports/payroll" element={<PayrollReport />} />}
        </Route>
      ))}

      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  )
}