import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function FormInput({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  icon: Icon,
  showPasswordToggle = false,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)

  const inputType = showPassword ? 'text' : type

  return (
    <div className="form-group">
      {label && (
        <label className={required ? 'form-label form-label-required' : 'form-label'}>
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon size={18} />
          </div>
        )}
        <input
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`form-input ${Icon ? 'pl-10' : ''} ${error ? 'form-input-error' : ''}`}
          {...props}
        />
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="form-error-text">{error}</span>}
    </div>
  )
}
