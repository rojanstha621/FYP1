import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAdminUser, useUpdateAdminUser, useDeleteAdminUser } from '../api/hooks'
import Alert from '../components/Alert'

export default function AdminUserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: user, isLoading, isError, refetch } = useAdminUser(id)
  const updateUser = useUpdateAdminUser()
  const deleteUser = useDeleteAdminUser()
  const [message, setMessage] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (isError) {
      setMessage('Failed to load user')
    }
  }, [isError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    const form = new FormData(e.target)
    const payload = {
      email: form.get('email'),
      first_name: form.get('first_name'),
      last_name: form.get('last_name'),
      phone_number: form.get('phone_number'),
      role: form.get('role'),
      is_active: form.get('is_active') === 'on',
    }

    try {
      await updateUser.mutateAsync({ id, payload })
      await refetch()
      setMessage('User updated successfully')
      setIsEditing(false)
    } catch (e) {
      setMessage('Update failed: ' + (e.response?.data?.detail || e.message))
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    try {
      await deleteUser.mutateAsync(id)
      navigate('/admin/users')
    } catch (e) {
      setMessage('Delete failed: ' + (e.response?.data?.detail || e.message))
    }
  }

  const toggleActive = async () => {
    if (!window.confirm(`Are you sure you want to ${user.is_active ? 'deactivate' : 'activate'} this user?`)) return
    try {
      await updateUser.mutateAsync({ 
        id, 
        payload: { is_active: !user.is_active } 
      })
      await refetch()
      setMessage(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`)
    } catch (e) {
      setMessage('Status update failed')
    }
  }

  if (isLoading) {
    return (
      <div className="p-base">
        <div className="text-center text-gray-500">Loading user...</div>
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6">
        <Alert type="error">Failed to load user</Alert>
        <Link to="/admin/users" className="text-primary hover:underline mt-4 inline-block">
          ← Back to Users
        </Link>
      </div>
    )
  }

  const getRoleBadge = (role) => {
    const colors = {
      ADMIN: 'bg-purple-100 text-purple-800',
      PARENT: 'bg-blue-100 text-blue-800',
      BABYSITTER: 'bg-green-100 text-green-800',
    }
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[role] || 'bg-gray-100'}`}>
        {role}
      </span>
    )
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/admin/users" className="text-primary hover:underline">
          ← Back to Users
        </Link>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <button onClick={() => setIsEditing(true)} className="btn-primary">
                Edit User
              </button>
              <button
                onClick={toggleActive}
                className={`btn-secondary ${
                  user.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                }`}
              >
                {user.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={handleDelete} className="btn-secondary text-red-600 hover:bg-red-50">
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <h1 className="text-2xl font-semibold mb-4">User Details</h1>

      {message && (
        <Alert type={message.includes('failed') || message.includes('Failed') ? 'error' : 'success'} className="mb-4">
          {message}
        </Alert>
      )}

      {isEditing ? (
        /* Edit Form */
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Edit User Information</h2>
          <form onSubmit={handleSubmit} className="grid gap-4" aria-labelledby="admin-user-heading">
            <div>
              <label htmlFor="admin-email" className="form-label">Email *</label>
              <input
                id="admin-email"
                name="email"
                type="email"
                defaultValue={user.email}
                className="form-input"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="admin-first" className="form-label">First Name *</label>
                <input
                  id="admin-first"
                  name="first_name"
                  defaultValue={user.first_name}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label htmlFor="admin-last" className="form-label">Last Name</label>
                <input
                  id="admin-last"
                  name="last_name"
                  defaultValue={user.last_name}
                  className="form-input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-phone" className="form-label">Phone Number</label>
              <input
                id="admin-phone"
                name="phone_number"
                type="tel"
                defaultValue={user.phone_number}
                className="form-input"
              />
            </div>

            <div>
              <label htmlFor="admin-role" className="form-label">Role *</label>
              <select id="admin-role" name="role" defaultValue={user.role} className="form-input" required>
                <option value="ADMIN">Admin</option>
                <option value="PARENT">Parent</option>
                <option value="BABYSITTER">Babysitter</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="admin-active"
                name="is_active"
                type="checkbox"
                defaultChecked={user.is_active}
                className="w-4 h-4"
              />
              <label htmlFor="admin-active" className="text-sm font-medium">
                Account Active
              </label>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                disabled={updateUser.isLoading}
                className="btn-primary"
              >
                {updateUser.isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setMessage('')
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* View Mode */
        <div className="card">
          <div className="grid gap-6">
            {/* Basic Info */}
            <div className="flex items-start gap-6 pb-6 border-b">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-600 flex-shrink-0">
                {user.first_name[0]}{user.last_name?.[0] || ''}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-semibold mb-1">
                  {user.first_name} {user.last_name}
                </h2>
                <p className="text-textSecondary mb-2">{user.email}</p>
                <div className="flex items-center gap-3">
                  {getRoleBadge(user.role)}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-textSecondary">Email</label>
                  <div className="mt-1">{user.email}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-textSecondary">Phone Number</label>
                  <div className="mt-1">{user.phone_number || '—'}</div>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            {user.profile && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Profile Information</h3>
                <div className="grid gap-3">
                  {user.profile.address && (
                    <div>
                      <label className="text-sm font-medium text-textSecondary">Address</label>
                      <div className="mt-1">{user.profile.address}</div>
                    </div>
                  )}
                  {user.profile.bio && (
                    <div>
                      <label className="text-sm font-medium text-textSecondary">Bio</label>
                      <div className="mt-1">{user.profile.bio}</div>
                    </div>
                  )}
                  {user.profile.profile_picture && (
                    <div>
                      <label className="text-sm font-medium text-textSecondary">Profile Picture</label>
                      <div className="mt-2">
                        <img
                          src={user.profile.profile_picture}
                          alt="Profile"
                          className="w-32 h-32 object-cover rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Account Details */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Account Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-textSecondary">Role</label>
                  <div className="mt-1">{user.role}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-textSecondary">Status</label>
                  <div className="mt-1">{user.is_active ? 'Active' : 'Inactive'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-textSecondary">Created At</label>
                  <div className="mt-1">{new Date(user.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-textSecondary">Last Updated</label>
                  <div className="mt-1">{new Date(user.updated_at).toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* User ID */}
            <div className="border-t pt-4">
              <label className="text-sm font-medium text-textSecondary">User ID</label>
              <div className="mt-1 text-sm font-mono text-gray-600">{user.id}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
