
import { useIntl } from 'react-intl'
import { KTIcon } from '../../../helpers'
import { AsideMenuItemWithSub } from './AsideMenuItemWithSub'
import { AsideMenuItem } from './AsideMenuItem'

export function AsideMenuMain() {
	const intl = useIntl()

	return (
		<>
			<AsideMenuItem
				to='/dashboard'
				icon='element-11'
				title={intl.formatMessage({ id: 'MENU.DASHBOARD' })}
			/>
			{/*<AsideMenuItem to='/jobs' icon='switch' title='Jobs' />*/}
			<div className='menu-item'>
				<div className='menu-content pt-8 pb-2'>
					<span className='menu-section text-muted text-uppercase fs-8 ls-1'>Hire</span>
				</div>
			</div>
			<AsideMenuItem to="/jobs/list" icon='element-10' title={intl.formatMessage({ id: 'MENU.JOBS' })} />
			<div className='menu-item'>
				<div className='menu-content'>
					<div className='separator mx-1 my-4'></div>
				</div>
			</div>
		</>
	)
}
