import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { useAuth } from '../../modules/auth' // ✅ adjust path as per your project structure
import { setAuth } from '../../modules/auth/core/AuthHelpers'
import { UserModel } from '../auth/core/_models'


const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { setCurrentUser } = useAuth() // ✅ update the user context

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.')
      return
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_BASE_URL}/Authentication/login`,
        {
          username: username.trim(),
          password: password.trim(),
        }
      )

      const token = response.data?.token

      if (token) {
        try {
          // 1. Decode JWT to extract user info
          const decoded = jwtDecode<Record<string, any>>(token)
          console.log('Decoded JWT:', decoded)

          const user: UserModel = {
            name: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'Unknown',
          }

          // 2. Save token and user in localStorage
          setAuth({ api_token: token, user })

          // 3. Update global context
          setCurrentUser(user)

          // 4. Navigate to dashboard
          navigate('/dashboard')
        } catch (error) {
          console.error('JWT decoding or auth saving failed:', error)
          setError('Login failed due to internal error.')
        }
      } else {
        setError('Login failed. Token not received.')
      }
      
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Invalid username or password.')
      } else {
        console.error('Login error:', err)
        setError('Something went wrong. Please try again later.')
      }
    }
  }

  return (
    <div className='d-flex flex-column flex-lg-row flex-column-fluid h-100'>
      {/* Left Panel */}
      <div className='d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1' style={{ backgroundColor: '#F9FAFB' }}>
        <div className='d-flex flex-center flex-column flex-lg-row-fluid'>
          <div className='w-lg-500px p-10'>
            <h1 className='mb-7 text-center fw-bold text-dark'>Sign In to AI Recruiter</h1>

            <div className='text-muted fw-semibold fs-6 mb-5 text-center'>
              New Here?{' '}
              <a href='/auth/register' className='text-primary fw-bold'>Create an Account</a>
            </div>

            {error && <div className='alert alert-danger text-center'>{error}</div>}

            <form onSubmit={handleLogin}>
              <input
                type='text'
                className='form-control form-control-lg bg-white border mb-3 rounded'
                placeholder='Username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type='password'
                className='form-control form-control-lg bg-white border mb-3 rounded'
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className='mb-3 text-end'>
                <a href='/auth/forgot-password' className='text-primary fw-semibold'>
                  Forgot Password?
                </a>
              </div>
              <button
                type='submit'
                className='btn btn-lg w-100'
                style={{ backgroundColor: '#3699FF', color: '#fff' }}
              >
                Sign In
              </button>
            </form>

            <div className='mt-10 d-flex justify-content-center text-muted'>
              <a href='#' className='px-3'>Terms</a>
              <a href='#' className='px-3'>Plans</a>
              <a href='#' className='px-3'>Contact Us</a>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div
        className='d-flex flex-lg-row-fluid w-lg-50 order-1 order-lg-2'
        style={{ backgroundColor: '#EAF4FF' }}
      >
        <div className='d-flex flex-column align-items-center justify-content-center text-center py-10 px-5 w-100'>
          <img
            alt='AI Recruiter Brain Logo'
            src='/media/logos/Logo.png'
            style={{ height: '50px', marginBottom: '10px' }}
          />
          <h3 className='text-dark fw-bold fs-2 mb-5'>AI RECRUITER</h3>
          <img
            alt='AI Recruiter Device Illustration'
            src='/media/logos/Ai-Recruiter-Logo.png'
            style={{
              maxWidth: '100%',
              height: 'auto',
              width: '300px',
              marginBottom: '30px',
            }}
          />
          <h2 className='text-dark fw-bold fs-1 mb-3'>
            Fast, Efficient and Smart Hiring
          </h2>
          <p className='text-muted fs-6 px-3'>
            AI Recruiter helps you screen, shortlist, and onboard talent with AI precision.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
