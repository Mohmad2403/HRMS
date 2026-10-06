const BADGES = {
  pending: 'bg-warning-subtle text-warning-emphasis',
  approved: 'bg-success-subtle text-success',
  rejected: 'bg-danger-subtle text-danger',
}

export const leaveStatusClass = (s) => `badge rounded-pill ${BADGES[s] || BADGES.pending}`
export const leaveStatusLabel = (s) => s.charAt(0).toUpperCase() + s.slice(1)