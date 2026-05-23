import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, UserCheck, Baby, Clock, Calendar, Star, AlertCircle, Search, BookOpen, History } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import {
  useChildren,
  useUpcomingBookings,
  useReviews,
  useAdminUsers,
  useUpdateAdminUser,
  useDeleteAdminUser,
  useIncomingRequests,
  useBabysitterUpcomingBookings,
  useReceivedReviews,
  useRequests,
} from '../api/hooks'
import Alert from '../components/Alert'
import { popPendingToast, pushToast } from '../components/toastStore'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { data: children } = useChildren()
  const { data: upcomingBookings } = useUpcomingBookings()
  const { data: reviews } = useReviews()
  const { data: parentRequests } = useRequests()

  const isAdmin = user?.role === 'ADMIN'
  const { data: allUsers, isLoading: loadingUsers } = useAdminUsers({ enabled: isAdmin })
  const updateUser = useUpdateAdminUser()
  const deleteUser = useDeleteAdminUser()

  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [editingUser, setEditingUser] = useState(null)
  const [alert, setAlert] = useState(null)

  useEffect(() => {
    const pendingToast = popPendingToast()
    if (pendingToast) {
      pushToast(pendingToast)
    }
  }, [])

  const pendingRequestsCount = parentRequests?.filter((request) => request.status === 'PENDING').length || 0

  const filteredUsers = useMemo(() => {
    if (!allUsers || user?.role !== 'ADMIN') return []

    return allUsers.filter((targetUser) => {
      const matchesSearch =
        searchTerm === '' ||
        targetUser.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        targetUser.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        targetUser.email.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole = roleFilter === 'ALL' || targetUser.role === roleFilter
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && targetUser.is_active) ||
        (statusFilter === 'INACTIVE' && !targetUser.is_active)

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [allUsers, searchTerm, roleFilter, statusFilter, user?.role])

  const stats = useMemo(() => {
    if (!allUsers) return null

    return {
      totalUsers: allUsers.length,
      parents: allUsers.filter((targetUser) => targetUser.role === 'PARENT').length,
      babysitters: allUsers.filter((targetUser) => targetUser.role === 'BABYSITTER').length,
      activeUsers: allUsers.filter((targetUser) => targetUser.is_active).length,
      inactiveUsers: allUsers.filter((targetUser) => !targetUser.is_active).length,
    }
  }, [allUsers])

  const handleToggleActive = async (targetUser) => {
    try {
      await updateUser.mutateAsync({
        id: targetUser.id,
        payload: { is_active: !targetUser.is_active },
      })
      setAlert({ type: 'success', message: `User ${targetUser.is_active ? 'deactivated' : 'activated'} successfully` })
    } catch {
      setAlert({ type: 'error', message: 'Failed to update user status' })
    }
  }

  const handleDeleteUser = async (id, name) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return

    try {
      await deleteUser.mutateAsync(id)
      setAlert({ type: 'success', message: 'User deleted successfully' })
    } catch {
      setAlert({ type: 'error', message: 'Failed to delete user' })
    }
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    try {
      await updateUser.mutateAsync({ id: editingUser.id, payload: editingUser })
      setEditingUser(null)
      setAlert({ type: 'success', message: 'User updated successfully' })
    } catch {
      setAlert({ type: 'error', message: 'Failed to update user' })
    }
  }

  return (
    <div className="page-wrap max-w-7xl mx-auto px-4">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <section className="rounded-2xl border border-pink-100 bg-gradient-to-r from-pink-50 via-pink-50 to-pink-100 p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Hello {user?.first_name || 'User'} 👋</h1>
            <p className="text-sm text-gray-600 mt-1">Welcome back to your BabyEase dashboard.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-pink-200 bg-white/70 px-3 py-1 text-xs text-pink-700">
            <span className="inline-flex h-2 w-2 rounded-full bg-pink-500"></span>
            Live updates enabled
          </div>
        </div>
      </section>

      {user?.role === 'ADMIN' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Total Users" value={stats?.totalUsers || 0} subtitle={`${stats?.activeUsers || 0} active`} icon={Users} />
            <StatCard title="Parents" value={stats?.parents || 0} subtitle="Registered parents" icon={UserCheck} />
            <StatCard title="Babysitters" value={stats?.babysitters || 0} subtitle="Registered babysitters" icon={Baby} />
            <StatCard title="Inactive" value={stats?.inactiveUsers || 0} subtitle="Require follow-up" icon={AlertCircle} />
          </div>

          <div className="card mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Basic Admin Panel</h2>
              <Link to="/register" className="btn-primary">+ Create User</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <input
                type="text"
                className="form-input"
                placeholder="Search users"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select className="form-input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="PARENT">Parent</option>
                <option value="BABYSITTER">Babysitter</option>
              </select>
              <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {loadingUsers ? (
              <p className="text-sm text-gray-500">Loading users...</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-pink-100">
                <table className="min-w-full text-sm">
                  <thead className="bg-pink-50 text-gray-600">
                    <tr>
                      <th className="text-left px-4 py-3">Name</th>
                      <th className="text-left px-4 py-3">Email</th>
                      <th className="text-left px-4 py-3">Role</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((targetUser) => (
                      <tr key={targetUser.id} className="border-t border-pink-50">
                        <td className="px-4 py-3">{targetUser.first_name} {targetUser.last_name}</td>
                        <td className="px-4 py-3 text-gray-600">{targetUser.email}</td>
                        <td className="px-4 py-3">
                          <span className="pill">{targetUser.role}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={targetUser.is_active ? 'status-accepted' : 'status-rejected'}>
                            {targetUser.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Link to={`/admin/users/${targetUser.id}`} className="btn-secondary">View</Link>
                            <button onClick={() => setEditingUser(targetUser)} className="btn-secondary">Edit</button>
                            <button onClick={() => handleToggleActive(targetUser)} className="btn-secondary">
                              {targetUser.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button onClick={() => handleDeleteUser(targetUser.id, `${targetUser.first_name} ${targetUser.last_name}`)} className="btn-secondary text-red-500">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {user?.role === 'PARENT' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard title="Active Bookings" value={upcomingBookings?.length || 0} subtitle="Upcoming care sessions" icon={Calendar} />
            <StatCard title="Pending Requests" value={pendingRequestsCount} subtitle="Awaiting babysitter response" icon={Clock} />
            <StatCard title="Children Profiles" value={children?.length || 0} subtitle="Profiles in your account" icon={Baby} />
          </div>

          <div className="card mb-6 bg-gradient-to-br from-white to-pink-50/40">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
              <span className="text-xs text-gray-500">Shortcuts to keep you moving</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link to="/babysitters" className="group rounded-2xl border border-pink-100 bg-white p-4 hover:border-pink-200 hover:bg-pink-50 transition-all duration-200">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-600 group-hover:bg-pink-200 transition-all duration-200">
                    <Search size={18} />
                  </span>
                  <div>
                    <h3 className="font-semibold">Find a Babysitter</h3>
                    <p className="text-sm text-gray-500 mt-1">Browse verified profiles</p>
                  </div>
                </div>
              </Link>
              <Link to="/children" className="group rounded-2xl border border-pink-100 bg-white p-4 hover:border-pink-200 hover:bg-pink-50 transition-all duration-200">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 group-hover:bg-purple-200 transition-all duration-200">
                    <BookOpen size={18} />
                  </span>
                  <div>
                    <h3 className="font-semibold">My Children</h3>
                    <p className="text-sm text-gray-500 mt-1">Manage child details</p>
                  </div>
                </div>
              </Link>
              <Link to="/history" className="group rounded-2xl border border-pink-100 bg-white p-4 hover:border-pink-200 hover:bg-pink-50 transition-all duration-200">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 group-hover:bg-amber-200 transition-all duration-200">
                    <History size={18} />
                  </span>
                  <div>
                    <h3 className="font-semibold">Booking History</h3>
                    <p className="text-sm text-gray-500 mt-1">See completed requests</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-white to-pink-50/40">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Requests</h2>
              <span className="text-xs text-gray-500">Latest activity</span>
            </div>
            <div className="space-y-3">
              {(parentRequests || []).slice(0, 5).map((request) => (
                <div key={request.id} className="rounded-2xl border border-pink-100 bg-white p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{request.child_name || 'No child assigned'}</p>
                    <p className="text-sm text-gray-500">{new Date(request.start_date).toLocaleString()}</p>
                  </div>
                  <span className={`status-${request.status.toLowerCase()}`}>{request.status}</span>
                </div>
              ))}
              {!parentRequests?.length && <p className="text-sm text-gray-500">No requests yet.</p>}
            </div>
          </div>
        </>
      )}

      {user?.role === 'BABYSITTER' && <BabysitterDashboard />}

      <div className="flex justify-end mt-6">
        <button onClick={logout} className="text-sm text-red-500 hover:text-red-600 transition-all duration-200">Log out</button>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="form-label">First Name</label>
                <input value={editingUser.first_name} onChange={(e) => setEditingUser({ ...editingUser, first_name: e.target.value })} className="form-input" required />
              </div>
              <div>
                <label className="form-label">Last Name</label>
                <input value={editingUser.last_name} onChange={(e) => setEditingUser({ ...editingUser, last_name: e.target.value })} className="form-input" required />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input type="email" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} className="form-input" required />
              </div>
              <div>
                <label className="form-label">Role</label>
                <select value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })} className="form-input">
                  <option value="ADMIN">Admin</option>
                  <option value="PARENT">Parent</option>
                  <option value="BABYSITTER">Babysitter</option>
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="btn-primary flex-1">Save</button>
                <button type="button" onClick={() => setEditingUser(null)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function BabysitterDashboard() {
  const { data: incomingRequests } = useIncomingRequests()
  const { data: upcomingBookings } = useBabysitterUpcomingBookings()
  const { data: reviews } = useReceivedReviews()

  const pendingRequests = incomingRequests?.filter((request) => request.status === 'PENDING') || []
  const avgRating = reviews?.length
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Pending Requests" value={pendingRequests.length} subtitle="Need your response" icon={Clock} />
        <StatCard title="Completed Jobs" value={(reviews || []).length} subtitle="Reviewed sessions" icon={Calendar} />
        <StatCard title="Average Rating" value={avgRating} subtitle="From parent reviews" icon={Star} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Incoming Requests</h2>
          <div className="space-y-3">
            {pendingRequests.slice(0, 5).map((request) => (
              <div key={request.id} className="rounded-2xl border border-pink-100 p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{request.parent_email}</p>
                  <p className="text-sm text-gray-500">{new Date(request.start_date).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Link to="/babysitter/requests" className="btn-primary">Accept / Reject</Link>
                </div>
              </div>
            ))}
            {!pendingRequests.length && <p className="text-sm text-gray-500">No incoming requests right now.</p>}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Availability Summary</h2>
          <p className="text-sm text-gray-600 mb-4">Keep your schedule updated so parents can book confidently.</p>
          <Link to="/babysitter/availability" className="btn-primary">Edit Availability</Link>
          <div className="mt-4 rounded-2xl border border-pink-100 bg-pink-50 p-4">
            <p className="text-sm text-pink-700 font-medium">Upcoming Bookings: {upcomingBookings?.length || 0}</p>
          </div>
        </div>
      </div>
    </>
  )
}

function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="card bg-gradient-to-br from-white to-pink-50/40 border border-pink-100 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold tracking-tight mt-1 text-[#1A1A2E]">{value}</p>
          <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
        </div>
        {Icon && (
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  )
}
