import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { PageLink, PageTitle } from '../../../_metronic/layout/core'
import JobsList from "./JobsList"
import JobPost from "./JobPost" // 👈 You need to import this too

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
				{/* ✅ Jobs List Page */}
				<Route
					path='list'
					element={
						<>
							<PageTitle breadcrumbs={jobsBreadCrumbs}>Job List</PageTitle>
							<JobsList />
						</>
					}
				/>

				{/* ✅ Job Create Page */}
				<Route
					path='create'
					element={
						<>
							<PageTitle breadcrumbs={jobsBreadCrumbs}>Create Job Post</PageTitle>
							<JobPost />
						</>
					}
				/>

				{/* ✅ Default redirect */}
				<Route index element={<Navigate to='/jobs/list' />} />
			</Route>
		</Routes>
	)
}

export default JobsIndex
