import React from 'react'
import { useBabysitterHistory } from '../api/hooks'
import { formatDate, formatTime } from '../utils/date'

export default function BabysitterBookingHistory() {
  const { data: history, isLoading } = useBabysitterHistory()

  const totalEarnings = history?.reduce((sum, booking) => sum + parseFloat(booking.total_cost || 0), 0) || 0
  const totalHours = history?.reduce((sum, booking) => sum + parseFloat(booking.duration_hours || 0), 0) || 0

  if (isLoading) return <div className="page-wrap max-w-4xl mx-auto px-4">Loading...</div>

  return (
    <div className="page-wrap max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-bold tracking-tight mb-6">Booking History</h2>

      {history && history.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-3xl font-bold text-pink-600">rs{totalEarnings.toFixed(2)}</div>
            <div className="text-sm text-gray-600 mt-1">Total Earnings</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-pink-600">{history.length}</div>
            <div className="text-sm text-gray-600 mt-1">Completed Bookings</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-pink-600">{totalHours.toFixed(1)}</div>
            <div className="text-sm text-gray-600 mt-1">Hours Worked</div>
          </div>
        </div>
      )}

      {history?.length === 0 ? (
        <div className="card text-center">
          <p className="text-gray-500">No completed bookings yet</p>
          <p className="text-sm text-gray-400 mt-2">Your completed bookings will appear here</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-pink-50 border-b border-pink-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Parent</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Child</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rate</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {history?.map((booking) => (
                <tr key={booking.id} className="border-b border-pink-50 hover:bg-pink-50/40 transition-all duration-200">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.babysitter_info?.first_name} {booking.babysitter_info?.last_name}
                    </div>
                    <div className="text-xs text-gray-500">{booking.babysitter_info?.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{booking.child_name || 'N/A'}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{formatDate(booking.start_date)}</div>
                    <div className="text-xs text-gray-500">{formatTime(booking.start_date)}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{booking.duration_hours} hrs</td>
                  <td className="px-4 py-3 text-sm text-gray-900">rs{booking.hourly_rate}/hr</td>
                  <td className="px-4 py-3 text-sm font-semibold text-pink-600">rs{booking.total_cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
