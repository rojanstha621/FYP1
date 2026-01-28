import React, { useState } from 'react'
import { useReviews, useCreateReview, useDeleteReview, useBookingHistory } from '../api/hooks'
import Alert from '../components/Alert'

export default function Reviews() {
  const { data: reviews, isLoading } = useReviews()
  const { data: history } = useBookingHistory()
  const createReview = useCreateReview()
  const deleteReview = useDeleteReview()
  const [message, setMessage] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return
    setMessage('')
    try {
      await deleteReview.mutateAsync(id)
      setMessage('Review deleted successfully')
    } catch (err) {
      setMessage('Failed to delete review')
    }
  }

  // Get bookings that don't have reviews yet
  const reviewedBookingIds = new Set(reviews?.map(r => r.booking_id) || [])
  const unreviewedBookings = history?.filter(b => !reviewedBookingIds.has(b.id)) || []

  return (
    <div className="mt-8 max-w-4xl mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">My Reviews</h2>
        {unreviewedBookings.length > 0 && (
          <button 
            className="btn-primary" 
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Write Review'}
          </button>
        )}
      </div>

      {message && (
        <Alert type={message.includes('Failed') ? 'error' : 'success'} className="mb-4">
          {message}
        </Alert>
      )}

      {showCreateForm && (
        <CreateReviewForm 
          unreviewedBookings={unreviewedBookings}
          onClose={() => setShowCreateForm(false)}
        />
      )}

      {isLoading && <div className="text-gray-500">Loading...</div>}

      {!isLoading && reviews?.length === 0 && (
        <div className="text-gray-500 text-center py-8">
          No reviews yet. Complete a booking to leave a review!
        </div>
      )}

      <div className="grid gap-4">
        {reviews?.map((review) => (
          <div key={review.id} className="bg-white shadow rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                {review.babysitter_info && (
                  <div className="font-medium">
                    {review.babysitter_info.first_name} {review.babysitter_info.last_name}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={review.rating} />
                  <span className="text-sm text-textSecondary">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button 
                className="btn-secondary text-sm text-red-600 hover:bg-red-50" 
                onClick={() => handleDelete(review.id)}
              >
                Delete
              </button>
            </div>
            {review.comment && (
              <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function CreateReviewForm({ unreviewedBookings, onClose }) {
  const createReview = useCreateReview()
  const [message, setMessage] = useState('')
  const [selectedBooking, setSelectedBooking] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    const data = new FormData(e.target)
    
    const booking = unreviewedBookings.find(b => b.id === selectedBooking)
    if (!booking || !booking.babysitter_info) {
      setMessage('Invalid booking selected')
      return
    }

    try {
      await createReview.mutateAsync({
        booking: selectedBooking,
        babysitter: booking.babysitter_info.id,
        rating: parseInt(data.get('rating')),
        comment: data.get('comment'),
      })
      setMessage('Review submitted successfully')
      setTimeout(() => onClose(), 1500)
    } catch (err) {
      setMessage('Failed to submit review')
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <h3 className="font-semibold mb-3">Write a Review</h3>
      
      {message && (
        <Alert type={message.includes('Failed') ? 'error' : 'success'} className="mb-3">
          {message}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="grid gap-3">
        <div>
          <label className="form-label">Select Booking *</label>
          <select 
            name="booking" 
            className="form-input" 
            required
            value={selectedBooking}
            onChange={(e) => setSelectedBooking(e.target.value)}
          >
            <option value="">Choose a completed booking</option>
            {unreviewedBookings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.child_name} with {b.babysitter_info?.first_name} {b.babysitter_info?.last_name} - {new Date(b.start_date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="form-label">Rating *</label>
          <select name="rating" className="form-input" required>
            <option value="">Select rating</option>
            <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
            <option value="4">⭐⭐⭐⭐ Very Good</option>
            <option value="3">⭐⭐⭐ Good</option>
            <option value="2">⭐⭐ Fair</option>
            <option value="1">⭐ Poor</option>
          </select>
        </div>
        
        <div>
          <label className="form-label">Comment</label>
          <textarea 
            name="comment" 
            className="form-input resize-none" 
            rows="4"
            placeholder="Share your experience with this babysitter..."
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Submit Review
          </button>
        </div>
      </form>
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
