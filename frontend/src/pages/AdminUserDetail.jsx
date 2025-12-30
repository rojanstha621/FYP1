import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAdminUser, useUpdateAdminUser, useDeleteAdminUser } from '../api/hooks'
import Alert from '../components/Alert'

export default function AdminUserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: user, isLoading, isError, refetch } = useAdminUser(id)
  const updateUser = useUpdateAdminUser()
  const deleteUser = useDeleteAdminUser()
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (isError) {
      // Optionally handle
    }
  }, [isError])

  const handleSubmit = async (e) => {
    e.preventDefault()
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
      setMessage('User updated')
    } catch (e) {
      setMessage('Update failed')
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      await deleteUser.mutateAsync(id)
      navigate('/admin/users')
    } catch (e) {
      setMessage('Delete failed')
    }
  }

  if (isLoading) return <div className="p-4">Loading user...</div>
  if (isError) return <div className="p-4">Failed to load user</div>

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-semibold">User detail</h1>
      {message && <Alert type={message.includes('failed') ? 'error' : 'success'}>{message}</Alert>}

      <form onSubmit={handleSubmit} className="mt-4 grid gap-3" aria-labelledby="admin-user-heading">
        <label htmlFor="admin-email" className="text-sm">Email</label>
        <input id="admin-email" name="email" defaultValue={user.email} className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500" />

        <label htmlFor="admin-first" className="text-sm">First name</label>
        <input id="admin-first" name="first_name" defaultValue={user.first_name} className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500" />

        <label htmlFor="admin-last" className="text-sm">Last name</label>
        <input id="admin-last" name="last_name" defaultValue={user.last_name} className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500" />

        <label htmlFor="admin-phone" className="text-sm">Phone</label>
        <input id="admin-phone" name="phone_number" defaultValue={user.phone_number} className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500" />

        <label htmlFor="admin-role" className="text-sm">Role</label>
        <select id="admin-role" name="role" defaultValue={user.role} className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500">
          <option value="ADMIN">Admin</option>
          <option value="PARENT">Parent</option>
          <option value="BABYSITTER">Babysitter</option>
        </select>

        <label className="flex items-center gap-2">
          <input id="admin-active" name="is_active" type="checkbox" defaultChecked={user.is_active} /> Active
        </label>

        <div className="flex gap-3 mt-3">
          <button disabled={updateUser.isLoading} className="bg-blue-600 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500">{updateUser.isLoading ? 'Saving...' : 'Save'}</button>
          <button type="button" onClick={handleDelete} className="bg-red-600 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500">Delete user</button>
        </div>
      </form>
    </div>
  )
}
