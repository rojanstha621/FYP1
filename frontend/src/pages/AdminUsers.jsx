import React from 'react'
import { Link } from 'react-router-dom'
import { useAdminUsers } from '../api/hooks'
import Alert from '../components/Alert'

export default function AdminUsers() {
  const { data: users, isLoading, isError, refetch } = useAdminUsers()

  if (isLoading) return <div className="p-4"><Alert>Loading users...</Alert></div>
  if (isError) return <div className="p-4"><Alert type="error">Failed to load users. <button onClick={() => refetch()} className="ml-2 text-sm text-blue-600">Retry</button></Alert></div>

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Users</h1>
        <button onClick={() => refetch()} className="text-sm text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500">Refresh</button>
      </div>

      <table className="w-full mt-4 table-auto" role="table" aria-labelledby="users-table-caption">
        <caption id="users-table-caption" className="sr-only">List of users</caption>
        <thead>
          <tr className="text-left border-b">
            <th scope="col" className="py-2">Email</th>
            <th scope="col" className="py-2">Name</th>
            <th scope="col" className="py-2">Role</th>
            <th scope="col" className="py-2">Active</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b hover:bg-gray-50" tabIndex={0} role="row">
              <td className="py-2"><Link to={`/admin/users/${u.id}`} className="text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500">{u.email}</Link></td>
              <td className="py-2">{u.first_name} {u.last_name}</td>
              <td className="py-2">{u.role}</td>
              <td className="py-2">{u.is_active ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
