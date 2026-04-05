import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMyBookings, useCompleteBooking } from '../api/hooks'
import Alert from '../components/Alert'
import { formatDateTime } from '../utils/date'

export default function MyBookings() {
  const { data: bookings, isLoading } = useMyBookings()
  const completeBooking = useCompleteBooking()
  const [message, setMessage] = useState('')

  const handleComplete = async (id) => {
    if (!window.confirm('Mark this booking as completed?')) return
    setMessage('')
    try {
      await completeBooking.mutateAsync(id)
      setMessage('Booking marked as completed!')
    } catch (err) {
      setMessage('Failed to complete booking')
    }
  }

  const isPast = (endDate) => {
    return new Date(endDate) < new Date()
  }

  const isUpcoming = (startDate) => {
    return new Date(startDate) > new Date()
  }

  const isCurrent = (startDate, endDate) => {
    const now = new Date()
    return new Date(startDate) <= now && new Date(endDate) >= now
  }

  const getBookingStatus = (booking) => {
    if (isPast(booking.end_date)) return { label: 'Past', color: 'status-cancelled' }
    if (isCurrent(booking.start_date, booking.end_date)) return { label: 'Ongoing', color: 'status-pending' }
    if (isUpcoming(booking.start_date)) return { label: 'Upcoming', color: 'status-accepted' }
    return { label: 'Unknown', color: 'status-cancelled' }
  }

  if (isLoading) return <div className="page-wrap max-w-4xl mx-auto px-4">Loading...</div>

  const upcomingBookings = bookings?.filter(b => isUpcoming(b.start_date)) || []
  const currentBookings = bookings?.filter(b => isCurrent(b.start_date, b.end_date)) || []
  const pastBookings = bookings?.filter(b => isPast(b.end_date)) || []

  return (
    <div className="page-wrap max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-bold tracking-tight mb-6">My Bookings</h2>

      {message && (
        <Alert type={message.includes('Failed') ? 'error' : 'success'} className="mb-4">
          {message}
        </Alert>
      )}

      {/* Current Bookings */}
      {currentBookings.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-pink-500 rounded-full animate-pulse"></span>
            Ongoing Bookings
          </h3>
          <div className="grid gap-4">
            {currentBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onComplete={handleComplete}
                status={getBookingStatus(booking)}
                showCompleteButton
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Upcoming Bookings</h3>
          <div className="grid gap-4">
            {upcomingBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                status={getBookingStatus(booking)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past Bookings (ready to complete) */}
      {pastBookings.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Ready to Complete</h3>
          <div className="grid gap-4">
            {pastBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onComplete={handleComplete}
                status={getBookingStatus(booking)}
                showCompleteButton
              />
            ))}
          </div>
        </div>
      )}

      {bookings?.length === 0 && (
        <div className="card text-center">
          <p className="text-gray-500">No active bookings at this time</p>
          <Link to="/babysitter/requests" className="text-pink-600 hover:text-pink-700 mt-2 inline-block transition-all duration-200">
            Check Incoming Requests
          </Link>
        </div>
      )}
    </div>
  )
}

function BookingCard({ booking, onComplete, status, showCompleteButton }) {
  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold">
              {booking.parent_email}
            </h3>
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
          {booking.child_name && (
            <p className="text-sm text-gray-600">Child: {booking.child_name}</p>
          )}
        </div>

        {showCompleteButton && (
          <button
            onClick={() => onComplete(booking.id)}
            className="btn-primary"
          >
            Mark Complete
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">Start:</span>
          <span className="ml-2 text-gray-600">
            {formatDateTime(booking.start_date)}
          </span>
        </div>
        <div>
          <span className="font-medium text-gray-700">End:</span>
          <span className="ml-2 text-gray-600">
            {formatDateTime(booking.end_date)}
          </span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Rate:</span>
          <span className="ml-2 text-gray-600">${booking.hourly_rate}/hr</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Total:</span>
          <span className="ml-2 text-gray-600 font-semibold">${booking.total_cost || 'TBD'}</span>
        </div>
      </div>

      {booking.special_requirements && (
        <div className="mt-4 p-3 bg-pink-50 border border-pink-100 rounded-2xl">
          <p className="text-sm font-medium text-gray-700 mb-1">Special Requirements:</p>
          <p className="text-sm text-gray-600">{booking.special_requirements}</p>
        </div>
      )}
    </div>
  )
}
