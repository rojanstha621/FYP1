import React from 'react'
import { Link } from 'react-router-dom'
import { useBookingHistory } from '../api/hooks'

export default function BookingHistory() {
  const { data: history, isLoading } = useBookingHistory()

  return (
    <div className="mt-8 max-w-4xl mx-auto px-4">
      <h2 className="text-xl font-semibold mb-4">Booking History</h2>

      {isLoading && <div className="text-gray-500">Loading...</div>}

      {!isLoading && history?.length === 0 && (
        <div className="text-gray-500 text-center py-8">
          No completed bookings yet
        </div>
      )}

      <div className="grid gap-3">
        {history?.map((booking) => (
          <div key={booking.id} className="bg-white shadow rounded-lg p-4">
            <div className="flex justify-between items-start">
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
                  {new Date(booking.start_date).toLocaleString()} — {new Date(booking.end_date).toLocaleString()}
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
        ))}
      </div>
    </div>
  )
}
