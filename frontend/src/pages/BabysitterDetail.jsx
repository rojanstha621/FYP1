import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useBabysitterDetail, useChildren, useCreateRequest, useBabysitterAvailability, useBabysitterBookings } from '../api/hooks'
import Alert from '../components/Alert'
import { validateBookingAvailability } from '../utils/availability'

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function BabysitterDetail() {
  const { id } = useParams()
  const { data: babysitter, isLoading } = useBabysitterDetail(id)
  const { data: children } = useChildren()
  const { data: availability } = useBabysitterAvailability(id)
  const createRequest = useCreateRequest()
  const [message, setMessage] = useState('')
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [activeTab, setActiveTab] = useState('ABOUT')
  const [selectedDate, setSelectedDate] = useState('')
  
  // Get existing bookings for the selected date
  const { data: existingBookings } = useBabysitterBookings(id, selectedDate)

  // Check for time conflicts with existing bookings
  const checkBookingConflicts = (startDate, endDate) => {
    if (!existingBookings || existingBookings.length === 0) return null

    for (const booking of existingBookings) {
      const existingStart = new Date(booking.start_date)
      const existingEnd = new Date(booking.end_date)
      
      // Check for overlap: existing_start < new_end AND existing_end > new_start
      if (existingStart < endDate && existingEnd > startDate) {
        return {
          hasConflict: true,
          conflictingBooking: booking
        }
      }
    }
    
    return { hasConflict: false }
  }

  const handleRequest = async (e) => {
    e.preventDefault()
    setMessage('')
    const data = new FormData(e.target)
    
    const startDate = new Date(data.get('start_date'))
    const endDate = new Date(data.get('end_date'))
    const hourlyRate = parseFloat(data.get('hourly_rate')) || 15.00

    // Basic validation
    if (startDate <= new Date()) {
      setMessage('Booking date must be in the future')
      return
    }

    if (startDate >= endDate) {
      setMessage('End time must be after start time')
      return
    }

    // Client-side availability validation
    if (availability && availability.length > 0) {
      const validation = validateBookingAvailability(availability, startDate, endDate)
      
      if (!validation.isValid) {
        setMessage(validation.message)
        return
      }
    }

    // Check for conflicts with existing bookings
    const conflictCheck = checkBookingConflicts(startDate, endDate)
    if (conflictCheck?.hasConflict) {
      const booking = conflictCheck.conflictingBooking
      setMessage(
        `Selected time is already booked. ` +
        `Existing booking: ${booking.start_time} - ${booking.end_time}` +
        (booking.parent_name ? ` (${booking.parent_name})` : '')
      )
      return
    }
    
    try {
      await createRequest.mutateAsync({
        babysitter: id,
        child: data.get('child'),
        start_date: data.get('start_date'),
        end_date: data.get('end_date'),
        hourly_rate: hourlyRate,
        special_requirements: data.get('special_requirements') || '',
      })
      setMessage('Request sent successfully!')
      setShowRequestForm(false)
      e.target.reset()
      setSelectedDate('')
    } catch (err) {
      console.error('Request error:', err)
      
      // Handle specific validation errors from backend
      if (err.response?.data?.non_field_errors) {
        const errorMsg = err.response.data.non_field_errors[0]
        if (errorMsg.includes('booking during this time')) {
          setMessage('Selected time is already booked. Please choose another time.')
        } else {
          setMessage(errorMsg)
        }
      } else if (err.response?.data?.detail) {
        const errorMsg = err.response.data.detail
        if (errorMsg.includes('booking during this time')) {
          setMessage('Selected time is already booked. Please choose another time.')
        } else {
          setMessage(errorMsg)
        }
      } else if (err.response?.data) {
        // Handle field-specific errors
        const errors = Object.entries(err.response.data)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ')
        setMessage(errors)
      } else {
        setMessage('Failed to send request')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="mt-8 max-w-4xl mx-auto px-4">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!babysitter) {
    return (
      <div className="mt-8 max-w-4xl mx-auto px-4">
        <div className="text-gray-500">Babysitter not found</div>
        <Link to="/babysitters" className="text-primary hover:underline mt-2 inline-block">
          Back to Babysitters
        </Link>
      </div>
    )
  }

  return (
    <div className="page-wrap max-w-6xl mx-auto px-4">
      <div className="flex justify-between items-center mb-5">
        <Link to="/babysitters" className="text-pink-600 hover:text-pink-700 transition-all duration-200">
          ← Back to Babysitters
        </Link>
      </div>

      {message && (
        <Alert type={message.includes('Failed') ? 'error' : 'success'} className="mb-4">
          {message}
        </Alert>
      )}

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-pink-100 flex-shrink-0">
            {babysitter.profile?.profile_picture ? (
              <img
                src={babysitter.profile.profile_picture}
                alt={`${babysitter.first_name} ${babysitter.last_name}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-pink-50 text-pink-500 text-3xl font-semibold">
                {babysitter.first_name[0]}{babysitter.last_name[0]}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold tracking-tight">{babysitter.first_name} {babysitter.last_name}</h2>
            <p className="text-gray-500 text-sm mt-1">{babysitter.email}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 text-amber-500">
                <StarRating rating={Math.round(babysitter.average_rating || 0)} />
                <span className="text-[#1A1A2E] text-sm font-semibold">{parseFloat(babysitter.average_rating || 0).toFixed(1)}</span>
                <span className="text-xs text-gray-500">({babysitter.total_reviews || 0} reviews)</span>
              </div>
              <span className="inline-flex rounded-full bg-pink-100 text-pink-700 px-3 py-1 text-xs font-semibold">
                rs{Number.parseFloat(babysitter.hourly_rate || 15).toFixed(2)}/hr
              </span>
            </div>
          </div>

          <button className="btn-primary" onClick={() => setShowRequestForm(true)}>Book Now</button>
        </div>
      </div>

      {showRequestForm && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Step 1: Pick Time</h3>
            <div className="text-xs text-gray-500">1. Pick Time → 2. Confirm → 3. Done</div>
          </div>
          <h3 className="font-semibold mb-3">Send Request to {babysitter.first_name}</h3>
          <form onSubmit={handleRequest} className="grid gap-3">
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
              <label className="form-label">Start Date & Time *</label>
              <input 
                type="datetime-local" 
                name="start_date" 
                className="form-input" 
                required 
                onChange={(e) => {
                  const dateValue = e.target.value ? e.target.value.split('T')[0] : ''
                  setSelectedDate(dateValue)
                }}
              />
            </div>
            <div>
              <label className="form-label">End Date & Time *</label>
              <input type="datetime-local" name="end_date" className="form-input" required />
            </div>
            
            {/* Show existing bookings for selected date */}
            {selectedDate && existingBookings && existingBookings.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                <h4 className="font-medium text-amber-700 mb-2">Existing Bookings on {selectedDate}:</h4>
                <div className="space-y-1">
                  {existingBookings.map((booking) => (
                    <div key={booking.id} className="text-sm text-amber-700">
                      {booking.start_time} - {booking.end_time} ({booking.status})
                    </div>
                  ))}
                </div>
                <p className="text-xs text-amber-600 mt-2">
                  Please choose a time that doesn't overlap with these bookings.
                </p>
              </div>
            )}
            
            <div>
              <label className="form-label">Hourly Rate</label>
              <input 
                name="hourly_rate" 
                type="number" 
                step="0.01" 
                className="form-input" 
                placeholder="15.00"
              />
            </div>
            <div>
              <label className="form-label">Special Requirements</label>
              <textarea 
                name="special_requirements" 
                className="form-input resize-none" 
                rows="3"
                placeholder="Any special instructions..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setShowRequestForm(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Send Request
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="flex flex-wrap gap-2 mb-5 border-b border-pink-100 pb-4">
          {[
            { key: 'ABOUT', label: 'About' },
            { key: 'AVAILABILITY', label: 'Availability' },
            { key: 'REVIEWS', label: 'Reviews' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-[#FF6B9D] text-white'
                  : 'bg-pink-50 text-pink-700 border border-pink-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'ABOUT' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">About</h4>
              <p className="text-gray-700">{babysitter.profile?.bio || 'No bio provided yet.'}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Location</h4>
              <p className="text-gray-700">📍 {babysitter.profile?.address || 'Location unavailable'}</p>
            </div>
          </div>
        )}

        {activeTab === 'AVAILABILITY' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dayNames.map((dayName, dayIndex) => {
              const daySlots = availability?.filter((slot) => slot.day_of_week === dayIndex) || []
              return (
                <div key={dayIndex} className="rounded-2xl border border-pink-100 p-4 bg-pink-50/40">
                  <h5 className="font-semibold mb-2">{dayName}</h5>
                  {daySlots.length ? (
                    <div className="flex flex-wrap gap-2">
                      {daySlots.map((slot) => (
                        <span key={slot.id} className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-semibold">
                          {slot.start_time} - {slot.end_time}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">Not available</p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'REVIEWS' && (
          <div className="grid gap-4">
            {babysitter.reviews?.length ? babysitter.reviews.map((review, idx) => (
              <div key={idx} className="rounded-2xl border border-pink-100 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} />
                    <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className="text-xs text-gray-500">{review.parent_name || 'Parent'}</span>
                </div>
                {review.comment && <p className="text-sm text-gray-700 mt-2">{review.comment}</p>}
              </div>
            )) : (
              <p className="text-sm text-gray-500">No reviews yet.</p>
            )}
          </div>
        )}
      </div>
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
