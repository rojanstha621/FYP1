import React, { useEffect, useState } from 'react'
import { subscribeToToasts } from './toastStore'

export default function ToastCenter() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const unsubscribe = subscribeToToasts((toast) => {
      const id = crypto.randomUUID()
      const normalizedToast = {
        id,
        type: toast.type || 'info',
        message: toast.message || 'Done',
        duration: typeof toast.duration === 'number' ? toast.duration : 3000,
      }

      setToasts((currentToasts) => [...currentToasts, normalizedToast])

      window.setTimeout(() => {
        setToasts((currentToasts) => currentToasts.filter((currentToast) => currentToast.id !== id))
      }, normalizedToast.duration)
    })

    return unsubscribe
  }, [])

  const removeToast = (id) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id))
  }

  if (!toasts.length) return null

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 w-[320px] max-w-[calc(100vw-2rem)]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-2xl border p-4 shadow-md bg-white transition-all duration-200 ${
            toast.type === 'success'
              ? 'border-emerald-200'
              : toast.type === 'error'
                ? 'border-red-200'
                : 'border-pink-100'
          }`}
          role={toast.type === 'error' ? 'alert' : 'status'}
          aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <span className={`mt-0.5 text-sm ${toast.type === 'success' ? 'text-emerald-500' : toast.type === 'error' ? 'text-red-500' : 'text-pink-500'}`}>
                {toast.type === 'success' ? '✓' : toast.type === 'error' ? '⚠' : '•'}
              </span>
              <p className="text-sm text-gray-700 leading-snug">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 transition-all duration-200"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
