import api from './axios'

// Parent profile
export const getParentProfile = () => api.get('/parent/profile/me/')
export const updateParentProfile = (payload) => api.put('/parent/profile/me/', payload)
export const patchParentProfile = (formData) => api.patch('/parent/profile/me/', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
})

// Children
export const listChildren = () => api.get('/parent/children/')
export const createChild = (payload) => api.post('/parent/children/', payload)
export const getChildDetail = (id) => api.get(`/parent/children/${id}/`)
export const updateChild = (id, payload) => api.patch(`/parent/children/${id}/`, payload)
export const deleteChild = (id) => api.delete(`/parent/children/${id}/`)

// Requests / bookings
export const listRequests = (params) => api.get('/parent/requests/', { params })
export const createRequest = (payload) => api.post('/parent/requests/', payload)
export const getRequestDetail = (id) => api.get(`/parent/requests/${id}/`)
export const updateRequest = (id, payload) => api.patch(`/parent/requests/${id}/`, payload)
export const deleteRequest = (id) => api.delete(`/parent/requests/${id}/`)
export const cancelRequest = (id) => api.post(`/parent/requests/${id}/cancel/`)
export const upcomingBookings = () => api.get('/parent/requests/upcoming/')
export const pastBookings = () => api.get('/parent/requests/past/')

// Babysitter listings
export const listBabysitters = () => api.get('/parent/listings/')
export const getBabysitterDetail = (id) => api.get(`/parent/listings/${id}/`)
export const babysitterSearch = (params) => api.get('/parent/listings/search/', { params })

// Reviews & history
export const listReviews = (params) => api.get('/parent/reviews/', { params })
export const createReview = (payload) => api.post('/parent/reviews/', payload)
export const getReviewDetail = (id) => api.get(`/parent/reviews/${id}/`)
export const updateReview = (id, payload) => api.patch(`/parent/reviews/${id}/`, payload)
export const deleteReview = (id) => api.delete(`/parent/reviews/${id}/`)
export const bookingHistory = (params) => api.get('/parent/history/', { params })
