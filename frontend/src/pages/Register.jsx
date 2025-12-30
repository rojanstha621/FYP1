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
    <div className="max-w-lg mx-auto mt-16 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-semibold mb-4">Register</h1>
      {error && <Alert type="error" className="mb-3">{error}</Alert>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4" aria-labelledby="register-heading">
        <div>
          <label htmlFor="register-email" className="block text-sm font-medium">Email</label>
          <input id="register-email" name="email" placeholder="Email" onChange={handleChange} required className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label htmlFor="register-first" className="block text-sm font-medium">First name</label>
          <input id="register-first" name="first_name" placeholder="First name" onChange={handleChange} className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label htmlFor="register-last" className="block text-sm font-medium">Last name</label>
          <input id="register-last" name="last_name" placeholder="Last name" onChange={handleChange} className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label htmlFor="register-phone" className="block text-sm font-medium">Phone</label>
          <input id="register-phone" name="phone_number" placeholder="Phone" onChange={handleChange} className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label htmlFor="register-role" className="block text-sm font-medium">Role</label>
          <select id="register-role" name="role" onChange={handleChange} defaultValue="PARENT" className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500">
            <option value="PARENT">Parent</option>
            <option value="BABYSITTER">Babysitter</option>
          </select>
        </div>
        <div>
          <label htmlFor="register-password" className="block text-sm font-medium">Password</label>
          <input id="register-password" name="password" type="password" placeholder="Password" onChange={handleChange} required className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500" />
        </div>
        <button type="submit" className="bg-green-600 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500">Create account</button>
      </form>
    </div>
  )
}
