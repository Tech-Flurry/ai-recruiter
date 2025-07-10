import { FC, lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { MasterLayout } from '../../_metronic/layout/MasterLayout'
import TopBarProgress from 'react-topbar-progress-indicator'
import { DashboardWrapper } from '../pages/dashboard/DashboardWrapper'
import { MenuTestPage } from '../pages/MenuTestPage'
import { getCSSVariableValue } from '../../_metronic/assets/ts/_utils'
import { WithChildren } from '../../_metronic/helpers'
import BuilderPageWrapper from '../pages/layout-builder/BuilderPageWrapper'
import JobsIndex from '../modules/jobs/JobsIndex'

// 🔐 Simple wrapper to protect routes
const RequireAuth: FC<WithChildren> = ({ children }) => {
  const token = localStorage.getItem('authToken')
  return token ? children : <Navigate to="/auth/login" replace />
}

const PrivateRoutes = () => {
  const ProfilePage = lazy(() => import('../modules/profile/ProfilePage'))
  const WizardsPage = lazy(() => import('../modules/wizards/WizardsPage'))
  const AccountPage = lazy(() => import('../modules/accounts/AccountPage'))
  const WidgetsPage = lazy(() => import('../modules/widgets/WidgetsPage'))
  const ChatPage = lazy(() => import('../modules/apps/chat/ChatPage'))
  const UsersPage = lazy(() => import('../modules/apps/user-management/UsersPage'))

  return (
    <Routes>
      <Route element={<MasterLayout />}>
        {/* 🔁 Wrap all protected routes in RequireAuth */}
        <Route
          path="auth/*"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route
          path="dashboard"
          element={
            <RequireAuth>
              <DashboardWrapper />
            </RequireAuth>
          }
        />
        <Route
          path="builder"
          element={
            <RequireAuth>
              <SuspensedView>
                <BuilderPageWrapper />
              </SuspensedView>
            </RequireAuth>
          }
        />
        <Route
          path="menu-test"
          element={
            <RequireAuth>
              <MenuTestPage />
            </RequireAuth>
          }
        />
        <Route
          path="jobs/*"
          element={
            <RequireAuth>
              <JobsIndex />
            </RequireAuth>
          }
        />
        <Route
          path="crafted/pages/profile/*"
          element={
            <RequireAuth>
              <SuspensedView>
                <ProfilePage />
              </SuspensedView>
            </RequireAuth>
          }
        />
        <Route
          path="crafted/pages/wizards/*"
          element={
            <RequireAuth>
              <SuspensedView>
                <WizardsPage />
              </SuspensedView>
            </RequireAuth>
          }
        />
        <Route
          path="crafted/widgets/*"
          element={
            <RequireAuth>
              <SuspensedView>
                <WidgetsPage />
              </SuspensedView>
            </RequireAuth>
          }
        />
        <Route
          path="crafted/account/*"
          element={
            <RequireAuth>
              <SuspensedView>
                <AccountPage />
              </SuspensedView>
            </RequireAuth>
          }
        />
        <Route
          path="apps/chat/*"
          element={
            <RequireAuth>
              <SuspensedView>
                <ChatPage />
              </SuspensedView>
            </RequireAuth>
          }
        />
        <Route
          path="apps/user-management/*"
          element={
            <RequireAuth>
              <SuspensedView>
                <UsersPage />
              </SuspensedView>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/error/404" />} />
      </Route>
    </Routes>
  )
}

const SuspensedView: FC<WithChildren> = ({ children }) => {
  const baseColor = getCSSVariableValue('--bs-primary')
  TopBarProgress.config({
    barColors: {
      '0': baseColor,
    },
    barThickness: 1,
    shadowBlur: 5,
  })
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>
}

export { PrivateRoutes }
