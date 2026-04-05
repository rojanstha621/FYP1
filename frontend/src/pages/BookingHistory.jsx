import React from 'react'
import { Link } from 'react-router-dom'
import { useBookingHistory } from '../api/hooks'
import { formatDateTime } from '../utils/date'

export default function BookingHistory() {
  const { data: history, isLoading } = useBookingHistory()

  const statusBadge = (status) => {
    if (status === 'PENDING') return 'status-pending'
    if (status === 'ACCEPTED') return 'status-accepted'
    if (status === 'REJECTED') return 'status-rejected'
    if (status === 'CANCELLED') return 'status-cancelled'
    return 'status-completed'
  }

  return (
    <div className="page-wrap max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-bold tracking-tight mb-4">Booking History</h2>

      {isLoading && <div className="text-gray-500">Loading...</div>}

      {!isLoading && history?.length === 0 && (
        <div className="text-gray-500 text-center py-8">
          No completed bookings yet
        </div>
      )}

      <div className="space-y-4">
        {history?.map((booking) => (
          <div key={booking.id} className="relative pl-8">
            <div className="absolute left-2 top-3 h-full w-px bg-pink-100" />
            <div className="absolute left-0 top-3 h-4 w-4 rounded-full bg-pink-400" />
            <div className="card">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="font-medium text-lg mb-1">
                    {booking.child_name || 'No child assigned'}
                  </div>

                  {booking.babysitter_info && (
                    <div className="text-sm text-textSecondary">
                      Babysitter: {booking.babysitter_info.first_name} {booking.babysitter_info.last_name}
                    </div>
                  )}

                  <div className="text-sm text-textSecondary mt-1">
                    {formatDateTime(booking.start_date)} — {formatDateTime(booking.end_date)}
                  </div>

                  <div className="mt-2">
                    <span className={statusBadge(booking.status || 'COMPLETED')}>
                      {booking.status || 'COMPLETED'}
                    </span>
                  </div>

                  <div className="flex gap-4 mt-2 text-sm">
                    <span>
                      <span className="font-medium">Duration:</span> {booking.duration_hours} hours
                    </span>
                    <span>
                      <span className="font-medium">Rate:</span> ${parseFloat(booking.hourly_rate).toFixed(2)}/hr
                    </span>
                    <span>
                      <span className="font-medium">Total:</span> ${parseFloat(booking.total_cost).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link
                    to={`/requests/${booking.id}`}
                    className="btn-secondary text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
