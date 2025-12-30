import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function NavBar() {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white shadow" role="navigation" aria-label="Main navigation">
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <div>
          <Link to="/" className="font-bold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">FYP</Link>
        </div>
        <div className="space-x-4">
          {user ? (
            <>
              <span className="text-sm">Hi, {user.first_name}</span>
              <Link to="/profile" className="text-sm text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Profile</Link>
              {user.role === 'ADMIN' && (
                <Link to="/admin/users" className="text-sm text-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Users</Link>
              )}
              <button aria-label="Logout" onClick={logout} className="text-sm text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Login</Link>
              <Link to="/register" className="text-sm text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
