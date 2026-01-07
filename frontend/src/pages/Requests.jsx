import React from 'react'
import { useRequests, useCancelRequest } from '../api/hooks'
import Alert from '../components/Alert'

export default function Requests() {
  const { data: requests, isLoading } = useRequests()
  const cancel = useCancelRequest()
  const [message, setMessage] = React.useState('')

  const handleCancel = async (id) => {
    setMessage('')
    try {
      await cancel.mutateAsync(id)
      setMessage('Request cancelled')
    } catch (err) {
      setMessage('Failed to cancel')
    }
  }

  return (
    <div className="mt-8 max-w-4xl mx-auto px-4">
      <h2 className="text-xl font-semibold mb-4">My Requests</h2>

      {message && (
        <Alert type={message.includes('Failed') ? 'error' : 'success'} className="mb-4">
          {message}
        </Alert>
      )}

      {isLoading && <div className="text-gray-500">Loading...</div>}

      <div className="grid gap-3">
        {requests?.map((r) => (
          <div key={r.id} className="bg-white shadow rounded-lg p-3 flex justify-between items-center">
            <div>
              <div className="font-medium">{r.child_name} • {r.status}</div>
              <div className="text-sm text-textSecondary">{new Date(r.start_date).toLocaleString()} — {new Date(r.end_date).toLocaleString()}</div>
            </div>
            <div>
              {r.status !== 'CANCELLED' && r.status !== 'COMPLETED' && (
                <button className="btn-secondary" onClick={() => handleCancel(r.id)}>Cancel</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
