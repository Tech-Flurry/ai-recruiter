

import {FC} from 'react'
import {useLayout} from '../../core'
import {KTIcon} from '../../../helpers'
import {AsideMenu} from './AsideMenu'
import {AsideToolbar} from './AsideToolbar'

const role = localStorage.getItem('role') || 'recruiter'
const AsideDefault: FC = () => {
  const {classes} = useLayout()

  return (
    <div
      id='kt_aside'
      className='aside'
      data-kt-drawer='true'
      data-kt-drawer-name='aside'
      data-kt-drawer-activate='{default: true, lg: false}'
      data-kt-drawer-overlay='true'
      data-kt-drawer-width="{default:'200px', '300px': '250px'}"
      data-kt-drawer-direction='start'
      data-kt-drawer-toggle='#kt_aside_mobile_toggle'
    >
      {/* begin::Aside Toolbarl */}
      <div className='aside-toolbar flex-column-auto' id='kt_aside_toolbar'>
        <AsideToolbar />
      </div>
      {/* end::Aside Toolbarl */}
      {/* begin::Aside menu */}
      <div className='aside-menu flex-column-fluid'>
        <AsideMenu asideMenuCSSClasses={classes.asideMenu} />
      </div>
      {/* end::Aside menu */}

      {/* begin::Footer */}
      <div className='aside-footer flex-column-auto py-5' id='kt_aside_footer'>
        <button
          className='btn btn-custom btn-custom-secondary btn-primary w-100'
          onClick={() => {
            const currentRole = localStorage.getItem('role')
            const newRole = currentRole === 'recruiter' ? 'candidate' : 'recruiter'
            localStorage.setItem('role', newRole)
            window.location.reload() // Refresh to apply route/UI changes
          }}
          title='Switch role between Recruiter and Candidate'
        >
          <span className='btn-label'>
            Switch to {localStorage.getItem('role') === 'recruiter' ? 'Candidate' : 'Recruiter'}
          </span>
          <span className='btn-icon fs-2'>
            <KTIcon iconName='document' />
          </span>
        </button>
      </div>

      {/* end::Footer */}
    </div>
  )
}

export {AsideDefault}
