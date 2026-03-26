import React, { useMemo, useState } from 'react'
import { useAvailability, useCreateAvailability, useUpdateAvailability, useDeleteAvailability } from '../api/hooks'
import Alert from '../components/Alert'
import { checkTimeSlotOverlap, generateTimeOptions } from '../utils/availability'

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const timeOptions = generateTimeOptions(30)

export default function BabysitterAvailability() {
  const { data: availability, isLoading } = useAvailability()
  const createAvailability = useCreateAvailability()
  const updateAvailability = useUpdateAvailability()
  const deleteAvailability = useDeleteAvailability()

  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [editingSlot, setEditingSlot] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const groupedAvailability = useMemo(() => {
    const grouped = {}
    ;(availability || []).forEach((slot) => {
      if (!grouped[slot.day_of_week]) grouped[slot.day_of_week] = []
      grouped[slot.day_of_week].push(slot)
    })
    return grouped
  }, [availability])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setErrorMessage('')

    const formData = new FormData(e.target)
    const payload = {
      day_of_week: parseInt(formData.get('day_of_week'), 10),
      start_time: formData.get('start_time'),
      end_time: formData.get('end_time'),
    }

    if (payload.start_time >= payload.end_time) {
      setErrorMessage('End time must be after start time.')
      return
    }

    const existingSlots = (availability || [])
      .filter((slot) => slot.day_of_week === payload.day_of_week)
      .filter((slot) => (editingSlot ? slot.id !== editingSlot.id : true))

    const overlapCheck = checkTimeSlotOverlap(existingSlots, payload.start_time, payload.end_time)
    if (overlapCheck.hasOverlap) {
      setErrorMessage(`This slot overlaps with ${overlapCheck.conflictingSlot.start_time} - ${overlapCheck.conflictingSlot.end_time}.`)
      return
    }

    try {
      if (editingSlot) {
        await updateAvailability.mutateAsync({ id: editingSlot.id, payload })
        setMessage('Availability updated successfully!')
      } else {
        await createAvailability.mutateAsync(payload)
        setMessage('Availability added successfully!')
      }

      setShowForm(false)
      setEditingSlot(null)
      e.target.reset()
    } catch (error) {
      const backendError =
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.detail ||
        Object.values(error.response?.data || {}).flat().join(', ') ||
        'Failed to save availability'
      setErrorMessage(backendError)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this availability slot?')) return

    setMessage('')
    setErrorMessage('')

    try {
      await deleteAvailability.mutateAsync(id)
      setMessage('Availability deleted successfully!')
    } catch {
      setErrorMessage('Failed to delete availability.')
    }
  }

  const handleEdit = (slot) => {
    setEditingSlot(slot)
    setShowForm(true)
    setErrorMessage('')
  }

  const openAddModal = () => {
    setEditingSlot(null)
    setShowForm(true)
    setErrorMessage('')
  }

  return (
    <div className="page-wrap max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold tracking-tight">Availability Management</h2>
        <button onClick={openAddModal} className="btn-primary">Add Slot</button>
      </div>

      {message && <Alert type="success" className="mb-4">{message}</Alert>}
      {errorMessage && <Alert type="error" className="mb-4">{errorMessage}</Alert>}

      {isLoading && <p className="text-sm text-gray-500">Loading availability...</p>}

      {!isLoading && (
        <div className="card overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 min-w-[880px] md:min-w-0">
            {dayNames.map((day, dayIndex) => (
              <div key={day} className="rounded-2xl border border-pink-100 bg-pink-50/40 p-3 min-h-[180px]">
                <h3 className="text-sm font-semibold mb-2">{day.slice(0, 3)}</h3>
                <div className="space-y-2">
                  {(groupedAvailability[dayIndex] || []).map((slot) => (
                    <div key={slot.id} className="group flex items-center justify-between rounded-full bg-pink-100 text-pink-700 px-3 py-1 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => handleEdit(slot)}
                        className="text-left hover:underline"
                        title="Edit slot"
                      >
                        {slot.start_time} - {slot.end_time}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(slot.id)}
                        className="ml-2 text-pink-700 hover:text-red-500 transition-all duration-200"
                        aria-label="Delete slot"
                        title="Delete slot"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {(groupedAvailability[dayIndex] || []).length === 0 && (
                    <p className="text-xs text-gray-400">No slots</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center p-4">
          <div className="card w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingSlot ? 'Edit Slot' : 'Add Slot'}</h3>
              <button className="text-pink-600" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="form-label">Day</label>
                <select
                  name="day_of_week"
                  className="form-input"
                  defaultValue={editingSlot?.day_of_week ?? ''}
                  required
                >
                  <option value="">Select day</option>
                  {dayNames.map((day, index) => (
                    <option key={day} value={index}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Start Time</label>
                  <select name="start_time" className="form-input" defaultValue={editingSlot?.start_time || ''} required>
                    <option value="">Select</option>
                    {timeOptions.map((time) => <option key={time} value={time}>{time}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">End Time</label>
                  <select name="end_time" className="form-input" defaultValue={editingSlot?.end_time || ''} required>
                    <option value="">Select</option>
                    {timeOptions.map((time) => <option key={time} value={time}>{time}</option>)}
                  </select>
                </div>
              </div>

              {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

              <div className="flex gap-2 pt-1">
                <button type="submit" className="btn-primary flex-1">{editingSlot ? 'Update Slot' : 'Add Slot'}</button>
                <button type="button" className="btn-secondary flex-1" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
