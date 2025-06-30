import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { PageLink, PageTitle } from '../../../_metronic/layout/core'
import JobsList from "./JobsList"
import JobPost from "./JobPost"
import InterviewResult from './InterviewResult' // <- Direct import

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
							<PageTitle breadcrumbs={jobsBreadCrumbs}>Job List</PageTitle>
							<JobsList />
						</>
					}
				/>

				<Route
					path='create'
					element={
						<>
							<PageTitle breadcrumbs={jobsBreadCrumbs}>Create Job Post</PageTitle>
							<JobPost />
						</>
					}
				/>

				<Route
					path='interview/:jobId'
					element={
						<>
							<PageTitle breadcrumbs={jobsBreadCrumbs}>Interview Result</PageTitle>
							<InterviewResult />
						</>
					}
				/>

				<Route index element={<Navigate to='/jobs/list' />} />
			</Route>
		</Routes>
	)
}

export default JobsIndex
