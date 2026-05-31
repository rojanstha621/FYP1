import React, { useMemo, useState } from 'react'
import { useReviews, useCreateReview, useDeleteReview, useBookingHistory } from '../api/hooks'
import Alert from '../components/Alert'

export default function Reviews() {
  const { data: reviews, isLoading } = useReviews()
  const { data: history } = useBookingHistory()
  const createReview = useCreateReview()
  const deleteReview = useDeleteReview()
  const [message, setMessage] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const reviewedBookingIds = useMemo(() => new Set(reviews?.map((review) => review.booking_id) || []), [reviews])
  const unreviewedBookings = history?.filter((booking) => !reviewedBookingIds.has(booking.id)) || []

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return

    setMessage('')
    try {
      await deleteReview.mutateAsync(id)
      setMessage('Review deleted successfully')
    } catch {
      setMessage('Failed to delete review')
    }
  }

  return (
    <div className="page-wrap max-w-5xl mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Ratings & Reviews</h2>
        {unreviewedBookings.length > 0 && (
          <button className="btn-primary" onClick={() => setShowCreateForm((prev) => !prev)}>
            {showCreateForm ? 'Close' : 'Write Review'}
          </button>
        )}
      </div>

      {message && (
        <Alert type={message.includes('Failed') ? 'error' : 'success'} className="mb-4">
          {message}
        </Alert>
      )}

      {showCreateForm && (
        <CreateReviewForm unreviewedBookings={unreviewedBookings} onClose={() => setShowCreateForm(false)} />
      )}

      {isLoading && <p className="text-sm text-gray-500">Loading...</p>}

      {!isLoading && reviews?.length === 0 && (
        <div className="card text-center">
          <p className="text-gray-500">No reviews yet. Complete a booking to leave one.</p>
        </div>
      )}

      <div className="grid gap-4">
        {reviews?.map((review) => (
          <div key={review.id} className="card">
            <div className="flex justify-between items-start mb-2">
              <div>
                {review.babysitter_info && (
                  <div className="font-semibold">
                    {review.babysitter_info.first_name} {review.babysitter_info.last_name}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <DisplayStars rating={review.rating} />
                  <span className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <button className="btn-secondary text-red-500" onClick={() => handleDelete(review.id)}>Delete</button>
            </div>
            {review.comment && <p className="text-sm text-gray-700 mt-2">{review.comment}</p>}
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
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    const booking = unreviewedBookings.find((item) => String(item.id) === String(selectedBooking))
    if (!booking || !booking.babysitter_info) {
      setMessage('Invalid booking selected')
      return
    }

    if (!rating) {
      setMessage('Please select a rating')
      return
    }

    try {
      await createReview.mutateAsync({
        booking: selectedBooking,
        rating,
        comment,
      })
      setMessage('Review submitted successfully')
      setTimeout(() => onClose(), 1200)
    } catch (error) {
      setMessage(error?.response?.data?.booking?.[0] || error?.response?.data?.detail || 'Failed to submit review')
    }
  }

  return (
    <div className="card mb-6">
      <h3 className="font-semibold mb-3">Write a Review</h3>

      {message && (
        <Alert type={message.includes('Failed') ? 'error' : 'success'} className="mb-3">
          {message}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="grid gap-3">
        <div>
          <label className="form-label">Select Booking</label>
          <select
            className="form-input"
            required
            value={selectedBooking}
            onChange={(e) => setSelectedBooking(e.target.value)}
          >
            <option value="">Choose a completed booking</option>
            {unreviewedBookings.map((booking) => (
              <option key={booking.id} value={booking.id}>
                {booking.child_name} with {booking.babysitter_info?.first_name} {booking.babysitter_info?.last_name} - {new Date(booking.start_date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Rating</label>
          <StarSelector value={rating} onChange={setRating} />
        </div>

        <div>
          <label className="form-label">Comment</label>
          <textarea
            className="form-input resize-none"
            rows="4"
            placeholder="Share your experience"
            maxLength={300}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">{comment.length}/300</p>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">Submit Review</button>
        </div>
      </form>
    </div>
  )
}

function DisplayStars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? 'text-pink-500' : 'text-pink-200'}>★</span>
      ))}
    </div>
  )
}

function StarSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl transition-all duration-200 ${star <= value ? 'text-pink-500' : 'text-pink-200 hover:text-pink-300'}`}
          aria-label={`Rate ${star} stars`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
