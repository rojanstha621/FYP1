import React, { useMemo } from 'react'
import { useReceivedReviews } from '../api/hooks'

export default function BabysitterReviews() {
  const { data: reviews, isLoading } = useReceivedReviews()

  const stats = useMemo(() => {
    if (!reviews || reviews.length === 0) return null

    const totalReviews = reviews.length
    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
    const ratingCounts = reviews.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1
      return acc
    }, {})

    return {
      total: totalReviews,
      average: avgRating.toFixed(1),
      ratingCounts,
    }
  }, [reviews])

  if (isLoading) return <div className="page-wrap max-w-4xl mx-auto px-4">Loading...</div>

  return (
    <div className="page-wrap max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-bold tracking-tight mb-6">My Reviews</h2>

      {stats && (
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center rounded-2xl border border-pink-100 bg-pink-50/40 p-4">
              <div className="text-4xl font-bold text-pink-500">{stats.average}</div>
              <div className="text-sm text-gray-600 mt-1">Average Rating</div>
              <div className="flex justify-center items-center gap-1 mt-2">
                <StarRating rating={Math.round(parseFloat(stats.average))} />
              </div>
            </div>

            <div className="text-center rounded-2xl border border-pink-100 bg-white p-4">
              <div className="text-4xl font-bold text-pink-600">{stats.total}</div>
              <div className="text-sm text-gray-600 mt-1">Total Reviews</div>
            </div>

            <div className="space-y-1 rounded-2xl border border-pink-100 bg-white p-4">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-8">{star}★</span>
                  <div className="flex-1 bg-pink-100 rounded-full h-2">
                    <div
                      className="bg-pink-500 h-2 rounded-full"
                      style={{ width: `${((stats.ratingCounts[star] || 0) / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-gray-600">{stats.ratingCounts[star] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {reviews?.length === 0 ? (
        <div className="card text-center">
          <p className="text-gray-500">No reviews yet</p>
          <p className="text-sm text-gray-400 mt-2">Reviews will appear after parents rate your services</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reviews?.map((review) => (
            <div key={review.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating rating={review.rating} />
                    <span className="text-sm font-semibold">{review.rating}.0</span>
                  </div>
                  {review.parent_info && (
                    <p className="text-sm text-gray-600">by {review.parent_info.first_name} {review.parent_info.last_name}</p>
                  )}
                </div>
                <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
              </div>

              {review.comment && <p className="text-gray-700 leading-relaxed">{review.comment}</p>}

              {review.booking_id && (
                <div className="mt-3 pt-3 border-t border-pink-100 text-xs text-gray-500">Booking ID: {review.booking_id}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? 'text-pink-500' : 'text-pink-200'}>★</span>
      ))}
    </div>
  )
}
