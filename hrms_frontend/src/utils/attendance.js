export const fmtTime = (t) => (t ? t.slice(0, 8) : '--')

export const fmtHours = (h) => {
  if (h === null || h === undefined) return '--'
  const mins = Math.round(h * 60)
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

const BADGES = {
  present: 'bg-success-subtle text-success',
  late: 'bg-warning-subtle text-warning-emphasis',
  half_day: 'bg-info-subtle text-info-emphasis',
  absent: 'bg-danger-subtle text-danger',
  leave: 'bg-secondary-subtle text-secondary',
}

export const statusClass = (s) => `badge rounded-pill ${BADGES[s] || BADGES.leave}`
export const statusLabel = (s) => s.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())