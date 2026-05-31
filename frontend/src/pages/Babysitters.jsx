import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useBabysittersSearch, useChildren, useCreateRequest } from '../api/hooks'
import Alert from '../components/Alert'

const formatRate = (rate) => `Rs ${Number.parseFloat(rate ?? 0).toFixed(2)}/hr`

export default function Babysitters() {
  const [query, setQuery] = useState({ name: '', city: '', min_rating: '' })
  const [message, setMessage] = useState('')
  const [selected, setSelected] = useState(null)
  const [animatedCards, setAnimatedCards] = useState(new Set())
  const cardRefs = useRef({})
  const hasInitialized = useRef(false)

  const { data: results, isLoading } = useBabysittersSearch(query)
  const { data: children } = useChildren()
  const createRequest = useCreateRequest()

  useEffect(() => {
    if (!results || results.length === 0) return

    // Reset on new results
    setAnimatedCards(new Set())
    cardRefs.current = {}
    hasInitialized.current = false

    // Small delay to ensure DOM refs are populated
    const initTimer = setTimeout(() => {
      // Create intersection observer
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const cardId = entry.target.dataset.id
              setAnimatedCards((prev) => new Set([...prev, cardId]))
            }
          })
        },
        {
          threshold: 0.15,
          rootMargin: '0px 0px 50px 0px',
        }
      )

      // Get all card elements and observe them
      const cardElements = document.querySelectorAll('[data-id]')
      cardElements.forEach((element) => {
        observer.observe(element)
      })

      return () => observer.disconnect()
    }, 100) // Back to normal 100ms for DOM readiness

    return () => clearTimeout(initTimer)
  }, [results])

  const submitRequest = async (e) => {
    e.preventDefault()
    setMessage('')
    const form = new FormData(e.target)

    const hourlyRate = parseFloat(form.get('hourly_rate')) || parseFloat(selected?.hourly_rate) || 0

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

      <style>{`
        @keyframes scrollRevealUp {
          0% {
            opacity: 0;
            transform: translateY(28px) scale(0.98);
            filter: blur(6px);
          }
          60% {
            opacity: 0.55;
            transform: translateY(8px) scale(0.995);
            filter: blur(3px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        
        .babysitter-card {
          opacity: 0;
          visibility: hidden;
          transform: translateY(28px) scale(0.98);
          filter: blur(6px);
        }

        .babysitter-card.reveal {
          visibility: visible;
          animation: scrollRevealUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .skeleton-card {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }

        .skeleton-circle {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }

        .skeleton-text {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
          border-radius: 4px;
        }
      `}</style>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && !results && (
          <>
            {[...Array(6)].map((_, index) => (
              <div key={`skeleton-${index}`} className="skeleton-card card p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="skeleton-circle mb-4"></div>
                  <div className="skeleton-text h-6 w-24 mb-2"></div>
                  <div className="skeleton-text h-4 w-32 mb-3"></div>
                  <div className="skeleton-text h-4 w-20 mb-4"></div>
                  <div className="skeleton-text h-4 w-28 mb-3"></div>
                  <div className="skeleton-text h-5 w-24 mb-4 rounded-full"></div>
                  <div className="flex gap-2 w-full mt-4">
                    <div className="skeleton-text h-10 flex-1"></div>
                    <div className="skeleton-text h-10 flex-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {!isLoading && results?.length === 0 && (
          <div className="col-span-full card text-center">
            <div className="text-5xl mb-3">🧸</div>
            <h3 className="text-lg font-semibold mb-1">No babysitters found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search filters to discover available carers.</p>
          </div>
        )}

        {!isLoading && results?.map((babysitter, index) => (
          <div
            key={babysitter.id}
            ref={(el) => {
              if (el) cardRefs.current[babysitter.id] = el
            }}
            data-id={babysitter.id}
            data-index={index}
            className={`babysitter-card card hover:shadow-md transition-all duration-200 ${
              animatedCards.has(babysitter.id) ? 'reveal' : ''
            }`}
            style={{
              animationDelay: animatedCards.has(babysitter.id)
                ? (() => {
                    const row = Math.floor(index / 3)
                    const position = index % 3
                    const baseDelay = row * 0.45
                    const positionDelay = position === 0 ? 0 : position === 1 ? 0.3 : 0.45
                    return `${baseDelay + positionDelay}s`
                  })()
                : '0s',
            }}
          >
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
                {formatRate(babysitter.hourly_rate)}
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
                  placeholder={selected?.hourly_rate ? String(selected.hourly_rate) : '0.00'}
                  defaultValue={selected?.hourly_rate ?? ''}
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
