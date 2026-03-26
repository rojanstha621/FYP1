import React, { useState } from 'react'
import { useChildren, useCreateChild, useUpdateChild, useDeleteChild } from '../api/hooks'
import Alert from '../components/Alert'

export default function Children() {
  const { data: children, isLoading } = useChildren()
  const createChild = useCreateChild()
  const updateChild = useUpdateChild()
  const deleteChildMutation = useDeleteChild()

  const [message, setMessage] = useState('')
  const [editingChild, setEditingChild] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const handleCreate = async (e) => {
    e.preventDefault()
    setMessage('')

    const data = new FormData(e.target)

    try {
      await createChild.mutateAsync({
        name: data.get('name'),
        date_of_birth: data.get('date_of_birth'),
        gender: data.get('gender'),
        special_needs: data.get('special_needs'),
        dietary_restrictions: data.get('dietary_restrictions'),
        emergency_contact_name: data.get('emergency_contact_name'),
        emergency_contact_phone: data.get('emergency_contact_phone'),
      })
      setMessage('Child added successfully')
      setShowForm(false)
      e.target.reset()
    } catch {
      setMessage('Failed to add child')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setMessage('')

    const data = new FormData(e.target)

    try {
      await updateChild.mutateAsync({
        id: editingChild.id,
        payload: {
          name: data.get('name'),
          date_of_birth: data.get('date_of_birth'),
          gender: data.get('gender'),
          special_needs: data.get('special_needs'),
          dietary_restrictions: data.get('dietary_restrictions'),
          emergency_contact_name: data.get('emergency_contact_name'),
          emergency_contact_phone: data.get('emergency_contact_phone'),
        },
      })
      setMessage('Child updated successfully')
      setEditingChild(null)
      setShowForm(false)
    } catch {
      setMessage('Failed to update child')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this child profile?')) return

    setMessage('')

    try {
      await deleteChildMutation.mutateAsync(id)
      setMessage('Child deleted successfully')
    } catch {
      setMessage('Failed to delete child')
    }
  }

  const openCreate = () => {
    setEditingChild(null)
    setShowForm(true)
  }

  const openEdit = (child) => {
    setEditingChild(child)
    setShowForm(true)
  }

  const getAge = (dob) => {
    if (!dob) return '-'
    const birthDate = new Date(dob)
    const now = new Date()
    const years = now.getFullYear() - birthDate.getFullYear()
    const monthDiff = now.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
      return `${years - 1}`
    }
    return `${years}`
  }

  return (
    <div className="page-wrap max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold tracking-tight">Child Profiles</h2>
      </div>

      {message && (
        <Alert type={message.includes('Failed') ? 'error' : 'success'} className="mb-4">
          {message}
        </Alert>
      )}

      {showForm && (
        <div className="card mb-6">
          <h3 className="font-semibold mb-4">{editingChild ? 'Edit Child Profile' : 'Add Child Profile'}</h3>
          <form onSubmit={editingChild ? handleUpdate : handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Name</label>
              <input name="name" className="form-input" required defaultValue={editingChild?.name || ''} />
            </div>
            <div>
              <label className="form-label">Date of Birth</label>
              <input name="date_of_birth" type="date" className="form-input" required defaultValue={editingChild?.date_of_birth || ''} />
            </div>
            <div>
              <label className="form-label">Gender</label>
              <select name="gender" className="form-input" defaultValue={editingChild?.gender || ''}>
                <option value="">Select</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Emergency Contact Name</label>
              <input name="emergency_contact_name" className="form-input" defaultValue={editingChild?.emergency_contact_name || ''} />
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Special Needs / Medical Notes</label>
              <textarea name="special_needs" className="form-input resize-none" rows="2" defaultValue={editingChild?.special_needs || ''} />
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Dietary Restrictions</label>
              <textarea name="dietary_restrictions" className="form-input resize-none" rows="2" defaultValue={editingChild?.dietary_restrictions || ''} />
            </div>
            <div>
              <label className="form-label">Emergency Contact Phone</label>
              <input name="emergency_contact_phone" className="form-input" defaultValue={editingChild?.emergency_contact_phone || ''} />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary">{editingChild ? 'Update Child' : 'Add Child'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={openCreate}
          className="rounded-2xl border-2 border-dashed border-pink-200 bg-white p-6 text-left hover:bg-pink-50 transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-2xl mb-3">＋</div>
          <h3 className="font-semibold text-[#1A1A2E]">Add Child</h3>
          <p className="text-sm text-gray-500 mt-1">Create a new child profile</p>
        </button>

        {isLoading && <p className="text-sm text-gray-500">Loading...</p>}

        {children?.map((child) => (
          <div key={child.id} className="group relative rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-full bg-pink-100 text-2xl flex items-center justify-center">🧒</div>
              <div>
                <h3 className="font-semibold">{child.name}</h3>
                <span className="inline-flex rounded-full bg-pink-100 px-2.5 py-1 text-xs font-medium text-pink-700 mt-1">
                  Age {getAge(child.date_of_birth)}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-500">DOB: {new Date(child.date_of_birth).toLocaleDateString()}</p>
            {child.special_needs && <p className="text-sm text-gray-600 mt-2">Special: {child.special_needs}</p>}
            {child.dietary_restrictions && <p className="text-sm text-gray-600 mt-1">Diet: {child.dietary_restrictions}</p>}

            <div className="absolute inset-0 rounded-2xl bg-white/90 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2">
              <button className="btn-secondary" onClick={() => openEdit(child)}>Edit</button>
              <button className="btn-secondary text-red-500" onClick={() => handleDelete(child.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && children?.length === 0 && (
        <div className="card text-center mt-4">
          <p className="text-gray-500">No child profiles yet. Add your first child to start booking.</p>
        </div>
      )}
    </div>
  )
}
