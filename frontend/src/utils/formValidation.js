export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = (password) => {
  if (password.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter'
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter'
  if (!/[0-9]/.test(password)) return 'Password must contain a number'
  return ''
}

export const getPasswordStrength = (password) => {
  let strength = 0
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++

  const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const colors = ['bg-red-100', 'bg-orange-100', 'bg-yellow-100', 'bg-blue-100', 'bg-green-100', 'bg-emerald-100']

  return {
    level: levels[Math.min(strength, 5)],
    color: colors[Math.min(strength, 5)],
    strength: Math.min(strength, 5),
  }
}
