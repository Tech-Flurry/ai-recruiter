import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { PageLink, PageTitle } from '../../../_metronic/layout/core'
import JobsList from "./JobsList"
import JobPost from "./JobPost"
import ConductJob from "./ConductJob"
import JobScreening from "./JobScreening"

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
				{/* Jobs List Page */}
				<Route
					path='list'
					element={
						<>
							<PageTitle breadcrumbs={jobsBreadCrumbs}>Job List</PageTitle>
							<JobsList />
						</>
					}
				/>

				{/* Job Create Page */}
				<Route
					path='create'
					element={
						<>
							<PageTitle breadcrumbs={jobsBreadCrumbs}>Create Job Post</PageTitle>
							<JobPost />
						</>
					}
				/>

				{/* ✅ Conduct Job Interview Page (Shared Link) */}
				<Route
					path='conduct/:jobId'
					element={
						<>
							<PageTitle breadcrumbs={jobsBreadCrumbs}>Interview Launch</PageTitle>
							<ConductJob />
						</>
					}
				/>

				{/* ✅ Default Redirect */}
				{/* Job Screening (Candidates per job) Page */}
				<Route
					path=':jobId/interviews'
					element={
						<>
							<PageTitle breadcrumbs={jobsBreadCrumbs}>Candidate Screening</PageTitle>
							<JobScreening />
						</>
					}
				/>

				{/* Default redirect */}
				<Route index element={<Navigate to='/jobs/list' />} />
			</Route>
		</Routes>
	)
}

export default JobsIndex
