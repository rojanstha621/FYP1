import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import logo from '../assets/logo.png'

export default function NavBar() {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-primary shadow border-b border-divider" role="navigation" aria-label="Main navigation">
      <div className="container-main flex items-center justify-between py-3 md:py-4">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
        >
          <img src={logo} alt="FYP logo" className="h-12 w-auto md:h-14" />
          <span className="font-bold text-lg text-white hidden md:inline">BabyEase</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-sm text-muted hover:text-white transition-colors">
            Dashboard
          </Link>

          {user ? (
            <>
              {/* Parent specific links */}
              {user.role === 'PARENT' && (
                <>
                  <Link to="/babysitters" className="text-sm text-accent hover:underline">Babysitters</Link>
                  <Link to="/children" className="text-sm text-accent hover:underline">Children</Link>
                  <Link to="/requests" className="text-sm text-accent hover:underline">Requests</Link>
                  <Link to="/history" className="text-sm text-accent hover:underline">History</Link>
                  <Link to="/reviews" className="text-sm text-accent hover:underline">Reviews</Link>
                </>
              )}

              <Link 
                to="/profile" 
                className="text-sm text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-accent transition"
              >
                Profile
              </Link>
              {user.role === 'ADMIN' && (
                <Link 
                  to="/admin/users" 
                  className="text-sm text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-accent transition"
                >
                  Users
                </Link>
              )}
              <button 
                onClick={logout} 
                className="ml-2 px-4 py-1 bg-accent text-white rounded hover:bg-accent-dark transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-sm text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-accent transition"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="ml-2 px-4 py-1 bg-accent text-white rounded hover:bg-accent-dark transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
