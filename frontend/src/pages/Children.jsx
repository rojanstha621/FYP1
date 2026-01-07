import React from 'react'
import { useChildren, useCreateChild } from '../api/hooks'
import Alert from '../components/Alert'

export default function Children() {
  const { data: children, isLoading } = useChildren()
  const createChild = useCreateChild()
  const [message, setMessage] = React.useState('')

  const handleCreate = async (e) => {
    e.preventDefault()
    setMessage('')
    const data = new FormData(e.target)
    try {
      await createChild.mutateAsync({
        name: data.get('name'),
        date_of_birth: data.get('date_of_birth'),
        gender: data.get('gender'),
      })
      setMessage('Child added')
      e.target.reset()
    } catch (err) {
      setMessage('Failed to add child')
    }
  }

  return (
    <div className="mt-8 max-w-4xl mx-auto px-4">
      <h2 className="text-xl font-semibold mb-4">Children</h2>

      {message && (
        <Alert type={message.includes('Failed') ? 'error' : 'success'} className="mb-4">
          {message}
        </Alert>
      )}

      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <form onSubmit={handleCreate} className="grid gap-3">
          <div>
            <label className="form-label">Name</label>
            <input name="name" className="form-input" required />
          </div>
          <div>
            <label className="form-label">Date of birth</label>
            <input name="date_of_birth" type="date" className="form-input" required />
          </div>
          <div>
            <label className="form-label">Gender</label>
            <select name="gender" className="form-input">
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button className="btn-primary" type="submit">Add child</button>
          </div>
        </form>
      </div>

      <div className="grid gap-3">
        {isLoading && <div className="text-gray-500">Loading...</div>}
        {children?.map((c) => (
          <div key={c.id} className="bg-white shadow rounded-lg p-3">
            <div className="font-medium">{c.name}</div>
            <div className="text-sm text-textSecondary">DOB: {new Date(c.date_of_birth).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
