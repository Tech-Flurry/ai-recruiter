import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { PageLink, PageTitle } from '../../../_metronic/layout/core'
import JobsList from "./JobsList";

const jobsBreadCrumbs: Array<PageLink> = [
	{
		title: 'Jobs',
		path: '/jobs/list',
		isSeparator: false,
		isActive: false,
	},
	{
		title: '',
		path: '',
		isSeparator: true,
		isActive: false,
	},
]

function JobsIndex() {
	return (
		<Routes>
			<Route element={<Outlet />}>
				<Route
					path='list'
					element={
						<>
							<PageTitle breadcrumbs={jobsBreadCrumbs}>List</PageTitle>
							<JobsList />
						</>
					}
				/>
				<Route index element={<Navigate to='/jobs/list' />} />
			</Route>
		</Routes>
	);
}

export default JobsIndex;