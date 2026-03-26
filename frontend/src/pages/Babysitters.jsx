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
    <div className="page-wrap max-w-7xl mx-auto px-4">
      <h2 className="text-2xl font-bold tracking-tight mb-5">Find Babysitters</h2>

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
        className="mb-3"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input className="form-input md:col-span-2" placeholder="Search babysitter by name" value={query.name} onChange={(e) => setQuery({ ...query, name: e.target.value })} />
          <input className="form-input" placeholder="Location" value={query.city} onChange={(e) => setQuery({ ...query, city: e.target.value })} />
          <button type="button" onClick={() => setQuery({ ...query })} className="btn-primary w-full">Search</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="pill">Location</span>
          <span className="pill">Rate Range</span>
          <span className="pill">Rating</span>
          <input className="form-input max-w-[150px]" placeholder="Min rating" value={query.min_rating} onChange={(e) => setQuery({ ...query, min_rating: e.target.value })} />
        </div>
      </form>

      {isLoading && <div className="text-center text-gray-500">Searching...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {results?.length === 0 && (
          <div className="col-span-full card text-center">
            <div className="text-5xl mb-3">🧸</div>
            <h3 className="text-lg font-semibold mb-1">No babysitters found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search filters to discover available carers.</p>
          </div>
        )}

        {results?.map((babysitter) => (
          <div key={babysitter.id} className="card hover:shadow-md transition-all duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-pink-100 flex-shrink-0 mb-4">
                {babysitter.profile?.profile_picture ? (
                  <img 
                    src={babysitter.profile.profile_picture} 
                    alt={`${babysitter.first_name} ${babysitter.last_name}`}
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-pink-50 text-pink-500 text-xl font-semibold">
                    {babysitter.first_name[0]}{babysitter.last_name[0]}
                  </div>
                )}
              </div>

              <h3 className="font-semibold text-lg">{babysitter.first_name} {babysitter.last_name}</h3>
              <p className="text-sm text-gray-500">{babysitter.email}</p>

              <div className="flex items-center gap-1 mt-2 text-amber-500">
                <span>★</span>
                <span className="text-sm font-medium text-[#1A1A2E]">{babysitter.average_rating?.toFixed(1) || '0.0'}</span>
                <span className="text-xs text-gray-500">({babysitter.total_reviews || 0})</span>
              </div>

              <p className="text-sm text-gray-500 mt-2">📍 {babysitter.profile?.address || 'Location unavailable'}</p>

              <span className="mt-3 inline-flex rounded-full bg-pink-100 text-pink-700 px-3 py-1 text-xs font-semibold">
                ${Number.parseFloat(babysitter.hourly_rate || 15).toFixed(2)}/hr
              </span>

              {babysitter.profile?.bio && (
                <p className="text-sm text-gray-600 mt-3 line-clamp-2">{babysitter.profile.bio}</p>
              )}

              <div className="w-full mt-4 flex items-center gap-2">
                <Link to={`/babysitters/${babysitter.id}`} className="btn-primary flex-1 text-center">
                  View Profile
                </Link>
                <button className="btn-secondary flex-1" onClick={() => setSelected(babysitter)}>
                  Book
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Request form modal (inline) */}
      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-pink-100 p-6 w-full max-w-md shadow-md">
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
