import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import LoginPage from './loginPage'
import RegistrationPage from './registrationPage'

function LoginIndex() {
  return (
    <Routes>
      <Route element={<Outlet />}>
        {/* Default route */}
        <Route index element={<Navigate to="login" />} />

        {/* Login route */}
        <Route path="login" element={<LoginPage />} />
        {/* Registration route */}
        <Route path="register" element={<RegistrationPage />} />
      </Route>
    </Routes>
  )
}

export default LoginIndex
