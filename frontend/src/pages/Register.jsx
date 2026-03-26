import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Alert from '../components/Alert'
import logo from '../assets/logo.png'

export default function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    role: 'PARENT',
    password: '',
  })
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(form)
    } catch (err) {
      setError('Registration failed')
    }
  }

  return (
    <div className="min-h-[calc(100vh-220px)] bg-gradient-to-b from-pink-50 to-pink-100 rounded-2xl flex items-center justify-center px-4 py-10">
      <div className="card max-w-lg w-full">
        <div className="text-center mb-6">
          <img src={logo} alt="BabyEase logo" className="h-14 w-auto mx-auto mb-3" />
          <h1 id="register-heading" className="text-2xl font-bold tracking-tight">Create Your Account</h1>
          <p className="text-sm text-gray-500 mt-1">Join as a parent or babysitter in a few steps.</p>
        </div>

        {error && <Alert type="error" className="mb-3">{error}</Alert>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4" aria-labelledby="register-heading">
          <div>
            <label className="form-label">Role</label>
            <div className="flex gap-2 rounded-full bg-pink-50 p-1 border border-pink-100">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'PARENT' })}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  form.role === 'PARENT'
                    ? 'bg-[#FF6B9D] text-white shadow-sm'
                    : 'text-pink-600 hover:bg-pink-100'
                }`}
              >
                Parent
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'BABYSITTER' })}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  form.role === 'BABYSITTER'
                    ? 'bg-[#FF6B9D] text-white shadow-sm'
                    : 'text-pink-600 hover:bg-pink-100'
                }`}
              >
                Babysitter
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="register-email" className="form-label">Email</label>
            <input id="register-email" name="email" placeholder="Email" onChange={handleChange} required className="form-input" value={form.email} />
          </div>
          <div>
            <label htmlFor="register-first" className="form-label">First name</label>
            <input id="register-first" name="first_name" placeholder="First name" onChange={handleChange} className="form-input" value={form.first_name} />
          </div>
          <div>
            <label htmlFor="register-last" className="form-label">Last name</label>
            <input id="register-last" name="last_name" placeholder="Last name" onChange={handleChange} className="form-input" value={form.last_name} />
          </div>
          <div>
            <label htmlFor="register-phone" className="form-label">Phone</label>
            <input id="register-phone" name="phone_number" placeholder="Phone" onChange={handleChange} className="form-input" value={form.phone_number} />
          </div>
          <div>
            <label htmlFor="register-password" className="form-label">Password</label>
            <input id="register-password" name="password" type="password" placeholder="Password" onChange={handleChange} required className="form-input" value={form.password} />
          </div>
          <div>
            <button type="submit" className="btn-primary w-full">Create account</button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-pink-600 font-medium hover:text-pink-700 transition-all duration-200">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
