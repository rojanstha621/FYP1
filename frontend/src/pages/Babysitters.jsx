import React, { useState } from 'react'
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
    try {
      await createRequest.mutateAsync({
        babysitter: selected.id,
        child: form.get('child'),
        start_date: form.get('start_date'),
        end_date: form.get('end_date'),
        hourly_rate: form.get('hourly_rate') || selected.hourly_rate || 0,
      })
      setMessage('Request created')
      setSelected(null)
    } catch (err) {
      setMessage('Failed to create request')
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
        {results?.map((u) => (
          <div key={u.id} className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
            <div>
              <div className="font-medium">{u.first_name} {u.last_name}</div>
              <div className="text-sm text-textSecondary">{u.email} • {u.babysitter_profile?.city}</div>
              <div className="text-xs text-textSecondary">Rating: {u.babysitter_profile?.average_rating ?? '—'}</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary" onClick={() => setSelected(u)}>Request</button>
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
                <label className="form-label">Hourly rate (optional)</label>
                <input name="hourly_rate" className="form-input" placeholder="0" />
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
