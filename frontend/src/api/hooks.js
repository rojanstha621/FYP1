import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminUsers, adminUserDetail, adminUserUpdate, adminUserDelete } from './account'

export function useAdminUsers() {
  return useQuery(['adminUsers'], () => adminUsers().then((res) => res.data))
}

export function useAdminUser(id) {
  return useQuery(['adminUser', id], () => adminUserDetail(id).then((res) => res.data), {
    enabled: !!id,
  })
}

export function useUpdateAdminUser() {
  const qc = useQueryClient()
  return useMutation(({ id, payload }) => adminUserUpdate(id, payload).then((res) => res.data), {
    onSuccess: () => qc.invalidateQueries(['adminUsers']),
  })
}

export function useDeleteAdminUser() {
  const qc = useQueryClient()
  return useMutation((id) => adminUserDelete(id).then((res) => res.data), {
    onSuccess: () => qc.invalidateQueries(['adminUsers']),
  })
}

// --- Me / profile hooks ---
import { me, updateMe, profileUpdate, changePassword } from './account'

export function useMe() {
  return useQuery(['me'], () => me().then((res) => res.data), {
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false,
    // Only attempt to fetch if we have an access token cached
    enabled: !!localStorage.getItem('access'),
  })
}

export function useUpdateMe() {
  const qc = useQueryClient()
  return useMutation((payload) => updateMe(payload).then((res) => res.data), {
    onSuccess: () => qc.invalidateQueries(['me']),
  })
}

export function useProfileUpdate() {
  const qc = useQueryClient()
  return useMutation((formData) => profileUpdate(formData).then((res) => res.data), {
    onSuccess: () => qc.invalidateQueries(['me']),
  })
}

export function useChangePassword() {
  return useMutation((payload) => changePassword(payload).then((res) => res.data))
}
