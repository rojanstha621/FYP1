import React from 'react'
import { useBabysitterHistory } from '../api/hooks'

export default function BabysitterBookingHistory() {
  const { data: history, isLoading } = useBabysitterHistory()

  const totalEarnings = history?.reduce((sum, booking) => sum + parseFloat(booking.total_cost || 0), 0) || 0
  const totalHours = history?.reduce((sum, booking) => sum + parseFloat(booking.duration_hours || 0), 0) || 0

  if (isLoading) return <div className="mt-8 max-w-4xl mx-auto px-4">Loading...</div>

  return (
    <div className="mt-8 max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-semibold mb-6">Booking History</h2>

      {/* Summary Stats */}
      {history && history.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600">${totalEarnings.toFixed(2)}</div>
            <div className="text-sm text-gray-600 mt-1">Total Earnings</div>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{history.length}</div>
            <div className="text-sm text-gray-600 mt-1">Completed Bookings</div>
          </div>
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{totalHours.toFixed(1)}</div>
            <div className="text-sm text-gray-600 mt-1">Hours Worked</div>
          </div>
        </div>
      )}

      {/* History List */}
      {history?.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500">No completed bookings yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Your completed bookings will appear here
          </p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Child
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Earnings
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history?.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.babysitter_info?.first_name} {booking.babysitter_info?.last_name}
                    </div>
                    <div className="text-xs text-gray-500">{booking.babysitter_info?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.child_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(booking.start_date).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(booking.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.duration_hours} hrs
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${booking.hourly_rate}/hr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    ${booking.total_cost}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
