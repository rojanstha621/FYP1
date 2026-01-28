import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useRequestDetail, useUpdateRequest, useDeleteRequest, useCancelRequest } from '../api/hooks'
import Alert from '../components/Alert'

export default function RequestDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: request, isLoading } = useRequestDetail(id)
  const updateRequest = useUpdateRequest()
  const deleteRequest = useDeleteRequest()
  const cancelRequest = useCancelRequest()
  const [message, setMessage] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const handleUpdate = async (e) => {
    e.preventDefault()
    setMessage('')
    const data = new FormData(e.target)
    
    try {
      await updateRequest.mutateAsync({
        id,
        payload: {
          start_date: data.get('start_date'),
          end_date: data.get('end_date'),
          hourly_rate: parseFloat(data.get('hourly_rate')),
          special_requirements: data.get('special_requirements'),
        },
      })
      setMessage('Request updated successfully')
      setIsEditing(false)
    } catch (err) {
      setMessage('Failed to update request')
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return
    setMessage('')
    try {
      await cancelRequest.mutateAsync(id)
      setMessage('Request cancelled successfully')
    } catch (err) {
      setMessage('Failed to cancel request')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this request? This cannot be undone.')) return
    try {
      await deleteRequest.mutateAsync(id)
      navigate('/requests')
    } catch (err) {
      setMessage('Failed to delete request')
    }
  }

  if (isLoading) {
    return (
      <div className="mt-8 max-w-4xl mx-auto px-4">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="mt-8 max-w-4xl mx-auto px-4">
        <div className="text-gray-500">Request not found</div>
        <Link to="/requests" className="text-primary hover:underline mt-2 inline-block">
          Back to Requests
        </Link>
      </div>
    )
  }

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ACCEPTED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
  }

  const canEdit = ['PENDING', 'ACCEPTED'].includes(request.status)
  const canCancel = ['PENDING', 'ACCEPTED'].includes(request.status)

  return (
    <div className="mt-8 max-w-4xl mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <Link to="/requests" className="text-primary hover:underline">
          ← Back to Requests
        </Link>
        <div className="flex gap-2">
          {canEdit && !isEditing && (
            <button className="btn-secondary" onClick={() => setIsEditing(true)}>
              Edit
            </button>
          )}
          {canCancel && (
            <button 
              className="btn-secondary text-red-600 hover:bg-red-50" 
              onClick={handleCancel}
            >
              Cancel Request
            </button>
          )}
          {request.status === 'CANCELLED' && (
            <button 
              className="btn-secondary text-red-600 hover:bg-red-50" 
              onClick={handleDelete}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Request Details</h2>

      {message && (
        <Alert type={message.includes('Failed') ? 'error' : 'success'} className="mb-4">
          {message}
        </Alert>
      )}

      {isEditing ? (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="font-semibold mb-4">Edit Request</h3>
          <form onSubmit={handleUpdate} className="grid gap-4">
            <div>
              <label className="form-label">Start Date & Time</label>
              <input 
                type="datetime-local" 
                name="start_date" 
                className="form-input" 
                defaultValue={request.start_date?.slice(0, 16)}
                required 
              />
            </div>
            <div>
              <label className="form-label">End Date & Time</label>
              <input 
                type="datetime-local" 
                name="end_date" 
                className="form-input" 
                defaultValue={request.end_date?.slice(0, 16)}
                required 
              />
            </div>
            <div>
              <label className="form-label">Hourly Rate</label>
              <input 
                name="hourly_rate" 
                type="number" 
                step="0.01" 
                className="form-input" 
                defaultValue={request.hourly_rate}
                required
              />
            </div>
            <div>
              <label className="form-label">Special Requirements</label>
              <textarea 
                name="special_requirements" 
                className="form-input resize-none" 
                rows="3"
                defaultValue={request.special_requirements || ''}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid gap-6">
            {/* Status */}
            <div>
              <label className="text-sm font-medium text-textSecondary">Status</label>
              <div className="mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[request.status]}`}>
                  {request.status}
                </span>
              </div>
            </div>

            {/* Child Information */}
            {request.child && (
              <div>
                <label className="text-sm font-medium text-textSecondary">Child</label>
                <div className="mt-1 text-base">
                  <div className="font-medium">{request.child.name}</div>
                  <div className="text-sm text-textSecondary">
                    DOB: {new Date(request.child.date_of_birth).toLocaleDateString()}
                  </div>
                  {request.child.special_needs && (
                    <div className="text-sm mt-1">
                      <span className="font-medium">Special Needs:</span> {request.child.special_needs}
                    </div>
                  )}
                  {request.child.dietary_restrictions && (
                    <div className="text-sm">
                      <span className="font-medium">Dietary:</span> {request.child.dietary_restrictions}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Babysitter Information */}
            {request.babysitter_info && (
              <div>
                <label className="text-sm font-medium text-textSecondary">Babysitter</label>
                <div className="mt-1 text-base">
                  <div className="font-medium">
                    {request.babysitter_info.first_name} {request.babysitter_info.last_name}
                  </div>
                  <div className="text-sm text-textSecondary">{request.babysitter_info.email}</div>
                  {request.babysitter_info.phone_number && (
                    <div className="text-sm text-textSecondary">{request.babysitter_info.phone_number}</div>
                  )}
                </div>
              </div>
            )}

            {/* Schedule */}
            <div>
              <label className="text-sm font-medium text-textSecondary">Schedule</label>
              <div className="mt-1 text-base">
                <div><span className="font-medium">Start:</span> {new Date(request.start_date).toLocaleString()}</div>
                <div><span className="font-medium">End:</span> {new Date(request.end_date).toLocaleString()}</div>
              </div>
            </div>

            {/* Cost */}
            <div>
              <label className="text-sm font-medium text-textSecondary">Cost</label>
              <div className="mt-1 text-base">
                <div><span className="font-medium">Hourly Rate:</span> ${parseFloat(request.hourly_rate).toFixed(2)}/hour</div>
                {request.total_cost && (
                  <div className="text-lg font-semibold text-primary">
                    Total: ${parseFloat(request.total_cost).toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            {/* Special Requirements */}
            {request.special_requirements && (
              <div>
                <label className="text-sm font-medium text-textSecondary">Special Requirements</label>
                <div className="mt-1 text-base">{request.special_requirements}</div>
              </div>
            )}

            {/* Review */}
            {request.review && (
              <div>
                <label className="text-sm font-medium text-textSecondary">Review</label>
                <div className="mt-1 bg-gray-50 p-3 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating rating={request.review.rating} />
                  </div>
                  {request.review.comment && (
                    <p className="text-sm">{request.review.comment}</p>
                  )}
                </div>
              </div>
            )}

            {/* Parent Information */}
            {request.parent && (
              <div>
                <label className="text-sm font-medium text-textSecondary">Requested By</label>
                <div className="mt-1 text-base">
                  <div>{request.parent.user?.first_name} {request.parent.user?.last_name}</div>
                  <div className="text-sm text-textSecondary">{request.parent.user?.email}</div>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="text-xs text-textSecondary border-t pt-4">
              <div>Created: {new Date(request.created_at).toLocaleString()}</div>
              <div>Last Updated: {new Date(request.updated_at).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StarRating({ rating }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
          ⭐
        </span>
      ))}
    </div>
  )
}
