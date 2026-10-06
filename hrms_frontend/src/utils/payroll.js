export const money = (n) =>
  Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })

export const monthName = (m) =>
  ['', 'January', 'February', 'March', 'April', 'May', 'June',
   'July', 'August', 'September', 'October', 'November', 'December'][m]

export const payslipStatusClass = (s) =>
  `badge rounded-pill ${s === 'paid' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'}`