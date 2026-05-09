import api from './axios'

export const login = (payload) => api.post('/account/login/', payload)

export const register = (payload, citizenshipDoc) => {
  const formData = new FormData()
  formData.append('email', payload.email)
  formData.append('first_name', payload.first_name)
  formData.append('last_name', payload.last_name)
  formData.append('phone_number', payload.phone_number)
  formData.append('role', payload.role)
  formData.append('password', payload.password)

  if (citizenshipDoc) {
    formData.append('citizenship_document', citizenshipDoc)
  }

  return api.post('/account/register/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const logout = (payload) => api.post('/account/logout/', payload)
export const me = () => api.get('/account/me/')
export const updateMe = (payload) => api.patch('/account/me/', payload)
export const profileUpdate = (payload) => api.patch('/account/me/profile-update/', payload)
export const changePassword = (payload) => api.post('/account/change-password/', payload)
export const adminUsers = () => api.get('/account/users/')
export const adminUserDetail = (id) => api.get(`/account/users/${id}/`)
export const adminUserUpdate = (id, payload) => api.patch(`/account/users/${id}/`, payload)
export const adminUserDelete = (id) => api.delete(`/account/users/${id}/`)
