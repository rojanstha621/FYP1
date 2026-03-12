import api from './axios'

// Babysitter Availability Management
export const getAvailability = () => api.get('/parent/babysitter/availability/')
export const createAvailability = (payload) => api.post('/parent/babysitter/availability/', payload)
export const updateAvailability = (id, payload) => api.patch(`/parent/babysitter/availability/${id}/`, payload)
export const deleteAvailability = (id) => api.delete(`/parent/babysitter/availability/${id}/`)

// Get availability for a specific babysitter (for parents viewing babysitter profiles)
export const getBabysitterAvailability = (babysitterId) => api.get(`/parent/listings/${babysitterId}/availability/`)

// Get existing bookings for a babysitter on a specific date
export const getBabysitterBookings = (babysitterId, date) => api.get(`/parent/listings/${babysitterId}/bookings/`, {
  params: { date }
})