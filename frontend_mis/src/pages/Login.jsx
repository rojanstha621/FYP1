import React, { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import Alert from '../components/Alert'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login({ email, password })
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    }
  }

  return (
    <div className="mt-12">
      <div className="card max-w-md mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Login</h1>
        {error && <Alert type="error" className="mb-3">{error}</Alert>}
        <form onSubmit={handleSubmit} className="space-y-4" aria-labelledby="login-heading">
          <div>
            <label htmlFor="login-email" className="form-label">Email</label>
            <input
              id="login-email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div>
            <label htmlFor="login-password" className="form-label">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div>
            <button type="submit" className="btn-primary w-full">Login</button>
          </div>
        </form>
      </div>
    </div>
  )
}
