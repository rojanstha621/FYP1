import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Lock, Phone, User, FileText } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import FormInput from '../components/FormInput'
import Alert from '../components/Alert'
import logo from '../assets/logo.png'
import { validateEmail, validatePassword, getPasswordStrength } from '../utils/formValidation'

export default function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    role: 'PARENT',
    password: '',
    confirmPassword: '',
  })
  const [citizenshipDoc, setCitizenshipDoc] = useState(null)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handleBlur = (field) => {
    const newErrors = { ...errors }

    switch (field) {
      case 'email':
        if (!form.email) newErrors.email = 'Email is required'
        else if (!validateEmail(form.email)) newErrors.email = 'Invalid email format'
        else delete newErrors.email
        break
      case 'first_name':
        if (!form.first_name) newErrors.first_name = 'First name is required'
        else delete newErrors.first_name
        break
      case 'last_name':
        if (!form.last_name) newErrors.last_name = 'Last name is required'
        else delete newErrors.last_name
        break
      case 'password':
        const pwError = validatePassword(form.password)
        if (pwError) newErrors.password = pwError
        else delete newErrors.password
        break
      case 'confirmPassword':
        if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
        else delete newErrors.confirmPassword
        break
      default:
        break
    }

    setErrors(newErrors)
  }

  const handleDocChange = (e) => {
    setCitizenshipDoc(e.target.files[0] || null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate all fields
    const newErrors = {}
    if (!form.email || !validateEmail(form.email)) newErrors.email = 'Valid email is required'
    if (!form.first_name) newErrors.first_name = 'First name is required'
    if (!form.last_name) newErrors.last_name = 'Last name is required'
    const pwError = validatePassword(form.password)
    if (pwError) newErrors.password = pwError
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await register(form, citizenshipDoc)
    } catch (err) {
      setError('Registration failed. Please try again.')
    }
  }

  const passwordStrength = form.password ? getPasswordStrength(form.password) : null

  return (
    <div className="min-h-[calc(100vh-220px)] bg-gradient-to-b from-pink-50 to-pink-100 rounded-2xl flex items-center justify-center px-4 py-10">
      <div className="card max-w-lg w-full">
        <div className="text-center mb-6">
          <img src={logo} alt="BabyEase logo" className="h-14 w-auto mx-auto mb-3" />
          <h1 id="register-heading" className="section-title">Create Your Account</h1>
          <p className="text-sm text-gray-500 mt-1">Join as a parent or babysitter in a few steps.</p>
        </div>

        {error && <Alert type="error" className="mb-4">{error}</Alert>}

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

          <FormInput
            label="Email"
            name="email"
            type="email"
            icon={Mail}
            placeholder="your@email.com"
            value={form.email}
            onChange={handleChange}
            onBlur={() => handleBlur('email')}
            error={errors.email}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="First name"
              name="first_name"
              icon={User}
              placeholder="First"
              value={form.first_name}
              onChange={handleChange}
              onBlur={() => handleBlur('first_name')}
              error={errors.first_name}
              required
            />
            <FormInput
              label="Last name"
              name="last_name"
              placeholder="Last"
              value={form.last_name}
              onChange={handleChange}
              onBlur={() => handleBlur('last_name')}
              error={errors.last_name}
              required
            />
          </div>

          <FormInput
            label="Phone"
            name="phone_number"
            type="tel"
            icon={Phone}
            placeholder="+1 (555) 000-0000"
            value={form.phone_number}
            onChange={handleChange}
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            icon={Lock}
            placeholder="Create a strong password"
            value={form.password}
            onChange={handleChange}
            onBlur={() => handleBlur('password')}
            error={errors.password}
            showPasswordToggle
            required
          />

          {passwordStrength && (
            <div className="space-y-1">
              <div className="text-xs text-gray-600">Password strength: <span className="font-medium">{passwordStrength.level}</span></div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${passwordStrength.color} transition-all duration-300`}
                  style={{ width: `${(passwordStrength.strength + 1) * 16.67}%` }}
                />
              </div>
            </div>
          )}

          <FormInput
            label="Confirm password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={handleChange}
            onBlur={() => handleBlur('confirmPassword')}
            error={errors.confirmPassword}
            required
          />

          {form.role === 'BABYSITTER' && (
            <div className="form-group">
              <label htmlFor="citizenship-doc" className="form-label">
                <div className="flex items-center gap-1">
                  <FileText size={16} />
                  Citizenship Document (Optional)
                </div>
              </label>
              <input
                id="citizenship-doc"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleDocChange}
                className="form-input cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">Upload passport, ID, or citizenship certificate (PDF, DOC, JPG)</p>
              {citizenshipDoc && <p className="text-sm text-green-600 mt-1">✓ {citizenshipDoc.name}</p>}
            </div>
          )}

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
