import React, { useMemo, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useMe } from '../api/hooks'
import { resolveImageUrl } from '../utils/image'
import logo from '../assets/logo.png'

export default function NavBar() {
  const { user, logout } = useAuth()
  const { data: meData } = useMe()
  const [openMenu, setOpenMenu] = useState(false)
  const [openProfile, setOpenProfile] = useState(false)

  const initials = useMemo(() => {
    const first = user?.first_name?.[0] || ''
    const last = user?.last_name?.[0] || ''
    return `${first}${last}`.toUpperCase() || 'U'
  }, [user])

  const profileImage = resolveImageUrl(meData?.profile?.profile_picture)

  const parentLinks = [
    { to: '/babysitters', label: 'Babysitters' },
    { to: '/children', label: 'Children' },
    { to: '/requests', label: 'Requests' },
    { to: '/stories', label: 'Stories' },
    { to: '/history', label: 'History' },
    { to: '/reviews', label: 'Reviews' },
  ]

  const babysitterLinks = [
    { to: '/babysitter/requests', label: 'Requests' },
    { to: '/babysitter/bookings', label: 'My Bookings' },
    { to: '/babysitter/stories', label: 'Stories' },
    { to: '/babysitter/availability', label: 'Availability' },
    { to: '/babysitter/reviews', label: 'Reviews' },
    { to: '/babysitter/history', label: 'History' },
  ]

  const adminLinks = [{ to: '/admin/users', label: 'Users' }]

  const links = user?.role === 'PARENT'
    ? parentLinks
    : user?.role === 'BABYSITTER'
      ? babysitterLinks
      : user?.role === 'ADMIN'
        ? adminLinks
        : []

  const navItemClass = ({ isActive }) =>
    `text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'text-pink-600 border-b-2 border-pink-500 pb-1'
        : 'text-gray-600 hover:text-pink-600'
    }`

  return (
    <nav className="bg-white border-b border-pink-100" role="navigation" aria-label="Main navigation">
      <div className="container-main flex items-center justify-between py-3">
        <Link
          to="/"
          className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-pink-400 rounded-xl"
        >
          <img src={logo} alt="FYP logo" className="h-10 w-auto" />
          <span className="font-bold text-lg text-[#1A1A2E] hidden sm:inline">BabyEase</span>
        </Link>

        <button
          type="button"
          onClick={() => setOpenMenu(true)}
          className="md:hidden inline-flex items-center justify-center rounded-full border border-pink-200 p-2 text-pink-600"
          aria-label="Open menu"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="hidden md:flex items-center gap-5">
          <NavLink to="/dashboard" className={navItemClass}>Dashboard</NavLink>

          {links.map((item) => (
            <NavLink key={item.to} to={item.to} className={navItemClass}>
              {item.label}
            </NavLink>
          ))}

          {user ? (
            <div className="flex items-center gap-3">
              <button type="button" className="relative rounded-full border border-pink-200 p-2 text-pink-600 hover:bg-pink-50 transition-all duration-200" aria-label="Notifications">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5" />
                  <path d="M9 17a3 3 0 006 0" />
                </svg>
                <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-[#FF6B9D] text-[10px] text-white leading-4 text-center px-1">1</span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenProfile((prev) => !prev)}
                  className="h-10 w-10 rounded-full bg-pink-100 text-pink-700 font-semibold border border-pink-200 overflow-hidden"
                >
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </button>

                {openProfile && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-pink-100 bg-white shadow-md p-2 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setOpenProfile(false)}
                      className="block rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-pink-50"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left rounded-xl px-3 py-2 text-sm text-red-500 hover:bg-pink-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </div>
          )}
        </div>
      </div>

      {openMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={() => setOpenMenu(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-white border-l border-pink-100 shadow-md p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#1A1A2E]">Menu</span>
              <button type="button" className="text-pink-600" onClick={() => setOpenMenu(false)}>✕</button>
            </div>
            <NavLink to="/dashboard" onClick={() => setOpenMenu(false)} className="text-gray-700">Dashboard</NavLink>
            {links.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setOpenMenu(false)} className="text-gray-700">
                {item.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <NavLink to="/profile" onClick={() => setOpenMenu(false)} className="text-gray-700">Profile</NavLink>
                <button onClick={logout} className="btn-primary w-full">Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={() => setOpenMenu(false)} className="btn-secondary w-full">Login</NavLink>
                <NavLink to="/register" onClick={() => setOpenMenu(false)} className="btn-primary w-full">Register</NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
