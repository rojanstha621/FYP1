import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function ProtectedRoute({ children, adminOnly = false, parentOnly = false, babysitterOnly = false }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="p-base">Loading...</div>

  if (!user) return <Navigate to="/login" replace />

  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />

  if (parentOnly && user.role !== 'PARENT') return <Navigate to="/dashboard" replace />

  if (babysitterOnly && user.role !== 'BABYSITTER') return <Navigate to="/dashboard" replace />

  return children
}
