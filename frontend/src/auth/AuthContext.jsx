import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useMe } from '../api/hooks'
import { login as loginApi, logout as logoutApi, register as registerApi, me as fetchMe } from '../api/account'
import api from '../api/axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data, isLoading, refetch } = useMe()
  const [user, setUser] = useState(null)

  useEffect(() => {
    setUser(data?.user ?? null)
  }, [data])

  // expose a setter that also updates the cached `me` query
  const setUserAndCache = (userObj) => {
    setUser(userObj)
    const cached = qc.getQueryData(['me']) || {}
    qc.setQueryData(['me'], { ...cached, user: userObj })
  }

  const login = async (credentials) => {
    const res = await loginApi(credentials)
    const { access, refresh } = res.data
    localStorage.setItem('access', access)
    localStorage.setItem('refresh', refresh)
    api.defaults.headers['Authorization'] = `Bearer ${access}`
    // ensure `me` is fetched immediately even if query was initially disabled
    try {
      await qc.fetchQuery(['me'], () => fetchMe().then((r) => r.data))
    } catch (e) {
      // ignore fetch errors here; app will show login state
    }
    navigate('/dashboard')
  }

  const register = async (payload) => {
    await registerApi(payload)
    navigate('/login')
  }

  const logout = async () => {
    const refresh = localStorage.getItem('refresh')
    try {
      if (refresh) await logoutApi({ refresh })
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    qc.removeQueries(['me'])
    setUser(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, loading: isLoading, login, logout, register, setUser: setUserAndCache }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
