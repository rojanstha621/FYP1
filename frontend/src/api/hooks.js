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

// --- Parent / babysitter related hooks ---
import {
  getParentProfile,
  updateParentProfile,
  patchParentProfile,
  listChildren,
  createChild,
  listRequests,
  createRequest,
  cancelRequest,
  babysitterSearch,
  bookingHistory,
} from './parent'

export function useParentProfile() {
  return useQuery(['parentProfile'], () => getParentProfile().then((res) => res.data), {
    enabled: !!localStorage.getItem('access'),
  })
}

export function useUpdateParentProfile() {
  const qc = useQueryClient()
  return useMutation((payload) => updateParentProfile(payload).then((res) => res.data), {
    onSuccess: () => qc.invalidateQueries(['parentProfile', 'me']),
  })
}

export function usePatchParentProfile() {
  const qc = useQueryClient()
  return useMutation((formData) => patchParentProfile(formData).then((res) => res.data), {
    onSuccess: () => qc.invalidateQueries(['parentProfile', 'me']),
  })
}

export function useChildren() {
  return useQuery(['children'], () => listChildren().then((res) => res.data), {
    enabled: !!localStorage.getItem('access'),
  })
}

export function useCreateChild() {
  const qc = useQueryClient()
  return useMutation((payload) => createChild(payload).then((res) => res.data), {
    onSuccess: () => qc.invalidateQueries(['children']),
  })
}

export function useRequests() {
  return useQuery(['requests'], () => listRequests().then((res) => res.data), {
    enabled: !!localStorage.getItem('access'),
  })
}

export function useCreateRequest() {
  const qc = useQueryClient()
  return useMutation((payload) => createRequest(payload).then((res) => res.data), {
    onSuccess: () => qc.invalidateQueries(['requests', 'bookingHistory']),
  })
}

export function useCancelRequest() {
  const qc = useQueryClient()
  return useMutation((id) => cancelRequest(id).then((res) => res.data), {
    onSuccess: () => qc.invalidateQueries(['requests', 'bookingHistory']),
  })
}

export function useBabysittersSearch(params) {
  return useQuery(['babysitters', params], () => babysitterSearch(params).then((res) => res.data), {
    enabled: !!localStorage.getItem('access'),
  })
}

export function useBookingHistory() {
  return useQuery(['bookingHistory'], () => bookingHistory().then((res) => res.data), {
    enabled: !!localStorage.getItem('access'),
  })
}
