import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import FormInput from '../components/FormInput'
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
          <h1 id="login-heading" className="section-title">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-1">Safe care starts with trusted connections.</p>
        </div>

        {error && <Alert type="error" className="mb-4">{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-4" aria-labelledby="login-heading">
          <FormInput
            label="Email"
            name="email"
            type="email"
            icon={Mail}
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <FormInput
            label="Password"
            name="password"
            type="password"
            icon={Lock}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showPasswordToggle
            required
          />
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
