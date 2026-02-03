import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminUsers, adminUserDetail, adminUserUpdate, adminUserDelete } from './account'

export function useAdminUsers(options = {}) {
  return useQuery(['adminUsers'], () => adminUsers().then((res) => res.data), {
    enabled: options.enabled !== false,
    ...options,
  })
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
  getChildDetail,
  updateChild,
  deleteChild,
  listRequests,
  createRequest,
  getRequestDetail,
  updateRequest,
  deleteRequest,
  cancelRequest,
  upcomingBookings,
  pastBookings,
  listBabysitters,
  getBabysitterDetail,
  babysitterSearch,
  listReviews,
  createReview,
  getReviewDetail,
  updateReview,
  deleteReview,
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

export function useChildDetail(id) {
  return useQuery(['child', id], () => getChildDetail(id).then((res) => res.data), {
    enabled: !!id && !!localStorage.getItem('access'),
  })
}

export function useCreateChild() {
  const qc = useQueryClient()
  return useMutation((payload) => createChild(payload).then((res) => res.data), {
    onSuccess: () => qc.invalidateQueries(['children']),
  })
}

export function useUpdateChild() {
  const qc = useQueryClient()
  return useMutation(({ id, payload }) => updateChild(id, payload).then((res) => res.data), {
    onSuccess: () => {
      qc.invalidateQueries(['children'])
      qc.invalidateQueries(['child'])
    },
  })
}

export function useDeleteChild() {
  const qc = useQueryClient()
  return useMutation((id) => deleteChild(id).then((res) => res.data), {
    onSuccess: () => qc.invalidateQueries(['children']),
  })
}

export function useRequests() {
  return useQuery(['requests'], () => listRequests().then((res) => res.data), {
    enabled: !!localStorage.getItem('access'),
  })
}

export function useRequestDetail(id) {
  return useQuery(['request', id], () => getRequestDetail(id).then((res) => res.data), {
    enabled: !!id && !!localStorage.getItem('access'),
  })
}

export function useCreateRequest() {
  const qc = useQueryClient()
  return useMutation((payload) => createRequest(payload).then((res) => res.data), {
    onSuccess: () => qc.invalidateQueries(['requests', 'bookingHistory']),
  })
}

export function useUpdateRequest() {
  const qc = useQueryClient()
  return useMutation(({ id, payload }) => updateRequest(id, payload).then((res) => res.data), {
    onSuccess: () => {
      qc.invalidateQueries(['requests'])
      qc.invalidateQueries(['request'])
      qc.invalidateQueries(['bookingHistory'])
    },
  })
}

export function useDeleteRequest() {
  const qc = useQueryClient()
  return useMutation((id) => deleteRequest(id).then((res) => res.data), {
    onSuccess: () => qc.invalidateQueries(['requests', 'bookingHistory']),
  })
}

export function useCancelRequest() {
  const qc = useQueryClient()
  return useMutation((id) => cancelRequest(id).then((res) => res.data), {
    onSuccess: () => qc.invalidateQueries(['requests', 'bookingHistory']),
  })
}

export function useUpcomingBookings() {
  return useQuery(['upcomingBookings'], () => upcomingBookings().then((res) => res.data), {
    enabled: !!localStorage.getItem('access'),
  })
}

export function usePastBookings() {
  return useQuery(['pastBookings'], () => pastBookings().then((res) => res.data), {
    enabled: !!localStorage.getItem('access'),
  })
}

export function useBabysitters() {
  return useQuery(['babysitters'], () => listBabysitters().then((res) => res.data), {
    enabled: !!localStorage.getItem('access'),
  })
}

export function useBabysitterDetail(id) {
  return useQuery(['babysitter', id], () => getBabysitterDetail(id).then((res) => res.data), {
    enabled: !!id && !!localStorage.getItem('access'),
  })
}

export function useBabysittersSearch(params) {
  return useQuery(['babysitters', params], () => babysitterSearch(params).then((res) => res.data), {
    enabled: !!localStorage.getItem('access'),
  })
}

export function useReviews() {
  return useQuery(['reviews'], () => listReviews().then((res) => res.data), {
    enabled: !!localStorage.getItem('access'),
  })
}

export function useReviewDetail(id) {
  return useQuery(['review', id], () => getReviewDetail(id).then((res) => res.data), {
    enabled: !!id && !!localStorage.getItem('access'),
  })
}

export function useCreateReview() {
  const qc = useQueryClient()
  return useMutation((payload) => createReview(payload).then((res) => res.data), {
    onSuccess: () => {
      qc.invalidateQueries(['reviews'])
      qc.invalidateQueries(['bookingHistory'])
      qc.invalidateQueries(['requests'])
    },
  })
}

export function useUpdateReview() {
  const qc = useQueryClient()
  return useMutation(({ id, payload }) => updateReview(id, payload).then((res) => res.data), {
    onSuccess: () => {
      qc.invalidateQueries(['reviews'])
      qc.invalidateQueries(['review'])
    },
  })
}

export function useDeleteReview() {
  const qc = useQueryClient()
  return useMutation((id) => deleteReview(id).then((res) => res.data), {
    onSuccess: () => qc.invalidateQueries(['reviews']),
  })
}

export function useBookingHistory() {
  return useQuery(['bookingHistory'], () => bookingHistory().then((res) => res.data), {
    enabled: !!localStorage.getItem('access'),
  })
}

// --- Babysitter hooks ---
import {
  getIncomingRequests,
  getRequestDetail as getBabysitterRequestDetail,
  acceptRequest,
  rejectRequest,
  getMyBookings,
  getBookingDetail,
  completeBooking,
  getUpcomingBookings as getBabysitterUpcomingBookings,
  getPastBookings as getBabysitterPastBookings,
  getReceivedReviews,
  getBabysitterHistory,
} from './babysitter'

export function useIncomingRequests() {
  return useQuery(['incomingRequests'], () => getIncomingRequests().then((res) => res.data), {
    enabled: !!localStorage.getItem('access'),
  })
}

export function useBabysitterRequestDetail(id) {
  return useQuery(['babysitterRequest', id], () => getBabysitterRequestDetail(id).then((res) => res.data), {
    enabled: !!id && !!localStorage.getItem('access'),
  })
}

export function useAcceptRequest() {
  const qc = useQueryClient()
  return useMutation((id) => acceptRequest(id).then((res) => res.data), {
    onSuccess: () => {
      qc.invalidateQueries(['incomingRequests'])
      qc.invalidateQueries(['myBookings'])
      qc.invalidateQueries(['babysitterRequest'])
    },
  })
}

export function useRejectRequest() {
  const qc = useQueryClient()
  return useMutation((id) => rejectRequest(id).then((res) => res.data), {
    onSuccess: () => {
      qc.invalidateQueries(['incomingRequests'])
      qc.invalidateQueries(['babysitterRequest'])
    },
  })
}

export function useMyBookings() {
  return useQuery(['myBookings'], () => getMyBookings().then((res) => res.data), {
    enabled: !!localStorage.getItem('access'),
  })
}

export function useBabysitterBookingDetail(id) {
  return useQuery(['babysitterBooking', id], () => getBookingDetail(id).then((res) => res.data), {
    enabled: !!id && !!localStorage.getItem('access'),
  })
}

export function useCompleteBooking() {
  const qc = useQueryClient()
  return useMutation((id) => completeBooking(id).then((res) => res.data), {
    onSuccess: () => {
      qc.invalidateQueries(['myBookings'])
      qc.invalidateQueries(['babysitterBooking'])
      qc.invalidateQueries(['babysitterHistory'])
    },
  })
}

export function useBabysitterUpcomingBookings() {
  return useQuery(['babysitterUpcomingBookings'], () => getBabysitterUpcomingBookings().then((res) => res.data), {
    enabled: !!localStorage.getItem('access'),
  })
}

export function useBabysitterPastBookings() {
  return useQuery(['babysitterPastBookings'], () => getBabysitterPastBookings().then((res) => res.data), {
    enabled: !!localStorage.getItem('access'),
  })
}

export function useReceivedReviews() {
  return useQuery(['receivedReviews'], () => getReceivedReviews().then((res) => res.data), {
    enabled: !!localStorage.getItem('access'),
  })
}

export function useBabysitterHistory(params) {
  return useQuery(['babysitterHistory', params], () => getBabysitterHistory(params).then((res) => res.data), {
    enabled: !!localStorage.getItem('access'),
  })
}
