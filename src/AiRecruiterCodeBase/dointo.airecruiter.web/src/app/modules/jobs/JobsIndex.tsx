import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { PageLink, PageTitle } from '../../../_metronic/layout/core'
import JobsList from './JobsList'
import JobPost from './JobPost'
import ConductJob from './ConductJob'
import JobScreening from './JobScreening'
import InterviewResult from './InterviewResult'
import CandidateInterviewHistory from './CandidateInterviewHistory'
import InterviewReport from './InterviewReport'

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
				{/* 🔹 Job List Page */}
				<Route
					path="list"
					element={
						<>
							<PageTitle breadcrumbs={jobsBreadCrumbs}>Job List</PageTitle>
							<JobsList />
						</>
					}
				/>

				{/* 🔹 Create Job Page */}
				<Route
					path="create"
					element={
						<>
							<PageTitle breadcrumbs={jobsBreadCrumbs}>Create Job Post</PageTitle>
							<JobPost />
						</>
					}
				/>

				{/* 🔹 Launch Interview for Job */}
				<Route
					path="conduct/:jobId"
					element={
						<>
							<PageTitle breadcrumbs={jobsBreadCrumbs}>Interview Launch</PageTitle>
							<ConductJob />
						</>
					}
				/>

				{/* 🔹 Screened Candidates for a Job */}
				<Route
					path=":jobId/interviews"
					element={
						<>
							<PageTitle breadcrumbs={jobsBreadCrumbs}>Candidate Screening</PageTitle>
							<JobScreening />
						</>
					}
				/>

				{/* 🔹 AI Interview Result for a Job */}
				<Route
					path="interview/:jobId"
					element={
						<>
							<PageTitle breadcrumbs={jobsBreadCrumbs}>Interview Result</PageTitle>
							<InterviewResult />
						</>
					}
				/>

				{/* 🔹 Candidate Interview History Page */}
				<Route
					path="interview-history"
					element={
						<>
							<PageTitle breadcrumbs={jobsBreadCrumbs}>Candidate Interview History</PageTitle>
							<CandidateInterviewHistory />
						</>
					}
				/>
				{/* 🔹 Candidate Interview Report Page */}
				<Route
					path="interview-report/:interviewId"
					element={
						<>
							<PageTitle breadcrumbs={jobsBreadCrumbs}>Interview Report</PageTitle>
							<InterviewReport />
						</>
					}
				/>


				{/* 🔹 Default Redirect */}
				<Route index element={<Navigate to="/jobs/list" />} />
			</Route>
		</Routes>
	)
}

export default JobsIndex
