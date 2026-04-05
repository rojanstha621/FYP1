import React, { useState } from 'react'
import { useIncomingRequests, useAcceptRequest, useRejectRequest } from '../api/hooks'
import Alert from '../components/Alert'
import { formatDateTime } from '../utils/date'

export default function IncomingRequests() {
  const { data: requests, isLoading } = useIncomingRequests()
  const acceptRequest = useAcceptRequest()
  const rejectRequest = useRejectRequest()
  const [message, setMessage] = useState('')

  const handleAccept = async (id) => {
    if (!window.confirm('Accept this booking request?')) return
    setMessage('')
    try {
      await acceptRequest.mutateAsync(id)
      setMessage('Request accepted successfully!')
    } catch {
      setMessage('Failed to accept request')
    }
  }

  const handleReject = async (id) => {
    if (!window.confirm('Reject this booking request?')) return
    setMessage('')
    try {
      await rejectRequest.mutateAsync(id)
      setMessage('Request rejected')
    } catch {
      setMessage('Failed to reject request')
    }
  }

  const getStatusClass = (status) => {
    if (status === 'PENDING') return 'status-pending'
    if (status === 'ACCEPTED') return 'status-accepted'
    if (status === 'REJECTED') return 'status-rejected'
    return 'status-cancelled'
  }

  if (isLoading) return <div className="page-wrap max-w-4xl mx-auto px-4">Loading...</div>

  return (
    <div className="page-wrap max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-bold tracking-tight mb-6">Incoming Requests</h2>

      {message && (
        <Alert type={message.includes('Failed') ? 'error' : 'success'} className="mb-4">
          {message}
        </Alert>
      )}

      {requests?.length === 0 ? (
        <div className="card text-center">
          <p className="text-gray-500">No incoming requests at this time</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests?.map((request) => (
            <div key={request.id} className="card">
              <div className="flex justify-between items-start mb-4 gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold">{request.parent_email}</h3>
                    <span className={getStatusClass(request.status)}>{request.status}</span>
                  </div>
                  {request.child_name && <p className="text-sm text-gray-600">Child: {request.child_name}</p>}
                </div>

                {request.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAccept(request.id)}
                      className="btn-primary"
                      disabled={acceptRequest.isLoading}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="btn-secondary text-red-500"
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
                  <span className="ml-2 text-gray-600">{formatDateTime(request.start_date)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">End:</span>
                  <span className="ml-2 text-gray-600">{formatDateTime(request.end_date)}</span>
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
                <div className="mt-4 p-3 bg-pink-50 border border-pink-100 rounded-2xl">
                  <p className="text-sm font-medium text-gray-700 mb-1">Special Requirements:</p>
                  <p className="text-sm text-gray-600">{request.special_requirements}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
