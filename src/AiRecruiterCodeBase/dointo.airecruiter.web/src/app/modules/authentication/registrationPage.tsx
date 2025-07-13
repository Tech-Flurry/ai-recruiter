import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AuthForm from '../auth/components/AuthForm' // ✅ Adjust path if needed

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (username: string, password: string) => {
    setError('')
    setLoading(true)

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_BASE_URL}/Authentication/register`,
        { username: username.trim(), password: password.trim() },
        { withCredentials: true }
      )

      const token = response.data?.token
      if (token) {
        console.log('Received Token:', token)
        localStorage.setItem('authToken', token)
        navigate('/dashboard')
      } else {
        setError('Registration failed. No token returned.')
      }
    } catch (err: any) {
      if (err.response?.data) {
        setError(err.response.data)
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='d-flex flex-column flex-lg-row flex-column-fluid h-100'>
      {/* Left Panel: Registration Form */}
      <div className='d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1' style={{ backgroundColor: '#F9FAFB' }}>
        <div className='d-flex flex-center flex-column flex-lg-row-fluid'>
          <div className='w-lg-500px p-10'>
            <h1 className='mb-7 text-center fw-bold text-dark'>Register for AI Recruiter</h1>

            <div className='text-muted fw-semibold fs-6 mb-5 text-center'>
              Already have an account?{' '}
              <a href='/auth/login' className='text-primary fw-bold'>Sign In</a>
            </div>

            {/* ✅ Reusable Auth Form */}
            <AuthForm
              onSubmit={handleRegister}
              error={error}
              loading={loading}
              formType='register'
              showConfirmPassword={true}
            />

            <div className='mt-10 d-flex justify-content-center text-muted'>
              <a href='#' className='px-3'>Terms</a>
              <a href='#' className='px-3'>Plans</a>
              <a href='#' className='px-3'>Contact Us</a>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Promo */}
      <div className='d-flex flex-lg-row-fluid w-lg-50 order-1 order-lg-2' style={{ backgroundColor: '#EAF4FF' }}>
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
            style={{ maxWidth: '100%', height: 'auto', width: '300px', marginBottom: '30px' }}
          />

          <h2 className='text-dark fw-bold fs-1 text-center mb-5'>Join AI Recruiter Today</h2>
          <div className='text-muted fs-6 text-center'>Start screening and hiring smarter with AI-powered tools.</div>
        </div>
      </div>
    </div>
  )
}

export default RegistrationPage
