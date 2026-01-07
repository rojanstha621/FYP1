import React, { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import Alert from '../components/Alert'

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
    <div className="mt-10">
      <div className="card max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Register</h1>
        {error && <Alert type="error" className="mb-3">{error}</Alert>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4" aria-labelledby="register-heading">
          <div>
            <label htmlFor="register-email" className="form-label">Email</label>
            <input id="register-email" name="email" placeholder="Email" onChange={handleChange} required className="form-input" />
          </div>
          <div>
            <label htmlFor="register-first" className="form-label">First name</label>
            <input id="register-first" name="first_name" placeholder="First name" onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label htmlFor="register-last" className="form-label">Last name</label>
            <input id="register-last" name="last_name" placeholder="Last name" onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label htmlFor="register-phone" className="form-label">Phone</label>
            <input id="register-phone" name="phone_number" placeholder="Phone" onChange={handleChange} className="form-input" />
          </div>
          <div>
            <label htmlFor="register-role" className="form-label">Role</label>
            <select id="register-role" name="role" onChange={handleChange} defaultValue="PARENT" className="form-input">
              <option value="PARENT">Parent</option>
              <option value="BABYSITTER">Babysitter</option>
            </select>
          </div>
          <div>
            <label htmlFor="register-password" className="form-label">Password</label>
            <input id="register-password" name="password" type="password" placeholder="Password" onChange={handleChange} required className="form-input" />
          </div>
          <div>
            <button type="submit" className="btn-primary w-full">Create account</button>
          </div>
        </form>
      </div>
    </div>
  )
}
