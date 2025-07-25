import { FC, lazy, Suspense } from 'react'
import { Navigate, Route, Routes, Outlet } from 'react-router-dom'
import { useAuth } from '../modules/auth'
import { MasterLayout } from '../../_metronic/layout/MasterLayout'
import TopBarProgress from 'react-topbar-progress-indicator'
import { DashboardWrapper } from '../pages/dashboard/DashboardWrapper'
import { MenuTestPage } from '../pages/MenuTestPage'
import { getCSSVariableValue } from '../../_metronic/assets/ts/_utils'
import { WithChildren } from '../../_metronic/helpers'
import BuilderPageWrapper from '../pages/layout-builder/BuilderPageWrapper'
import JobsIndex from '../modules/jobs/JobsIndex'

const RequireAuth = () => {
	const { currentUser } = useAuth()

	if (!currentUser) {
		return <Navigate to='/auth/login' replace />
	}

	return <Outlet />
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
      <Route element={<RequireAuth />}>
        <Route element={<MasterLayout />}>
          <Route path='auth/*' element={<Navigate to='/dashboard' replace />} />
          <Route path='dashboard' element={<DashboardWrapper />} />
          <Route path='builder' element={
            <SuspensedView>
              <BuilderPageWrapper />
            </SuspensedView>
          } />
          <Route path='menu-test' element={<MenuTestPage />} />
          <Route path='jobs/*' element={<JobsIndex />} />
          <Route path='crafted/pages/profile/*' element={
            <SuspensedView>
              <ProfilePage />
            </SuspensedView>
          } />
          <Route path='crafted/pages/wizards/*' element={
            <SuspensedView>
              <WizardsPage />
            </SuspensedView>
          } />
          <Route path='crafted/widgets/*' element={
            <SuspensedView>
              <WidgetsPage />
            </SuspensedView>
          } />
          <Route path='crafted/account/*' element={
            <SuspensedView>
              <AccountPage />
            </SuspensedView>
          } />
          <Route path='apps/chat/*' element={
            <SuspensedView>
              <ChatPage />
            </SuspensedView>
          } />
          <Route path='apps/user-management/*' element={
            <SuspensedView>
              <UsersPage />
            </SuspensedView>
          } />
          <Route path='*' element={<Navigate to='/error/404' />} />
        </Route>
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
