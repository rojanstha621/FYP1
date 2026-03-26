import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'
import { AuthProvider } from './auth/AuthContext'
import { pushToast } from './components/toastStore'

const getErrorMessage = (error) => {
  if (error?.response?.data?.detail) return error.response.data.detail

  if (error?.response?.data && typeof error.response.data === 'object') {
    const messages = Object.values(error.response.data)
      .flat()
      .filter(Boolean)

    if (messages.length) return String(messages[0])
  }

  return error?.message || 'Request failed'
}

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      const successMessage = mutation?.options?.meta?.successMessage || 'Request completed successfully'
      pushToast({ type: 'success', message: successMessage })
    },
    onError: (error, _variables, _context, mutation) => {
      const errorMessage = mutation?.options?.meta?.errorMessage || getErrorMessage(error)
      pushToast({ type: 'error', message: errorMessage })
    },
  }),
})

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
