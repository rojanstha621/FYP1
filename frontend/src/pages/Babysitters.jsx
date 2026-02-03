import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBabysittersSearch, useChildren, useCreateRequest } from '../api/hooks'
import Alert from '../components/Alert'

export default function Babysitters() {
  const [query, setQuery] = useState({ name: '', city: '', min_rating: '' })
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState(null)

  const { data: results, isLoading } = useBabysittersSearch(query)
  const { data: children } = useChildren()
  const createRequest = useCreateRequest()

  const submitRequest = async (e) => {
    e.preventDefault()
    setMessage('')
    const form = new FormData(e.target)
    
    const hourlyRate = parseFloat(form.get('hourly_rate')) || 15.00
    
    try {
      await createRequest.mutateAsync({
        babysitter: selected.id,
        child: form.get('child'),
        start_date: form.get('start_date'),
        end_date: form.get('end_date'),
        hourly_rate: hourlyRate,
      })
      setMessage('Request created successfully!')
      setSelected(null)
    } catch (err) {
      console.error('Request error:', err)
      setMessage(err.response?.data?.detail || 'Failed to create request')
    }
  }

  return (
    <div className="mt-8 max-w-4xl mx-auto px-4">
      <h2 className="text-xl font-semibold mb-4">Find Babysitters</h2>

      {message && (
        <Alert type={message.includes('Failed') ? 'error' : 'success'} className="mb-4">
          {message}
        </Alert>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          // trigger search by changing query (useBabysittersSearch listens to `query`)
        }}
        className="mb-4 flex gap-2"
      >
        <input className="form-input" placeholder="Name" value={query.name} onChange={(e) => setQuery({ ...query, name: e.target.value })} />
        <input className="form-input" placeholder="City" value={query.city} onChange={(e) => setQuery({ ...query, city: e.target.value })} />
        <input className="form-input" placeholder="Min rating" value={query.min_rating} onChange={(e) => setQuery({ ...query, min_rating: e.target.value })} />
        <button type="button" onClick={() => setQuery({ ...query })} className="btn-primary">Search</button>
      </form>

      {isLoading && <div className="text-center text-gray-500">Searching...</div>}

      <div className="grid gap-4">
        {results?.length === 0 && <div className="text-gray-500">No babysitters found</div>}
        {results?.map((babysitter) => (
          <div key={babysitter.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              {/* Profile Picture */}
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                {babysitter.profile?.profile_picture ? (
                  <img 
                    src={babysitter.profile.profile_picture} 
                    alt={`${babysitter.first_name} ${babysitter.last_name}`}
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xl font-semibold">
                    {babysitter.first_name[0]}{babysitter.last_name[0]}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{babysitter.first_name} {babysitter.last_name}</h3>
                <p className="text-sm text-gray-600">{babysitter.email}</p>
                {babysitter.phone_number && (
                  <p className="text-sm text-gray-600">{babysitter.phone_number}</p>
                )}
                {babysitter.profile?.bio && (
                  <p className="text-sm text-gray-700 mt-2 line-clamp-2">{babysitter.profile.bio}</p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">⭐</span>
                    <span className="text-sm font-medium">{babysitter.average_rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-xs text-gray-500">({babysitter.total_reviews || 0} reviews)</span>
                  </div>
                  {babysitter.profile?.address && (
                    <span className="text-sm text-gray-600">📍 {babysitter.profile.address}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Link to={`/babysitters/${babysitter.id}`} className="btn-primary text-center">
                  View Profile
                </Link>
                <button className="btn-secondary" onClick={() => setSelected(babysitter)}>
                  Send Request
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Request form modal (inline) */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Request {selected.first_name} {selected.last_name}</h3>
            <form onSubmit={submitRequest} className="grid gap-3">
              <div>
                <label className="form-label">Child</label>
                <select name="child" className="form-input" required>
                  <option value="">Select</option>
                  {children?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Start Date</label>
                <input type="datetime-local" name="start_date" className="form-input" required />
              </div>
              <div>
                <label className="form-label">End Date</label>
                <input type="datetime-local" name="end_date" className="form-input" required />
              </div>
              <div>
                <label className="form-label">Hourly Rate</label>
                <input 
                  name="hourly_rate" 
                  type="number" 
                  step="0.01"
                  className="form-input" 
                  placeholder="15.00"
                  defaultValue="15.00"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-secondary" onClick={() => setSelected(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Send request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
