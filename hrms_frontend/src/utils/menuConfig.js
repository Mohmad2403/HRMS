export const menuByRole = {
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Employees', path: '/admin/employees' },
   // { label: 'Departments', path: '/admin/departments' },
   {label:'My profile',path:'/admin/profile'},
    {
      label: 'Attendance',
      children: [
        { label: 'All Attendance', path: '/admin/attendance' },
        { label: 'My Attendance', path: '/admin/attendance/my' },
       
      ],
    },
    {
      label: 'Leave',
      children: [
        { label: 'Leave Approvals', path: '/admin/leaves' },
        { label: 'My Leaves', path: '/admin/leaves/my' },
      ],
    },
    {
      label: 'Payroll',
      children: [
        { label: 'Manage Payroll', path: '/admin/payroll' },
        { label: 'My Salary', path: '/admin/payroll/my' },
      ],
    },
    {
      label: 'Performance',
      children: [
        { label: 'My Performance', path: '/admin/performance/my' },
        { label: 'New Evaluation', path: '/admin/performance/new' },
      ],
    },
    {
      label: 'Reports',
      children: [
        { label: 'Attendance Report', path: '/admin/reports/attendance' },
        { label: 'Leave Report', path: '/admin/reports/leave' },
        { label: 'Payroll Report', path: '/admin/reports/payroll' },
      ],
    },
  ],
  hr: [
    { label: 'Dashboard', path: '/hr/dashboard' },
    { label: 'Employees', path: '/hr/employees' },
   // { label: 'Departments', path: '/hr/departments' },
   {label:'My Profile',path:'/hr/profile'},
    {
      label: 'Attendance',
      children: [
        { label: 'All Attendance', path: '/hr/attendance' },
        { label: 'My Attendance', path: '/hr/attendance/my' },
      ],
    },
    {
      label: 'Leave',
      children: [
        { label: 'Leave Approvals', path: '/hr/leaves' },
        { label: 'My Leaves', path: '/hr/leaves/my' },
      ],
    },
    {
      label: 'Payroll',
      children: [
        { label: 'Manage Payroll', path: '/hr/payroll' },
        { label: 'My Salary', path: '/hr/payroll/my' },
      ],
    },
    {
      label: 'Performance',
      children: [
        { label: 'My Performance', path: '/hr/performance/my' },
        { label: 'New Evaluation', path: '/hr/performance/new' },
      ],
    },
    {
      label: 'Reports',
      children: [
        { label: 'Attendance Report', path: '/hr/reports/attendance' },
        { label: 'Leave Report', path: '/hr/reports/leave' },
        { label: 'Payroll Report', path: '/hr/reports/payroll' },
      ],
    },
  ],
  manager: [
    { label: 'Dashboard', path: '/manager/dashboard' },
    { label: 'My Team', path: '/manager/employees' },
    { label: 'My Profile', path: '/manager/profile' },
    {
      label: 'Attendance',
      children: [
        { label: 'Team Attendance', path: '/manager/attendance' },
        { label: 'My Attendance', path: '/manager/attendance/my' },
      ],
    },
    {
      label: 'Leave',
      children: [
        { label: 'Leave Approvals', path: '/manager/leaves' },
        { label: 'My Leaves', path: '/manager/leaves/my' },
      ],
    },
    { label: 'My Salary', path: '/manager/payroll/my' },
    {
      label: 'Performance',
      children: [
        { label: 'My Performance', path: '/manager/performance/my' },
        { label: 'New Evaluation', path: '/manager/performance/new' },
      ],
    },
    { label: 'Attendance Report', path: '/manager/reports/attendance' },
    { label: 'Leave Report', path: '/manager/reports/leave' },
  ],
  employee: [
    { label: 'Dashboard', path: '/employee/dashboard' },
    { label: 'My Attendance', path: '/employee/attendance/my' },
    { label: 'My Profile', path: '/employee/profile' },
    { label: 'My Leaves', path: '/employee/leaves/my' },
    { label: 'My Salary', path: '/employee/payroll/my' },
    { label: 'My Performance', path: '/employee/performance/my' },
  ],
}