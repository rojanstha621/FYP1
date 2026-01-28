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
      <div className="p-base">
        <Alert>Loading users...</Alert>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4">
        <Alert type="error">
          Failed to load users.{' '}
          <button onClick={() => refetch()} className="ml-2 text-sm text-accent underline">
            Retry
          </button>
        </Alert>
      </div>
    )
  }

  // Filter users
  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' ? user.is_active : !user.is_active)
    
    return matchesSearch && matchesRole && matchesStatus
  }) || []

  // Statistics
  const stats = {
    total: users?.length || 0,
    admins: users?.filter(u => u.role === 'ADMIN').length || 0,
    parents: users?.filter(u => u.role === 'PARENT').length || 0,
    babysitters: users?.filter(u => u.role === 'BABYSITTER').length || 0,
    active: users?.filter(u => u.is_active).length || 0,
    inactive: users?.filter(u => !u.is_active).length || 0,
  }

  const getRoleBadge = (role) => {
    const colors = {
      ADMIN: 'bg-purple-100 text-purple-800',
      PARENT: 'bg-blue-100 text-blue-800',
      BABYSITTER: 'bg-green-100 text-green-800',
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role] || 'bg-gray-100'}`}>
        {role}
      </span>
    )
  }

  return (
    <div className="mt-8 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <button onClick={() => refetch()} className="btn-secondary">
          🔄 Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="card">
          <div className="text-sm text-textSecondary">Total Users</div>
          <div className="text-2xl font-semibold">{stats.total}</div>
        </div>
        <div className="card">
          <div className="text-sm text-textSecondary">Admins</div>
          <div className="text-2xl font-semibold text-purple-600">{stats.admins}</div>
        </div>
        <div className="card">
          <div className="text-sm text-textSecondary">Parents</div>
          <div className="text-2xl font-semibold text-blue-600">{stats.parents}</div>
        </div>
        <div className="card">
          <div className="text-sm text-textSecondary">Babysitters</div>
          <div className="text-2xl font-semibold text-green-600">{stats.babysitters}</div>
        </div>
        <div className="card">
          <div className="text-sm text-textSecondary">Active</div>
          <div className="text-2xl font-semibold text-green-600">{stats.active}</div>
        </div>
        <div className="card">
          <div className="text-sm text-textSecondary">Inactive</div>
          <div className="text-2xl font-semibold text-red-600">{stats.inactive}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="form-label">Role</label>
            <select
              className="form-input"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="PARENT">Parent</option>
              <option value="BABYSITTER">Babysitter</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="form-label">Status</label>
            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-textSecondary">
          Showing {filteredUsers.length} of {stats.total} users
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full table-auto" role="table" aria-labelledby="users-table-caption">
            <caption id="users-table-caption" className="sr-only">
              List of users
            </caption>
            <thead>
              <tr className="text-left border-b">
                <th scope="col" className="py-3 px-2">Email</th>
                <th scope="col" className="py-3 px-2">Name</th>
                <th scope="col" className="py-3 px-2">Phone</th>
                <th scope="col" className="py-3 px-2">Role</th>
                <th scope="col" className="py-3 px-2">Status</th>
                <th scope="col" className="py-3 px-2">Created</th>
                <th scope="col" className="py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-textSecondary">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-gray-50" role="row">
                    <td className="py-3 px-2">
                      <div className="font-medium">{u.email}</div>
                    </td>
                    <td className="py-3 px-2">
                      {u.first_name} {u.last_name}
                    </td>
                    <td className="py-3 px-2 text-sm text-textSecondary">
                      {u.phone_number || '—'}
                    </td>
                    <td className="py-3 px-2">
                      {getRoleBadge(u.role)}
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          u.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm text-textSecondary">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-2">
                      <Link
                        to={`/admin/users/${u.id}`}
                        className="text-primary hover:underline text-sm font-medium"
                      >
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
    </div>
  )
}
