import React, { useState, useRef } from 'react'
import {
  useActiveBookingsForStory,
  useBabysitterOwnStories,
  useCreateBabysitterStory,
  useDeleteBabysitterStory,
} from '../api/hooks'
import Alert from '../components/Alert'
import { formatTime, formatDateTime } from '../utils/date'

export default function BabysitterStories() {
  const { data: activeBookings, isLoading: loadingBookings } = useActiveBookingsForStory()
  const { data: stories, isLoading: loadingStories } = useBabysitterOwnStories()
  const createStory = useCreateBabysitterStory()
  const deleteStory = useDeleteBabysitterStory()

  const [selectedBooking, setSelectedBooking] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [message, setMessage] = useState('')
  const galleryRef = useRef()
  const cameraRef = useRef()

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const clearImage = () => {
    setImage(null)
    setPreview(null)
    if (galleryRef.current) galleryRef.current.value = ''
    if (cameraRef.current) cameraRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedBooking) return setMessage('Please select an active booking.')
    if (!content.trim()) return setMessage('Story content cannot be empty.')

    const formData = new FormData()
    formData.append('booking', selectedBooking)
    formData.append('content', content)
    if (image) formData.append('image', image)

    setMessage('')
    try {
      await createStory.mutateAsync(formData)
      setContent('')
      clearImage()
      setSelectedBooking('')
      setMessage('Story posted!')
    } catch (err) {
      const detail =
        err?.response?.data?.booking?.[0] ||
        err?.response?.data?.non_field_errors?.[0] ||
        err?.response?.data?.detail ||
        'Failed to post story.'
      setMessage(detail)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this story?')) return
    try {
      await deleteStory.mutateAsync(id)
    } catch {
      setMessage('Failed to delete story.')
    }
  }

  const hasActiveBookings = activeBookings && activeBookings.length > 0

  return (
    <div className="page-wrap max-w-2xl mx-auto px-4">
      <h2 className="text-2xl font-bold tracking-tight mb-1">Stories</h2>
      <p className="text-sm text-gray-500 mb-6">Post live updates for parents during your session.</p>

      {message && (
        <Alert type={message === 'Story posted!' ? 'success' : 'error'} className="mb-4">
          {message}
        </Alert>
      )}

      {/* Post Form */}
      <div className="card mb-8">
        <h3 className="text-base font-semibold mb-4">New Story</h3>

        {loadingBookings ? (
          <p className="text-sm text-gray-400">Checking active sessions...</p>
        ) : !hasActiveBookings ? (
          <div className="rounded-2xl bg-pink-50 border border-pink-100 p-4 text-sm text-gray-600 text-center">
            <p className="font-medium text-pink-600 mb-1">No active session</p>
            Stories can only be posted during an ongoing accepted booking.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
              <select
                value={selectedBooking}
                onChange={(e) => setSelectedBooking(e.target.value)}
                className="input-field w-full"
                required
              >
                <option value="">Select a booking...</option>
                {activeBookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.child_name || 'Child'} — {formatTime(b.start_date)} to {formatTime(b.end_date)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What's happening?</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="input-field w-full resize-none"
                placeholder="Share an update with the parent..."
                required
              />
            </div>

            {/* Photo section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photo (optional)</label>
              {preview ? (
                <div className="relative inline-block">
                  <img src={preview} alt="Preview" className="h-48 w-full object-cover rounded-2xl border border-pink-100" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  {/* Camera button */}
                  <label className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed border-pink-200 hover:border-pink-400 hover:bg-pink-50 cursor-pointer transition-colors">
                    <svg className="h-6 w-6 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <span className="text-xs text-pink-500 font-medium">Take Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      ref={cameraRef}
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                  {/* Gallery button */}
                  <label className="flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-dashed border-pink-200 hover:border-pink-400 hover:bg-pink-50 cursor-pointer transition-colors">
                    <svg className="h-6 w-6 text-pink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    <span className="text-xs text-pink-500 font-medium">From Gallery</span>
                    <input
                      type="file"
                      accept="image/*"
                      ref={galleryRef}
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary w-full" disabled={createStory.isLoading}>
              {createStory.isLoading ? 'Posting...' : 'Post Story'}
            </button>
          </form>
        )}
      </div>

      {/* Posted Stories */}
      <h3 className="text-base font-semibold mb-3 text-gray-700">Your Posted Stories</h3>
      {loadingStories ? (
        <p className="text-gray-400 text-sm text-center py-4">Loading...</p>
      ) : !stories?.length ? (
        <div className="card text-center text-gray-400 text-sm py-6">No stories posted yet.</div>
      ) : (
        <div className="grid gap-3">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

function StoryCard({ story, onDelete }) {
  const info = story.booking_info || {}
  return (
    <div className="card overflow-hidden p-0">
      {story.image && (
        <img src={story.image} alt="Story" className="w-full h-52 object-cover" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="text-sm font-medium text-gray-800">
              {info.child_name || 'Child'}{info.parent_email ? ` · ${info.parent_email}` : ''}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(story.created_at)}</p>
          </div>
          <button
            onClick={() => onDelete(story.id)}
            className="text-xs text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
          >
            Delete
          </button>
        </div>
        <p className="text-gray-700 text-sm whitespace-pre-wrap">{story.content}</p>
      </div>
    </div>
  )
}
