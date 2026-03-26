import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Alert from '../components/Alert'
import logo from '../assets/logo.png'

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
    <div className="min-h-[calc(100vh-220px)] bg-gradient-to-b from-pink-50 to-pink-100 rounded-2xl flex items-center justify-center px-4 py-10">
      <div className="card max-w-md w-full">
        <div className="text-center mb-6">
          <img src={logo} alt="BabyEase logo" className="h-14 w-auto mx-auto mb-3" />
          <h1 id="login-heading" className="text-2xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-1">Safe care starts with trusted connections.</p>
        </div>

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

        <p className="text-center text-sm text-gray-600 mt-5">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-pink-600 font-medium hover:text-pink-700 transition-all duration-200">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
