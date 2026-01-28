import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRequests, useCancelRequest, useChildren, useCreateRequest } from '../api/hooks'
import Alert from '../components/Alert'

export default function Requests() {
  const { data: requests, isLoading } = useRequests()
  const cancel = useCancelRequest()
  const [message, setMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleCancel = async (id) => {
    setMessage('')
    try {
      await cancel.mutateAsync(id)
      setMessage('Request cancelled successfully')
    } catch (err) {
      setMessage('Failed to cancel request')
    }
  }

  const filteredRequests = requests?.filter(r => 
    statusFilter === 'ALL' || r.status === statusFilter
  ) || []

  const statusBadge = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="mt-8 max-w-4xl mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Requests</h2>
        <button 
          className="btn-primary" 
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'New Request'}
        </button>
      </div>

      {message && (
        <Alert type={message.includes('Failed') ? 'error' : 'success'} className="mb-4">
          {message}
        </Alert>
      )}

      {showCreateForm && <CreateRequestForm onClose={() => setShowCreateForm(false)} />}

      {/* Filter buttons */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1 rounded text-sm whitespace-nowrap ${
              statusFilter === status 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {isLoading && <div className="text-gray-500">Loading...</div>}

      {!isLoading && filteredRequests.length === 0 && (
        <div className="text-gray-500 text-center py-8">
          No {statusFilter !== 'ALL' ? statusFilter.toLowerCase() : ''} requests found
        </div>
      )}

      <div className="grid gap-3">
        {filteredRequests.map((r) => (
          <div key={r.id} className="bg-white shadow rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{r.child_name || 'No child assigned'}</span>
                  {statusBadge(r.status)}
                </div>
                {r.babysitter_info && (
                  <div className="text-sm text-textSecondary">
                    Babysitter: {r.babysitter_info.first_name} {r.babysitter_info.last_name}
                  </div>
                )}
                <div className="text-sm text-textSecondary mt-1">
                  {new Date(r.start_date).toLocaleString()} — {new Date(r.end_date).toLocaleString()}
                </div>
                {r.total_cost && (
                  <div className="text-sm font-medium mt-1">
                    Total: ${parseFloat(r.total_cost).toFixed(2)}
                  </div>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <Link to={`/requests/${r.id}`} className="btn-secondary text-sm">
                  View
                </Link>
                {r.status !== 'CANCELLED' && r.status !== 'COMPLETED' && (
                  <button 
                    className="btn-secondary text-sm text-red-600 hover:bg-red-50" 
                    onClick={() => handleCancel(r.id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CreateRequestForm({ onClose }) {
  const { data: children } = useChildren()
  const createRequest = useCreateRequest()
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    const data = new FormData(e.target)
    
    try {
      await createRequest.mutateAsync({
        child: data.get('child'),
        babysitter: data.get('babysitter') || null,
        start_date: data.get('start_date'),
        end_date: data.get('end_date'),
        hourly_rate: parseFloat(data.get('hourly_rate')) || 0,
        special_requirements: data.get('special_requirements'),
      })
      setMessage('Request created successfully')
      setTimeout(() => onClose(), 1500)
    } catch (err) {
      setMessage('Failed to create request')
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <h3 className="font-semibold mb-3">Create New Request</h3>
      
      {message && (
        <Alert type={message.includes('Failed') ? 'error' : 'success'} className="mb-3">
          {message}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="grid gap-3">
        <div>
          <label className="form-label">Child *</label>
          <select name="child" className="form-input" required>
            <option value="">Select a child</option>
            {children?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Babysitter ID (optional)</label>
          <input name="babysitter" className="form-input" placeholder="Leave blank to assign later" />
        </div>
        <div>
          <label className="form-label">Start Date & Time *</label>
          <input type="datetime-local" name="start_date" className="form-input" required />
        </div>
        <div>
          <label className="form-label">End Date & Time *</label>
          <input type="datetime-local" name="end_date" className="form-input" required />
        </div>
        <div>
          <label className="form-label">Hourly Rate *</label>
          <input 
            name="hourly_rate" 
            type="number" 
            step="0.01" 
            className="form-input" 
            placeholder="15.00"
            required
          />
        </div>
        <div>
          <label className="form-label">Special Requirements</label>
          <textarea 
            name="special_requirements" 
            className="form-input resize-none" 
            rows="3"
            placeholder="Any special instructions or requirements"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Create Request
          </button>
        </div>
      </form>
    </div>
  )
}
