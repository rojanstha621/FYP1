import React from 'react'

export default function Alert({ type = 'info', children, className = '' }) {
  const base = 'p-3 rounded'
  const styles = {
    info: base + ' bg-blue-50 text-blue-800 border border-blue-100',
    success: base + ' bg-green-50 text-green-800 border border-green-100',
    error: base + ' bg-red-50 text-red-800 border border-red-100',
    warn: base + ' bg-yellow-50 text-yellow-800 border border-yellow-100',
  }
  const cls = (styles[type] || styles.info) + ' ' + className
  const role = type === 'error' ? 'alert' : 'status'
  const ariaLive = type === 'error' ? 'assertive' : 'polite'
  return (
    <div role={role} aria-live={ariaLive} className={cls}>
      {children}
    </div>
  )
}
