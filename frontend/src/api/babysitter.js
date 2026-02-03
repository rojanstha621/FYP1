import api from './axios'

// Incoming Requests
export const getIncomingRequests = () => api.get('/parent/babysitter/requests/')
export const getRequestDetail = (id) => api.get(`/parent/babysitter/requests/${id}/`)
export const acceptRequest = (id) => api.post(`/parent/babysitter/requests/${id}/accept/`)
export const rejectRequest = (id) => api.post(`/parent/babysitter/requests/${id}/reject/`)

// My Bookings
export const getMyBookings = () => api.get('/parent/babysitter/bookings/')
export const getBookingDetail = (id) => api.get(`/parent/babysitter/bookings/${id}/`)
export const completeBooking = (id) => api.post(`/parent/babysitter/bookings/${id}/complete/`)
export const getUpcomingBookings = () => api.get('/parent/babysitter/bookings/upcoming/')
export const getPastBookings = () => api.get('/parent/babysitter/bookings/past/')

// Reviews Received
export const getReceivedReviews = () => api.get('/parent/babysitter/reviews/')

// Booking History
export const getBabysitterHistory = (params) => api.get('/parent/babysitter/history/', { params })
