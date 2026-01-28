import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import AdminUsers from './pages/AdminUsers'
import AdminUserDetail from './pages/AdminUserDetail'
import ProtectedRoute from './components/ProtectedRoute'
import Babysitters from './pages/Babysitters'
import BabysitterDetail from './pages/BabysitterDetail'
import Children from './pages/Children'
import Requests from './pages/Requests'
import RequestDetail from './pages/RequestDetail'
import BookingHistory from './pages/BookingHistory'
import Reviews from './pages/Reviews'

import Layout from './components/Layout'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users/:id"
          element={
            <ProtectedRoute adminOnly>
              <AdminUserDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/babysitters"
          element={
            <ProtectedRoute parentOnly>
              <Babysitters />
            </ProtectedRoute>
          }
        />

        <Route
          path="/babysitters/:id"
          element={
            <ProtectedRoute parentOnly>
              <BabysitterDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/children"
          element={
            <ProtectedRoute parentOnly>
              <Children />
            </ProtectedRoute>
          }
        />

        <Route
          path="/requests"
          element={
            <ProtectedRoute parentOnly>
              <Requests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/requests/:id"
          element={
            <ProtectedRoute parentOnly>
              <RequestDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute parentOnly>
              <BookingHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reviews"
          element={
            <ProtectedRoute parentOnly>
              <Reviews />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  )
}
