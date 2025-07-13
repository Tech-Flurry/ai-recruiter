import {Suspense, useEffect } from 'react'
import {Outlet} from 'react-router-dom'
import {I18nProvider} from '../_metronic/i18n/i18nProvider'
import {LayoutProvider, LayoutSplashScreen} from '../_metronic/layout/core'
import {MasterInit} from '../_metronic/layout/MasterInit'
import { AuthInit } from './modules/auth/core/AuthInit'
import {ThemeModeProvider} from '../_metronic/partials'

const App = () => {

  useEffect(() => {
    if (!localStorage.getItem('role')) {
      localStorage.setItem('role', 'recruiter')
    }
  }, [])
  
  return (
    <Suspense fallback={<LayoutSplashScreen />}>
      <I18nProvider>
        <LayoutProvider>
          <ThemeModeProvider>
            <AuthInit>
              <>
                <Outlet />
                <MasterInit />
              </>
            </AuthInit>
          </ThemeModeProvider>
        </LayoutProvider>
      </I18nProvider>
    </Suspense>
  )
}

export {App}
