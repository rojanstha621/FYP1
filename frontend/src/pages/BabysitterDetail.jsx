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
    <div className="mt-8 max-w-4xl mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <Link to="/babysitters" className="text-primary hover:underline">
          ← Back to Babysitters
        </Link>
        <button 
          className="btn-primary" 
          onClick={() => setShowRequestForm(!showRequestForm)}
        >
          {showRequestForm ? 'Cancel' : 'Send Request'}
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Babysitter Profile</h2>

      {message && (
        <Alert type={message.includes('Failed') ? 'error' : 'success'} className="mb-4">
          {message}
        </Alert>
      )}

      {showRequestForm && (
        <div className="bg-white shadow rounded-lg p-4 mb-6">
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
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <h4 className="font-medium text-yellow-800 mb-2">Existing Bookings on {selectedDate}:</h4>
                <div className="space-y-1">
                  {existingBookings.map((booking) => (
                    <div key={booking.id} className="text-sm text-yellow-700">
                      {booking.start_time} - {booking.end_time} ({booking.status})
                    </div>
                  ))}
                </div>
                <p className="text-xs text-yellow-600 mt-2">
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

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-start gap-6 mb-6">
          {/* Profile Picture */}
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
            {babysitter.profile?.profile_picture ? (
              <img 
                src={babysitter.profile.profile_picture} 
                alt={`${babysitter.first_name} ${babysitter.last_name}`}
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-3xl">
                {babysitter.first_name[0]}{babysitter.last_name[0]}
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <h3 className="text-2xl font-semibold">
              {babysitter.first_name} {babysitter.last_name}
            </h3>
            <p className="text-textSecondary">{babysitter.email}</p>
            {babysitter.phone_number && (
              <p className="text-textSecondary">{babysitter.phone_number}</p>
            )}
            
            {/* Rating */}
            <div className="mt-3 flex items-center gap-4">
              {babysitter.average_rating > 0 ? (
                <>
                  <div className="flex items-center gap-1">
                    <StarRating rating={Math.round(babysitter.average_rating)} />
                    <span className="text-sm font-medium">
                      {parseFloat(babysitter.average_rating).toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-textSecondary">
                    ({babysitter.total_reviews} reviews)
                  </span>
                </>
              ) : (
                <span className="text-sm text-textSecondary">No ratings yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {babysitter.profile?.bio && (
          <div className="mb-6">
            <h4 className="font-semibold mb-2">About</h4>
            <p className="text-gray-700">{babysitter.profile.bio}</p>
          </div>
        )}

        {/* Location */}
        {babysitter.profile?.address && (
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Location</h4>
            <p className="text-gray-700">📍 {babysitter.profile.address}</p>
          </div>
        )}

        {/* Availability */}
        <div className="mb-6">
          <h4 className="font-semibold mb-3">Availability</h4>
          {availability && availability.length > 0 ? (
            <div className="grid gap-3">
              {dayNames.map((dayName, dayIndex) => {
                const daySlots = availability.filter(slot => slot.day_of_week === dayIndex)
                if (daySlots.length === 0) return null

                return (
                  <div key={dayIndex} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-20 text-sm font-medium text-gray-700">
                      {dayName}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {daySlots.map((slot, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded"
                        >
                          {slot.start_time} - {slot.end_time}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-sm">No availability information provided</p>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        {babysitter.reviews && babysitter.reviews.length > 0 && (
          <div className="mt-6 border-t pt-6">
            <h4 className="font-semibold mb-4">Reviews ({babysitter.reviews.length})</h4>
            <div className="grid gap-4">
              {babysitter.reviews.map((review, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={review.rating} />
                    <span className="text-sm text-textSecondary">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-700">{review.comment}</p>
                  )}
                  {review.parent_name && (
                    <p className="text-xs text-textSecondary mt-2">
                      — {review.parent_name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Member Since - removed since created_at may not be in response */}
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
