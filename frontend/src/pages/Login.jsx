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
    <div className="max-w-md mx-auto mt-24 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      {error && <Alert type="error" className="mb-3">{error}</Alert>}
      <form onSubmit={handleSubmit} className="space-y-4" aria-labelledby="login-heading">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium">Email</label>
          <input
            id="login-email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500">Login</button>
        </div>
      </form>
    </div>
  )
}
