
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { KTIcon } from '../../../helpers'
import { AsideMenuItemWithSub } from './AsideMenuItemWithSub'
import { AsideMenuItem } from './AsideMenuItem'

export function AsideMenuMain() {
	const intl = useIntl()
	const [role, setRole] = useState('recruiter') // default to recruiter

	useEffect(() => {
		const savedRole = localStorage.getItem('role')
		if (savedRole) {
			setRole(savedRole)
		}
	}, [])
	return (
		<>
			{role === 'recruiter' ? (
				<>
					<AsideMenuItem to='/dashboard' icon='element-11' title='Recruiter Dashboard' />
					<AsideMenuItem to='/jobs/list' icon='element-10' title='Jobs' />
				</>
			) : (
				<>
						<AsideMenuItem to='/jobs/candidate-dashboard' icon='element-11' title='Candidate Dashboard' />
						<AsideMenuItem
							to='/jobs/interview-history'
							icon='chart'
							title='Interview History'
						/>
						<AsideMenuItem
							to="/jobs/view-jobs"
							icon="briefcase"
							title="Available Jobs"
						/>
				</>
			)}

			<div className='menu-item'>
				<div className='menu-content'>
					<div className='separator mx-1 my-4'></div>
				</div>
			</div>
		</>
	)
}
