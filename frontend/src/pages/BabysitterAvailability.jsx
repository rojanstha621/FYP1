import React, { useState } from 'react'
import { useAvailability, useCreateAvailability, useUpdateAvailability, useDeleteAvailability } from '../api/hooks'
import Alert from '../components/Alert'
import { checkTimeSlotOverlap, generateTimeOptions } from '../utils/availability'

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const timeOptions = generateTimeOptions(30) // 30-minute intervals

export default function BabysitterAvailability() {
  const { data: availability, isLoading } = useAvailability()
  const createAvailability = useCreateAvailability()
  const updateAvailability = useUpdateAvailability()
  const deleteAvailability = useDeleteAvailability()
  
  const [message, setMessage] = useState('')
  const [editingSlot, setEditingSlot] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    
    const formData = new FormData(e.target)
    const payload = {
      day_of_week: parseInt(formData.get('day_of_week')),
      start_time: formData.get('start_time'),
      end_time: formData.get('end_time'),
    }

    // Client-side validation
    if (payload.start_time >= payload.end_time) {
      setMessage('End time must be after start time')
      return
    }

    // Check for overlaps with existing slots (if not editing)
    if (!editingSlot && availability) {
      const existingSlotsForDay = availability.filter(
        slot => slot.day_of_week === payload.day_of_week
      )
      
      const overlapCheck = checkTimeSlotOverlap(
        existingSlotsForDay, 
        payload.start_time, 
        payload.end_time
      )
      
      if (overlapCheck.hasOverlap) {
        setMessage(`This time slot overlaps with existing availability: ${overlapCheck.conflictingSlot.start_time}-${overlapCheck.conflictingSlot.end_time}`)
        return
      }
    }

    try {
      if (editingSlot) {
        await updateAvailability.mutateAsync({ id: editingSlot.id, payload })
        setMessage('Availability updated successfully!')
        setEditingSlot(null)
      } else {
        await createAvailability.mutateAsync(payload)
        setMessage('Availability added successfully!')
      }
      setShowForm(false)
      e.target.reset()
    } catch (error) {
      const errorMsg = error.response?.data?.non_field_errors?.[0] ||
                      error.response?.data?.detail ||
                      Object.values(error.response?.data || {}).flat().join(', ') ||
                      'Failed to save availability'
      setMessage(errorMsg)
    }
  }

  const handleEdit = (slot) => {
    setEditingSlot(slot)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this availability slot?')) return
    
    setMessage('')
    try {
      await deleteAvailability.mutateAsync(id)
      setMessage('Availability deleted successfully!')
    } catch (error) {
      setMessage('Failed to delete availability')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingSlot(null)
    setMessage('')
  }

  const groupedAvailability = {}
  if (availability) {
    availability.forEach(slot => {
      if (!groupedAvailability[slot.day_of_week]) {
        groupedAvailability[slot.day_of_week] = []
      }
      groupedAvailability[slot.day_of_week].push(slot)
    })
  }

  return (
    <div className="mt-8 max-w-4xl mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">My Availability</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : 'Add Availability'}
        </button>
      </div>

      {message && (
        <Alert type={message.includes('successfully') ? 'success' : 'error'} className="mb-4">
          {message}
        </Alert>
      )}

      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">
            {editingSlot ? 'Edit Availability' : 'Add New Availability'}
          </h3>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <label className="form-label">Day of Week *</label>
              <select 
                name="day_of_week" 
                className="form-input"
                defaultValue={editingSlot?.day_of_week || ''}
                required
              >
                <option value="">Select a day</option>
                {dayNames.map((day, index) => (
                  <option key={index} value={index}>{day}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Start Time *</label>
                <select 
                  name="start_time" 
                  className="form-input"
                  defaultValue={editingSlot?.start_time || ''}
                  required
                >
                  <option value="">Select start time</option>
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">End Time *</label>
                <select 
                  name="end_time" 
                  className="form-input"
                  defaultValue={editingSlot?.end_time || ''}
                  required
                >
                  <option value="">Select end time</option>
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                {editingSlot ? 'Update' : 'Add'} Availability
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading && <div className="text-gray-500">Loading availability...</div>}

      {!isLoading && availability?.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">You haven't set up any availability yet.</p>
          <p className="text-sm text-gray-400">
            Add your available time slots so parents can book appointments with you.
          </p>
        </div>
      )}

      {!isLoading && availability?.length > 0 && (
        <div className="space-y-6">
          {dayNames.map((dayName, dayIndex) => {
            const daySlots = groupedAvailability[dayIndex] || []
            if (daySlots.length === 0) return null

            return (
              <div key={dayIndex} className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">{dayName}</h3>
                </div>
                <div className="px-6 py-4">
                  <div className="space-y-3">
                    {daySlots.map((slot) => (
                      <div 
                        key={slot.id} 
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-sm font-medium">
                            {slot.start_time} - {slot.end_time}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEdit(slot)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(slot.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Tips:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• You can add multiple time slots for each day</li>
          <li>• Time slots cannot overlap on the same day</li>
          <li>• Parents can only book appointments during your available hours</li>
          <li>• Update your availability regularly to stay current</li>
        </ul>
      </div>
    </div>
  )
}