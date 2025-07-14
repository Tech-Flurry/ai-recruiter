import React, { useState } from 'react'

interface AuthFormProps {
  onSubmit: (username: string, password: string) => void | Promise<void>
  error?: string
  loading?: boolean
  formType: 'login' | 'register'
  showConfirmPassword?: boolean
}

const AuthForm: React.FC<AuthFormProps> = ({
  onSubmit,
  error,
  loading,
  formType,
  showConfirmPassword = false,
}) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (showConfirmPassword && password !== confirmPassword) {
      alert('Passwords do not match')
      return
    }

    onSubmit(username, password)
  }

  return (
    <>
      {error && <div className='alert alert-danger text-center'>{error}</div>}

      <form onSubmit={handleSubmit}>
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
        {showConfirmPassword && (
          <input
            type='password'
            className='form-control form-control-lg bg-white border mb-3 rounded'
            placeholder='Confirm Password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        )}

        {formType === 'login' && (
          <div className='mb-3 text-end'>
            <a href='/auth/forgot-password' className='text-primary fw-semibold'>
              Forgot Password?
            </a>
          </div>
        )}

        <button
          type='submit'
          className='btn btn-lg w-100'
          style={{ backgroundColor: '#3699FF', color: '#fff' }}
          disabled={loading}
        >
          {loading ? 'Please wait...' : formType === 'login' ? 'Sign In' : 'Register'}
        </button>
      </form>
    </>
  )
}

export default AuthForm
