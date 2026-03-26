let listeners = []
const PENDING_TOAST_KEY = 'pending_toast'

export function subscribeToToasts(listener) {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((currentListener) => currentListener !== listener)
  }
}

export function pushToast(payload) {
  listeners.forEach((listener) => listener(payload))
}

export function setPendingToast(payload) {
  try {
    sessionStorage.setItem(PENDING_TOAST_KEY, JSON.stringify(payload))
  } catch {
    // ignore storage errors
  }
}

export function popPendingToast() {
  try {
    const rawValue = sessionStorage.getItem(PENDING_TOAST_KEY)
    if (!rawValue) return null
    sessionStorage.removeItem(PENDING_TOAST_KEY)
    return JSON.parse(rawValue)
  } catch {
    return null
  }
}
