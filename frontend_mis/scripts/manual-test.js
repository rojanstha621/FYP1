const axios = require('axios')

const API_BASE = 'http://localhost:8000/api/account/'

async function run() {
  try {
    const timestamp = Date.now()
    const email = `test+${timestamp}@example.com`
    const password = 'Password123!'

    console.log('1) Registering user', email)
    const reg = await axios.post(API_BASE + 'register/', {
      email,
      first_name: 'Test',
      last_name: 'User',
      phone_number: '1234567890',
      role: 'PARENT',
      password,
    })
    console.log('Register response status:', reg.status)

    console.log('2) Logging in')
    const login = await axios.post(API_BASE + 'login/', { email, password })
    console.log('Login status:', login.status)
    const access = login.data.access
    const refresh = login.data.refresh

    const client = axios.create({ baseURL: 'http://localhost:8000/api/' })
    client.defaults.headers['Authorization'] = `Bearer ${access}`

    console.log('3) Fetching /account/me/')
    const me = await client.get('account/me/')
    console.log('Me payload:', me.data)

    console.log('4) Updating basic info (first_name: Updated)')
    const update = await client.patch('account/me/', { first_name: 'Updated' })
    console.log('Update status:', update.status)

    console.log('5) Changing password')
    const change = await client.post('account/change-password/', {
      old_password: password,
      new_password: 'NewPass456!',
    })
    console.log('Change password status:', change.status)

    console.log('6) Logging in with new password')
    const login2 = await axios.post(API_BASE + 'login/', { email, password: 'NewPass456!' })
    console.log('Re-login status:', login2.status)

    console.log('7) Logging out (blacklist refresh)')
    const logout = await client.post('account/logout/', { refresh })
    console.log('Logout status:', logout.status)

    console.log('\nManual test script completed successfully ✅')
    process.exit(0)
  } catch (err) {
    console.error('\nManual test script failed ❌')
    if (err.response) {
      console.error('Status:', err.response.status)
      console.error('Data:', err.response.data)
    } else {
      console.error(err.message)
    }
    process.exit(1)
  }
}

run()
