import axios from 'axios'

const API_BASE = 'http://localhost:8000/api/'

const api = axios.create({
  baseURL: API_BASE,
})

// Attach access token if present
api.interceptors.request.use((config) => {
  const access = localStorage.getItem('access')
  if (access) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${access}`
  }
  return config
})

// On 401, try refresh once, otherwise reject
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config
    if (err.response && err.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refresh = localStorage.getItem('refresh')
      if (!refresh) {
        isRefreshing = false
        // No refresh token available - reject and let the app handle redirect to login
        return Promise.reject(err)
      }

      try {
        // Backend may expose token refresh endpoint at /api/token/refresh/
        // Use absolute backend URL to avoid requests being sent to the dev server origin
        const response = await axios.post(API_BASE + 'token/refresh/', { refresh })
        const newAccess = response.data.access
        localStorage.setItem('access', newAccess)
        api.defaults.headers['Authorization'] = `Bearer ${newAccess}`
        processQueue(null, newAccess)
        isRefreshing = false
        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`
        return api(originalRequest)
      } catch (e) {
        processQueue(e, null)
        isRefreshing = false
        // refresh failed -> clear tokens and reject; let app handle navigation
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        return Promise.reject(e)
      }
    }
    return Promise.reject(err)
  }
)

export default api
