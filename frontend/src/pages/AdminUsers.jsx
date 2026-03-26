import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAdminUsers } from '../api/hooks'
import Alert from '../components/Alert'

export default function AdminUsers() {
  const { data: users, isLoading, isError, refetch } = useAdminUsers()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  if (isLoading) {
    return (
      <div className="page-wrap max-w-6xl mx-auto px-4">
        <Alert>Loading users...</Alert>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="page-wrap max-w-6xl mx-auto px-4">
        <Alert type="error">
          Failed to load users.
          <button onClick={() => refetch()} className="ml-2 text-sm text-pink-600 underline">Retry</button>
        </Alert>
      </div>
    )
  }

  const filteredUsers = users?.filter((user) => {
    const term = searchTerm.toLowerCase()
    const matchesSearch =
      user.email.toLowerCase().includes(term) ||
      user.first_name.toLowerCase().includes(term) ||
      user.last_name.toLowerCase().includes(term)

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' ? user.is_active : !user.is_active)

    return matchesSearch && matchesRole && matchesStatus
  }) || []

  const stats = {
    total: users?.length || 0,
    admins: users?.filter((user) => user.role === 'ADMIN').length || 0,
    parents: users?.filter((user) => user.role === 'PARENT').length || 0,
    babysitters: users?.filter((user) => user.role === 'BABYSITTER').length || 0,
    active: users?.filter((user) => user.is_active).length || 0,
    inactive: users?.filter((user) => !user.is_active).length || 0,
  }

  const getRoleBadge = (role) => {
    if (role === 'ADMIN') return 'status-completed'
    if (role === 'PARENT') return 'status-pending'
    if (role === 'BABYSITTER') return 'status-accepted'
    return 'status-cancelled'
  }

  return (
    <div className="page-wrap max-w-7xl mx-auto px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <button onClick={() => refetch()} className="btn-secondary">Refresh</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Admins" value={stats.admins} />
        <StatCard label="Parents" value={stats.parents} />
        <StatCard label="Babysitters" value={stats.babysitters} />
        <StatCard label="Active" value={stats.active} />
        <StatCard label="Inactive" value={stats.inactive} />
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">Role</label>
            <select className="form-input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="PARENT">Parent</option>
              <option value="BABYSITTER">Babysitter</option>
            </select>
          </div>
          <div>
            <label className="form-label">Status</label>
            <select className="form-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500">Showing {filteredUsers.length} of {stats.total} users</div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-pink-50 border-b border-pink-100">
            <tr>
              <th className="py-3 px-2 text-left text-xs text-gray-500 uppercase">Email</th>
              <th className="py-3 px-2 text-left text-xs text-gray-500 uppercase">Name</th>
              <th className="py-3 px-2 text-left text-xs text-gray-500 uppercase">Phone</th>
              <th className="py-3 px-2 text-left text-xs text-gray-500 uppercase">Role</th>
              <th className="py-3 px-2 text-left text-xs text-gray-500 uppercase">Status</th>
              <th className="py-3 px-2 text-left text-xs text-gray-500 uppercase">Created</th>
              <th className="py-3 px-2 text-left text-xs text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">No users found</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-pink-50 hover:bg-pink-50/40">
                  <td className="py-3 px-2 font-medium">{user.email}</td>
                  <td className="py-3 px-2">{user.first_name} {user.last_name}</td>
                  <td className="py-3 px-2 text-sm text-gray-500">{user.phone_number || '—'}</td>
                  <td className="py-3 px-2"><span className={getRoleBadge(user.role)}>{user.role}</span></td>
                  <td className="py-3 px-2">
                    <span className={user.is_active ? 'status-accepted' : 'status-rejected'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-2">
                    <Link to={`/admin/users/${user.id}`} className="text-pink-600 hover:text-pink-700 text-sm font-medium transition-all duration-200">
                      View Details →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="card">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold tracking-tight text-pink-600">{value}</div>
    </div>
  )
}
