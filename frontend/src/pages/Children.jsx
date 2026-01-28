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
      e.target.reset()
      setShowForm(false)
    } catch (err) {
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
    } catch (err) {
      setMessage('Failed to update child')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this child profile?')) return
    setMessage('')
    try {
      await deleteChildMutation.mutateAsync(id)
      setMessage('Child deleted successfully')
    } catch (err) {
      setMessage('Failed to delete child')
    }
  }

  return (
    <div className="mt-8 max-w-4xl mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Children</h2>
        <button 
          className="btn-primary" 
          onClick={() => {
            setShowForm(!showForm)
            setEditingChild(null)
          }}
        >
          {showForm ? 'Cancel' : 'Add Child'}
        </button>
      </div>

      {message && (
        <Alert type={message.includes('Failed') ? 'error' : 'success'} className="mb-4">
          {message}
        </Alert>
      )}

      {(showForm || editingChild) && (
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-3">{editingChild ? 'Edit Child' : 'Add New Child'}</h3>
          <form onSubmit={editingChild ? handleUpdate : handleCreate} className="grid gap-3">
            <div>
              <label className="form-label">Name *</label>
              <input 
                name="name" 
                className="form-input" 
                required 
                defaultValue={editingChild?.name || ''}
              />
            </div>
            <div>
              <label className="form-label">Date of birth *</label>
              <input 
                name="date_of_birth" 
                type="date" 
                className="form-input" 
                required 
                defaultValue={editingChild?.date_of_birth || ''}
              />
            </div>
            <div>
              <label className="form-label">Gender</label>
              <select 
                name="gender" 
                className="form-input"
                defaultValue={editingChild?.gender || ''}
              >
                <option value="">Select</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Special Needs / Medical Conditions</label>
              <textarea 
                name="special_needs" 
                className="form-input resize-none" 
                rows="2"
                placeholder="Any allergies, medical conditions, or special needs"
                defaultValue={editingChild?.special_needs || ''}
              />
            </div>
            <div>
              <label className="form-label">Dietary Restrictions</label>
              <textarea 
                name="dietary_restrictions" 
                className="form-input resize-none" 
                rows="2"
                placeholder="Any dietary restrictions or preferences"
                defaultValue={editingChild?.dietary_restrictions || ''}
              />
            </div>
            <div>
              <label className="form-label">Emergency Contact Name</label>
              <input 
                name="emergency_contact_name" 
                className="form-input"
                placeholder="Emergency contact person"
                defaultValue={editingChild?.emergency_contact_name || ''}
              />
            </div>
            <div>
              <label className="form-label">Emergency Contact Phone</label>
              <input 
                name="emergency_contact_phone" 
                className="form-input"
                type="tel"
                placeholder="+1234567890"
                defaultValue={editingChild?.emergency_contact_phone || ''}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => {
                  setEditingChild(null)
                  setShowForm(false)
                }}
              >
                Cancel
              </button>
              <button className="btn-primary" type="submit">
                {editingChild ? 'Update' : 'Add'} Child
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-3">
        {isLoading && <div className="text-gray-500">Loading...</div>}
        {!isLoading && children?.length === 0 && (
          <div className="text-gray-500 text-center py-8">
            No children added yet. Click "Add Child" to get started.
          </div>
        )}
        {children?.map((c) => (
          <div key={c.id} className="bg-white shadow rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-medium text-lg">{c.name}</div>
                <div className="text-sm text-textSecondary mt-1">
                  DOB: {new Date(c.date_of_birth).toLocaleDateString()} • 
                  Gender: {c.gender === 'M' ? 'Male' : c.gender === 'F' ? 'Female' : c.gender === 'O' ? 'Other' : 'Not specified'}
                </div>
                {c.special_needs && (
                  <div className="text-sm mt-2">
                    <span className="font-medium">Special Needs:</span> {c.special_needs}
                  </div>
                )}
                {c.dietary_restrictions && (
                  <div className="text-sm mt-1">
                    <span className="font-medium">Dietary:</span> {c.dietary_restrictions}
                  </div>
                )}
                {c.emergency_contact_name && (
                  <div className="text-sm mt-1">
                    <span className="font-medium">Emergency Contact:</span> {c.emergency_contact_name}
                    {c.emergency_contact_phone && ` - ${c.emergency_contact_phone}`}
                  </div>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <button 
                  className="btn-secondary text-sm" 
                  onClick={() => {
                    setEditingChild(c)
                    setShowForm(false)
                  }}
                >
                  Edit
                </button>
                <button 
                  className="btn-secondary text-sm text-red-600 hover:bg-red-50" 
                  onClick={() => handleDelete(c.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
