import React, { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../auth/AuthContext"
import { useChildren, useUpcomingBookings, useReviews, useAdminUsers, useUpdateAdminUser, useDeleteAdminUser } from "../api/hooks"
import Alert from "../components/Alert"

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { data: children } = useChildren()
  const { data: upcomingBookings } = useUpcomingBookings()
  const { data: reviews } = useReviews()
  const { data: allUsers, isLoading: loadingUsers } = useAdminUsers()
  const updateUser = useUpdateAdminUser()
  const deleteUser = useDeleteAdminUser()

  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [editingUser, setEditingUser] = useState(null)
  const [alert, setAlert] = useState(null)

  const roleLabel = {
    PARENT: "Parent",
    BABYSITTER: "Babysitter",
    ADMIN: "Admin",
  }

  // Filter users for admin
  const filteredUsers = useMemo(() => {
    if (!allUsers || user?.role !== 'ADMIN') return []
    
    return allUsers.filter(u => {
      const matchesSearch = searchTerm === '' || 
        u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
      const matchesStatus = statusFilter === 'ALL' || 
        (statusFilter === 'ACTIVE' && u.is_active) ||
        (statusFilter === 'INACTIVE' && !u.is_active)
      
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [allUsers, searchTerm, roleFilter, statusFilter, user?.role])

  // Admin statistics
  const stats = useMemo(() => {
    if (!allUsers) return null
    return {
      totalUsers: allUsers.length || 0,
      admins: allUsers.filter(u => u.role === 'ADMIN').length || 0,
      parents: allUsers.filter(u => u.role === 'PARENT').length || 0,
      babysitters: allUsers.filter(u => u.role === 'BABYSITTER').length || 0,
      activeUsers: allUsers.filter(u => u.is_active).length || 0,
      inactiveUsers: allUsers.filter(u => !u.is_active).length || 0,
    }
  }, [allUsers])

  const getPercentage = (value, total) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : 0
  }

  // Handle user activation toggle
  const handleToggleActive = async (targetUser) => {
    try {
      await updateUser.mutateAsync({
        id: targetUser.id,
        payload: { is_active: !targetUser.is_active }
      })
      setAlert({ type: 'success', message: `User ${targetUser.is_active ? 'deactivated' : 'activated'} successfully` })
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to update user status' })
    }
  }

  // Handle user deletion
  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return
    }
    
    try {
      await deleteUser.mutateAsync(userId)
      setAlert({ type: 'success', message: 'User deleted successfully' })
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to delete user' })
    }
  }

  // Handle save edit
  const handleSaveEdit = async (e) => {
    e.preventDefault()
    try {
      await updateUser.mutateAsync({
        id: editingUser.id,
        payload: editingUser
      })
      setEditingUser(null)
      setAlert({ type: 'success', message: 'User updated successfully' })
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to update user' })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">
          Welcome, {user?.first_name || "User"} 👋
        </h1>
        <p className="text-sm text-textSecondary mt-1">
          Role: <span className="font-medium">{roleLabel[user?.role]}</span>
        </p>
      </div>

      {/* ADMIN SECTION */}
      {user?.role === "ADMIN" && (
        <>
          {/* Statistics Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Total Users */}
              <div className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-textSecondary">Total Users</h3>
                    <p className="text-3xl font-semibold mt-2">{stats.totalUsers}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">{stats.activeUsers} active</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-red-600">{stats.inactiveUsers} inactive</span>
                </div>
              </div>

              {/* Parents */}
              <div className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-textSecondary">Parents</h3>
                    <p className="text-3xl font-semibold mt-2">{stats.parents}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 text-sm text-textSecondary">
                  {getPercentage(stats.parents, stats.totalUsers)}% of total users
                </div>
              </div>

              {/* Babysitters */}
              <div className="card">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-textSecondary">Babysitters</h3>
                    <p className="text-3xl font-semibold mt-2">{stats.babysitters}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 text-sm text-textSecondary">
                  {getPercentage(stats.babysitters, stats.totalUsers)}% of total users
                </div>
              </div>
            </div>
          )}

          {/* User Management Section */}
          <div className="card mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">User Management</h2>
              <Link to="/register" className="btn-primary">
                + Create New User
              </Link>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="PARENT">Parent</option>
                <option value="BABYSITTER">Babysitter</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Users Table */}
            {loadingUsers ? (
              <div className="text-center py-8 text-textSecondary">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-textSecondary">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium">{u.first_name} {u.last_name}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {u.email}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          {u.phone_number || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.role === 'ADMIN' ? 'bg-yellow-100 text-yellow-800' :
                            u.role === 'PARENT' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <Link
                              to={`/admin/users/${u.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => setEditingUser(u)}
                              className="text-green-600 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleActive(u)}
                              className="text-orange-600 hover:underline"
                            >
                              {u.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, `${u.first_name} ${u.last_name}`)}
                              className="text-red-600 hover:underline"
                            >
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

      {/* PARENT SECTION */}
      {user?.role === "PARENT" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <div className="card">
              <h3 className="text-sm font-medium text-textSecondary">
                My Children
              </h3>
              <p className="text-2xl font-semibold mt-2">
                {children?.length || 0}
              </p>
              <Link to="/children" className="text-xs text-primary hover:underline mt-1 inline-block">
                Manage children →
              </Link>
            </div>

            <div className="card">
              <h3 className="text-sm font-medium text-textSecondary">
                Upcoming Bookings
              </h3>
              <p className="text-2xl font-semibold mt-2">
                {upcomingBookings?.length || 0}
              </p>
              <Link to="/requests" className="text-xs text-primary hover:underline mt-1 inline-block">
                View all requests →
              </Link>
            </div>

            <div className="card">
              <h3 className="text-sm font-medium text-textSecondary">
                Reviews Given
              </h3>
              <p className="text-2xl font-semibold mt-2">
                {reviews?.length || 0}
              </p>
              <Link to="/reviews" className="text-xs text-primary hover:underline mt-1 inline-block">
                Manage reviews →
              </Link>
            </div>
          </div>

          <div className="card mb-8">
            <h2 className="text-lg font-semibold mb-4">
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/babysitters"
                className="block rounded-lg border p-sm hover:bg-primary"
              >
                <h3 className="font-medium">Find Babysitter</h3>
                <p className="text-sm text-textSecondary mt-1">
                  Search and hire verified babysitters
                </p>
              </Link>

              <Link
                to="/children"
                className="block rounded-lg border p-sm hover:bg-primary"
              >
                <h3 className="font-medium">Manage Children</h3>
                <p className="text-sm text-textSecondary mt-1">
                  Add or update child profiles
                </p>
              </Link>

              <Link
                to="/requests"
                className="block rounded-lg border p-sm hover:bg-primary"
              >
                <h3 className="font-medium">My Requests</h3>
                <p className="text-sm text-textSecondary mt-1">
                  View and manage booking requests
                </p>
              </Link>

              <Link
                to="/history"
                className="block rounded-lg border p-sm hover:bg-primary"
              >
                <h3 className="font-medium">Booking History</h3>
                <p className="text-sm text-textSecondary mt-1">
                  View past completed bookings
                </p>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* BABYSITTER SECTION */}
      {user?.role === "BABYSITTER" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <div className="card">
              <h3 className="text-sm font-medium text-textSecondary">
                Today's Activity
              </h3>
              <p className="text-2xl font-semibold mt-2">—</p>
              <p className="text-xs text-textSecondary mt-1">
                Feeding, sleep, diaper logs
              </p>
            </div>

            <div className="card">
              <h3 className="text-sm font-medium text-textSecondary">
                Notifications
              </h3>
              <p className="text-2xl font-semibold mt-2">—</p>
              <p className="text-xs text-textSecondary mt-1">
                Recent updates & alerts
              </p>
            </div>

            <div className="card">
              <h3 className="text-sm font-medium text-textSecondary">
                Account Status
              </h3>
              <p className="text-2xl font-semibold mt-2 text-success">
                Active
              </p>
              <p className="text-xs text-textSecondary mt-1">
                Email verified & secure
              </p>
            </div>
          </div>

          <div className="card mb-8">
            <h2 className="text-lg font-semibold mb-4">
              Babysitter Actions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/jobs"
                className="block rounded-lg border p-sm hover:bg-primary"
              >
                <h3 className="font-medium">My Jobs</h3>
                <p className="text-sm text-textSecondary mt-1">
                  View and manage assigned jobs
                </p>
              </Link>

              <Link
                to="/activities"
                className="block rounded-lg border p-sm hover:bg-primary"
              >
                <h3 className="font-medium">Log Baby Activity</h3>
                <p className="text-sm text-textSecondary mt-1">
                  Feeding, sleep, diaper, notes
                </p>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Footer actions */}
      <div className="flex justify-end">
        <button
          onClick={logout}
          className="text-sm text-danger hover:underline"
        >
          Log out
        </button>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            <form onSubmit={handleSaveEdit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    value={editingUser.first_name}
                    onChange={(e) => setEditingUser({...editingUser, first_name: e.target.value})}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    value={editingUser.last_name}
                    onChange={(e) => setEditingUser({...editingUser, last_name: e.target.value})}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    className="input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingUser.phone_number || ''}
                    onChange={(e) => setEditingUser({...editingUser, phone_number: e.target.value})}
                    className="input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                    className="input w-full"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="PARENT">Parent</option>
                    <option value="BABYSITTER">Babysitter</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
