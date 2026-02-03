import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useIncomingRequests, useAcceptRequest, useRejectRequest } from '../api/hooks'
import Alert from '../components/Alert'

export default function IncomingRequests() {
  const { data: requests, isLoading } = useIncomingRequests()
  const acceptRequest = useAcceptRequest()
  const rejectRequest = useRejectRequest()
  const [message, setMessage] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)

  const handleAccept = async (id) => {
    if (!window.confirm('Accept this booking request?')) return
    setMessage('')
    try {
      await acceptRequest.mutateAsync(id)
      setMessage('Request accepted successfully!')
    } catch (err) {
      setMessage('Failed to accept request')
    }
  }

  const handleReject = async (id) => {
    if (!window.confirm('Reject this booking request?')) return
    setMessage('')
    try {
      await rejectRequest.mutateAsync(id)
      setMessage('Request rejected')
    } catch (err) {
      setMessage('Failed to reject request')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) return <div className="mt-8 max-w-4xl mx-auto px-4">Loading...</div>

  return (
    <div className="mt-8 max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-semibold mb-6">Incoming Requests</h2>

      {message && (
        <Alert type={message.includes('Failed') ? 'error' : 'success'} className="mb-4">
          {message}
        </Alert>
      )}

      {requests?.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500">No incoming requests at this time</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests?.map((request) => (
            <div key={request.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">
                      {request.parent_email}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  {request.child_name && (
                    <p className="text-sm text-gray-600">Child: {request.child_name}</p>
                  )}
                </div>
                
                {request.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(request.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      disabled={acceptRequest.isLoading}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      disabled={rejectRequest.isLoading}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Start:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(request.start_date).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">End:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(request.end_date).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Hourly Rate:</span>
                  <span className="ml-2 text-gray-600">${request.hourly_rate}/hr</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Total Cost:</span>
                  <span className="ml-2 text-gray-600">${request.total_cost || 'TBD'}</span>
                </div>
              </div>

              {request.special_requirements && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm font-medium text-gray-700 mb-1">Special Requirements:</p>
                  <p className="text-sm text-gray-600">{request.special_requirements}</p>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <Link
                  to={`/babysitter/requests/${request.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
