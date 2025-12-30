import api from './axios'

export const login = (payload) => api.post('/account/login/', payload)
export const register = (payload) => api.post('/account/register/', payload)
export const logout = (payload) => api.post('/account/logout/', payload)
export const me = () => api.get('/account/me/')
export const updateMe = (payload) => api.patch('/account/me/', payload)
export const profileUpdate = (payload) => api.patch('/account/me/profile-update/', payload)
export const changePassword = (payload) => api.post('/account/change-password/', payload)
export const adminUsers = () => api.get('/account/users/')
export const adminUserDetail = (id) => api.get(`/account/users/${id}/`)
export const adminUserUpdate = (id, payload) => api.patch(`/account/users/${id}/`, payload)
export const adminUserDelete = (id) => api.delete(`/account/users/${id}/`)
