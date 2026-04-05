const TZ = 'Asia/Kathmandu'

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    timeZone: TZ,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateTime(date) {
  return new Date(date).toLocaleString('en-US', {
    timeZone: TZ,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Returns "YYYY-MM-DDTHH:mm" in Nepal time — use as defaultValue for datetime-local inputs */
export function toNepalInputValue(dateStr) {
  if (!dateStr) return ''
  const d = new Date(new Date(dateStr).toLocaleString('en-US', { timeZone: TZ }))
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${mo}-${day}T${h}:${min}`
}

/**
 * Converts a datetime-local input string (e.g. "2026-04-05T08:00") treated as
 * Nepal time (UTC+5:45) into a UTC ISO string for sending to the backend.
 * This works regardless of the user's browser timezone setting.
 */
export function nepalInputToISO(localStr) {
  if (!localStr) return ''
  return new Date(localStr + '+05:45').toISOString()
}
