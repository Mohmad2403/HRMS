export const ratingStars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n)

export const overallBadge = (score) => {
  if (score >= 4.5) return 'bg-success-subtle text-success'
  if (score >= 3.5) return 'bg-primary-subtle text-primary'
  if (score >= 2.5) return 'bg-warning-subtle text-warning-emphasis'
  return 'bg-danger-subtle text-danger'
}