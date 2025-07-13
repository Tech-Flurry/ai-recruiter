import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { useAuth } from '../../modules/auth'
import { setAuth } from '../../modules/auth/core/AuthHelpers'
import { UserModel } from '../auth/core/_models'
import AuthForm from '../auth/components/AuthForm'

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { setCurrentUser } = useAuth()

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (username: string, password: string) => {
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_BASE_URL}/Authentication/login`,
        { username: username.trim(), password: password.trim() }
      )

      const token = response.data?.token

      if (token) {
        const decoded = jwtDecode<Record<string, any>>(token)

        const user: UserModel = {
          name: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'Unknown',
        }

        setAuth({ api_token: token, user })
        setCurrentUser(user)
        navigate('/dashboard')
      } else {
        setError('Login failed. Token not received.')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.response?.data || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
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

            {/* ✅ Reusable AuthForm */}
            <AuthForm
              formType='login'
              onSubmit={handleLogin}
              error={error}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className='d-flex flex-lg-row-fluid w-lg-50 order-1 order-lg-2' style={{ backgroundColor: '#EAF4FF' }}>
        <div className='d-flex flex-column align-items-center justify-content-center text-center py-10 px-5 w-100'>
          <img alt='AI Recruiter Brain Logo' src='/media/logos/Logo.png' style={{ height: '50px', marginBottom: '10px' }} />
          <h3 className='text-dark fw-bold fs-2 mb-5'>AI RECRUITER</h3>
          <img alt='AI Recruiter Device Illustration' src='/media/logos/Ai-Recruiter-Logo.png' style={{ maxWidth: '100%', height: 'auto', width: '300px', marginBottom: '30px' }} />
          <h2 className='text-dark fw-bold fs-1 mb-3'>Fast, Efficient and Smart Hiring</h2>
          <p className='text-muted fs-6 px-3'>
            AI Recruiter helps you screen, shortlist, and onboard talent with AI precision.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
