import React, { useState, useEffect } from 'react'
import { useMe, useUpdateMe, useProfileUpdate, useChangePassword } from '../api/hooks'
import Alert from '../components/Alert'

export default function Profile() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [previewSrc, setPreviewSrc] = useState(null)

  const { data: meData, isLoading: meLoading, refetch: refetchMe } = useMe()
  const updateMeHook = useUpdateMe()
  const profileUpdateHook = useProfileUpdate()
  const changePasswordHook = useChangePassword()

  const profile = meData?.profile ?? null
  const user = meData?.user ?? null

  useEffect(() => {
    if (profile && profile.profile_picture) {
      setPreviewSrc(profile.profile_picture)
    }
  }, [profile])

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (file) {
      setPreviewSrc(URL.createObjectURL(file))
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const form = new FormData(e.target)
    try {
      await updateMeHook.mutateAsync({
        first_name: form.get('first_name'),
        last_name: form.get('last_name'),
        phone_number: form.get('phone_number'),
        address: form.get('address'),
        bio: form.get('bio'),
      })

      if (form.get('profile_picture') && form.get('profile_picture').size > 0) {
        const picData = new FormData()
        picData.append('profile_picture', form.get('profile_picture'))
        await profileUpdateHook.mutateAsync(picData)
      }

      await refetchMe()
      setMessage('Profile updated')
    } catch (e) {
      setMessage('Update failed')
    }
    setLoading(false)
  }

  const handlePassword = async (e) => {
    e.preventDefault()
    setMessage('')
    const data = new FormData(e.target)
    const old_password = data.get('old_password')
    const new_password = data.get('new_password')
    const confirm_password = data.get('confirm_password')

    if (!old_password || !new_password) {
      setMessage('Please fill both password fields')
      return
    }

    if (new_password.length < 8) {
      setMessage('New password must be at least 8 characters')
      return
    }

    if (new_password !== confirm_password) {
      setMessage('New passwords do not match')
      return
    }

    try {
      await changePasswordHook.mutateAsync({ old_password, new_password })
      setMessage('Password changed')
      e.target.reset()
    } catch (e) {
      setMessage('Password change failed')
    }
  }

  if (meLoading) return <div className="p-6 text-center text-gray-500">Loading...</div>
  if (!meData) return <div className="p-6 text-center text-gray-500">No profile data</div>

  return (
    <div className="mt-8 max-w-4xl mx-auto px-4">
      {message && (
        <Alert
          type={message.includes('failed') || message.includes('No') ? 'error' : 'success'}
          className="mb-6"
        >
          {message}
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Card */}
        <div className="md:w-1/3 bg-white shadow rounded-lg p-6 flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200 mb-4">
            {previewSrc ? (
              <img src={previewSrc} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
            )}
          </div>
          <h2 className="text-xl font-semibold">{user.first_name} {user.last_name}</h2>
          <p className="text-gray-500 text-sm">{user.email}</p>
          <p className="text-gray-400 text-xs mt-1">Member since {new Date(user.created_at).toLocaleDateString()}</p>
        </div>

        {/* Profile & Password Forms */}
        <div className="md:w-2/3 flex flex-col gap-6">
          {/* Profile Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
            <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profile-first" className="form-label">First name</label>
                  <input id="profile-first" name="first_name" defaultValue={user.first_name} className="form-input" />
                </div>
                <div>
                  <label htmlFor="profile-last" className="form-label">Last name</label>
                  <input id="profile-last" name="last_name" defaultValue={user.last_name} className="form-input" />
                </div>
              </div>
              <div>
                <label htmlFor="profile-phone" className="form-label">Phone</label>
                <input id="profile-phone" name="phone_number" defaultValue={user.phone_number} className="form-input" />
              </div>
              <div>
                <label htmlFor="profile-address" className="form-label">Address</label>
                <input id="profile-address" name="address" defaultValue={profile.address} className="form-input" />
              </div>
              <div>
                <label htmlFor="profile-bio" className="form-label">Bio</label>
                <textarea id="profile-bio" name="bio" defaultValue={profile.bio} className="form-input resize-none" rows={3} />
              </div>
              <div>
                <label htmlFor="profile-picture" className="form-label">Profile picture</label>
                <input id="profile-picture" type="file" name="profile_picture" className="form-input" onChange={handleFileChange} />
              </div>
              <button type="submit" disabled={loading} className="btn-primary mt-2">
                {loading ? 'Saving...' : 'Save profile'}
              </button>
            </form>
          </div>

          {/* Password Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <form onSubmit={handlePassword} className="grid gap-4">
              <div>
                <label htmlFor="old-password" className="form-label">Old password</label>
                <input id="old-password" name="old_password" placeholder="Old password" type="password" className="form-input" />
              </div>
              <div>
                <label htmlFor="new-password" className="form-label">New password</label>
                <input id="new-password" name="new_password" placeholder="New password" type="password" className="form-input" />
              </div>
              <div>
                <label htmlFor="confirm-password" className="form-label">Confirm new password</label>
                <input id="confirm-password" name="confirm_password" placeholder="Confirm new password" type="password" className="form-input" />
              </div>
              <button type="submit" className="btn-secondary mt-2">Change password</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
