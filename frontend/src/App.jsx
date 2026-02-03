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

// Babysitter pages
import IncomingRequests from './pages/IncomingRequests'
import MyBookings from './pages/MyBookings'
import BabysitterReviews from './pages/BabysitterReviews'
import BabysitterBookingHistory from './pages/BabysitterBookingHistory'

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

        {/* Babysitter Routes */}
        <Route
          path="/babysitter/requests"
          element={
            <ProtectedRoute babysitterOnly>
              <IncomingRequests />
            </ProtectedRoute>
          }
        />

        <Route
          path="/babysitter/bookings"
          element={
            <ProtectedRoute babysitterOnly>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/babysitter/reviews"
          element={
            <ProtectedRoute babysitterOnly>
              <BabysitterReviews />
            </ProtectedRoute>
          }
        />

        <Route
          path="/babysitter/history"
          element={
            <ProtectedRoute babysitterOnly>
              <BabysitterBookingHistory />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  )
}
