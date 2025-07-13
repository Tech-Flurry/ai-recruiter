import { useEffect, useState } from 'react'
import { useAuth } from './Auth'
import { getAuth } from './AuthHelpers'
import { jwtDecode } from 'jwt-decode'
import { UserModel } from './_models'

const AuthInit = ({ children }: { children: JSX.Element }) => {
  const { setCurrentUser } = useAuth()
  const [isInitialized, setIsInitialized] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)

  useEffect(() => {
    // Only run once using a separate state flag
    if (hasInitialized) return;
    setHasInitialized(true);
    
    const auth = getAuth()
    if (auth?.api_token) {
      try {
        const decoded = jwtDecode<Record<string, any>>(auth.api_token)
        
        // Create a complete user object with required properties
        const user: UserModel = {
          name: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || 'Unknown',
          role: decoded['role'] || 'recruiter' // Default to 'recruiter' if role is missing
        }
        
        setCurrentUser(user)
      } catch (error) {
        console.error('Failed to decode token:', error)
      }
    }
    
    // Mark as initialized
    setIsInitialized(true)
  }, [setCurrentUser]); // No need to include hasInitialized here

  if (!isInitialized) return <div className='p-10 text-center'>Loading...</div>

  return children
}

export { AuthInit }
