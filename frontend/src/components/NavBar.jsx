import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import logo from '../assets/logo.png'

export default function NavBar() {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white shadow" role="navigation" aria-label="Main navigation">
      <div className="container-main flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            <img src={logo} alt="FYP logo" className="h-12 w-auto" />
          
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-sm muted">Dashboard</Link>
          {user ? (
            <>
              <span className="text-sm muted">Hi, {user.first_name}</span>
              <Link to="/profile" className="text-sm text-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-300">Profile</Link>
              {user.role === 'ADMIN' && (
                <Link to="/admin/users" className="text-sm text-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-300">Users</Link>
              )}
              <button aria-label="Logout" onClick={logout} className="btn-secondary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-300">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
