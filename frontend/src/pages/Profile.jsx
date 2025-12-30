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

  if (meLoading) return <div className="p-4">Loading...</div>
  if (!meData) return <div className="p-4">No profile data</div>

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold">Profile</h2>
      {message && <Alert type={message.includes('failed') || message.includes('No') ? 'error' : 'success'}><div>{message}</div></Alert>}

      <div className="flex items-center gap-6 mt-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden border">
          {previewSrc ? (
            // If backend returned a relative path, it may be fine; otherwise check URL
            <img src={previewSrc} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
          )}
        </div>
        <div>
          <div className="text-sm text-gray-600">{user.email}</div>
          <div className="text-lg font-medium">{user.first_name} {user.last_name}</div>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-3 mt-4" aria-labelledby="profile-heading">
        <div>
          <label htmlFor="profile-first" className="block text-sm font-medium">First name</label>
          <input id="profile-first" name="first_name" defaultValue={user.first_name} className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label htmlFor="profile-last" className="block text-sm font-medium">Last name</label>
          <input id="profile-last" name="last_name" defaultValue={user.last_name} className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label htmlFor="profile-phone" className="block text-sm font-medium">Phone</label>
          <input id="profile-phone" name="phone_number" defaultValue={user.phone_number} className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label htmlFor="profile-address" className="block text-sm font-medium">Address</label>
          <input id="profile-address" name="address" defaultValue={profile.address} className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label htmlFor="profile-bio" className="block text-sm font-medium">Bio</label>
          <textarea id="profile-bio" name="bio" defaultValue={profile.bio} className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500" />
        </div>
        <div>
          <label htmlFor="profile-picture" className="block text-sm font-medium">Profile picture</label>
          <input id="profile-picture" type="file" name="profile_picture" aria-label="Profile picture" className="border p-2 rounded" onChange={handleFileChange} />
        </div>
        <button disabled={loading} type="submit" className="bg-blue-600 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500">
          {loading ? 'Saving...' : 'Save profile'}
        </button>
      </form>

      <hr className="my-6" />

      <h3 id="change-password-heading" className="text-lg font-semibold">Change password</h3>
      <form onSubmit={handlePassword} className="mt-3 grid gap-3" aria-labelledby="change-password-heading">
        <div>
          <label htmlFor="old-password" className="block text-sm font-medium">Old password</label>
          <input id="old-password" name="old_password" placeholder="Old password" type="password" className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-yellow-500" />
        </div>
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium">New password</label>
          <input id="new-password" name="new_password" placeholder="New password" type="password" className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-yellow-500" />
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium">Confirm new password</label>
          <input id="confirm-password" name="confirm_password" placeholder="Confirm new password" type="password" className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-yellow-500" />
        </div>
        <button type="submit" className="bg-yellow-600 text-white p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-yellow-500">Change password</button>
      </form>
    </div>
  )
}
