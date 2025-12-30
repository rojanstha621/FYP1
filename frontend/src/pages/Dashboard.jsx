import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Welcome, {user?.first_name}</h1>
        <div>
          <button onClick={logout} className="mr-4 text-sm text-red-600">Logout</button>
          <Link to="/profile" className="text-sm text-blue-600">My Profile</Link>
        </div>
      </div>

      <div className="mt-6">
        <p>This is a placeholder dashboard. Use the navigation or visit /admin/users if you're an admin.</p>
      </div>
    </div>
  )
}
