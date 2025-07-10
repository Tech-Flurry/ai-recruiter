import { useEffect, useState } from 'react'
import { useAuth } from './Auth'
import { getAuth } from './AuthHelpers'
import { jwtDecode } from 'jwt-decode'
import { UserModel } from './_models'

const AuthInit = ({ children }: { children: JSX.Element }) => {
  const { setCurrentUser } = useAuth()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const auth = getAuth()
    if (auth?.api_token) {
      const decoded = jwtDecode<UserModel>(auth.api_token)
      setCurrentUser(decoded)
    }
    setIsInitialized(true)
  }, [])

  if (!isInitialized) return <div className='p-10 text-center'>Loading...</div>

  return children
}

export { AuthInit }
