import { useAuth } from '../../../../app/modules/auth'
import { KTIcon } from '../../../helpers'
import { HeaderUserMenu, Search } from '../../../partials'

const AsideToolbar = () => {
  const { currentUser } = useAuth()

  // Extract initials from name (e.g., "Muhammad Abdullah" → "MA")
  const getInitials = (name: string | undefined) => {
    if (!name) return 'NA'
    const words = name.trim().split(' ')
    if (words.length === 1) {
      // If single word like "muhammadabdullah", just take first 2 letters
      return words[0].substring(0, 2).toUpperCase()
    }
    return words.map((n) => n[0]).join('').toUpperCase()
  }


  return (
    <>
      {/* begin::User */}
      <div className='aside-user d-flex align-items-sm-center justify-content-center py-5'>
        {/* Symbol: Initials Circle */}
        <div
          className='symbol symbol-50px bg-light-primary text-primary fw-bold d-flex align-items-center justify-content-center'
          style={{ borderRadius: '50%' }}
        >
          {getInitials(currentUser?.name)}
        </div>

        {/* Wrapper: User Info */}
        <div className='aside-user-info flex-row-fluid flex-wrap ms-5'>
          <div className='d-flex'>
            {/* User Details */}
            <div className='flex-grow-1 me-2'>
              {/* Username */}
              <a
                href='#'
                className='text-dark text-hover-primary fs-6 fw-bold'
              >
                {currentUser?.name ? currentUser.name : 'Name not loaded'}

              </a>

              {/* Online Status */}
              <div className='d-flex align-items-center text-success fs-9'>
                <span className='bullet bullet-dot bg-success me-1'></span>
                online
              </div>
            </div>

            {/* User Menu */}
            <div className='me-n2'>
              <a
                href='#'
                className='btn btn-icon btn-sm btn-active-color-primary mt-n2'
                data-kt-menu-trigger='click'
                data-kt-menu-placement='bottom-start'
                data-kt-menu-overflow='false'
              >
                <KTIcon iconName='setting-2' className='text-muted fs-1' />
              </a>
              <HeaderUserMenu />
            </div>
          </div>
        </div>
      </div>
      {/* end::User */}
    </>
  )
}

export { AsideToolbar }
