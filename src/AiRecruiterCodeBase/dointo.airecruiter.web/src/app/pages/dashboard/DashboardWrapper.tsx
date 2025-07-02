/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useIntl } from 'react-intl'
import { PageTitle } from '../../../_metronic/layout/core'

// Widgets
import {
	ListsWidget1,
	MixedWidget2,
	StatisticsWidget5,
} from '../../../_metronic/partials/widgets'

interface DashboardMetrics {
	activeJobPosts: number
	totalCandidatesScreened: number
	passRate: number
}

interface JobPostInsight {
	jobTitle: string
	totalInterviews: number
	screeningTimeDays: number
	averageInterviewDuration: string
}

const DashboardPage = () => {
	const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
	const [insights, setInsights] = useState<JobPostInsight[]>([])

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				const metricsRes = await axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/Dashboard`)
				setMetrics(metricsRes.data)

				const insightsRes = await axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/Dashboard/insights`)
				setInsights(insightsRes.data)
			} catch (err) {
				console.error('❌ Failed to fetch dashboard data:', err)
			}
		}

		fetchDashboardData()
	}, [])

	if (!metrics) return <div className='text-center p-10'>Loading dashboard...</div>

	return (
		<>
			{/* === Summary Cards === */}
			<div className='row g-5 g-xl-8'>
				<div className='col-md-4'>
					<StatisticsWidget5
						className='card-xl-stretch mb-xl-8'
						svgIcon='document'
						color='white'
						iconColor='warning'
						title={metrics.activeJobPosts.toString()}
						description='Active Job Posts'
						titleColor='dark'
						descriptionColor='gray-600'
					/>
				</div>
				<div className='col-md-4'>
					<StatisticsWidget5
						className='card-xl-stretch mb-xl-8'
						svgIcon='user'
						color='white'
						iconColor='success'
						title={metrics.totalCandidatesScreened.toString()}
						description='Total Candidates Screened'
						titleColor='dark'
						descriptionColor='gray-600'
					/>
				</div>
				<div className='col-md-4'>
					<StatisticsWidget5
						className='card-xl-stretch mb-xl-8'
						svgIcon='check-circle'
						color='white'
						iconColor='primary'
						title={`${metrics.passRate.toFixed(0)}%`}
						description='Pass Rate'
						titleColor='dark'
						descriptionColor='gray-600'
					/>
				</div>
			</div>

			{/* === Job Pipeline & Candidate Graph === */}
			<div className='row g-5 g-xl-8'>
				<div className='col-md-6'>
					<ListsWidget1
						className='card-xl-stretch mb-xl-8'
						title='Job Pipeline Overview'
						subtitle='Track the progress across stages'
						items={[
							{ icon: 'document', color: 'success', title: 'Job Post Created', subtitle: 'Recruiter posts job' },
							{ icon: 'user', color: 'warning', title: 'Applications Received', subtitle: 'Candidates applied' },
							{ icon: 'shield-tick', color: 'info', title: 'Screening in Progress', subtitle: 'Initial screening ongoing' },
							{ icon: 'calendar', color: 'danger', title: 'Interviews Conducted', subtitle: 'Interview stage' },
							{ icon: 'check-circle', color: 'primary', title: 'Candidates Selected', subtitle: 'Final selections made' }
						]}
					/>
				</div>
				<div className='col-md-6'>
					<MixedWidget2
						className='card-xl-stretch mb-xl-8'
						title='Pass Rate Across All Job Posts'
						chartColor='primary'
						chartHeight='200'
						strokeColor='#5d78ff'
						tiles={[
							{ title: 'Weekly Applications', value: '45', icon: 'graph', color: 'warning' },
							{ title: 'New Candidates', value: '30', icon: 'user', color: 'primary' },
							{ title: 'Interviews Scheduled', value: '18', icon: 'calendar', color: 'danger' },
							{ title: 'Offers Sent', value: '10', icon: 'check', color: 'success' },
						]}
					/>
				</div>
			</div>

			{/* === Job Post Insights Table === */}
			<div className='row g-5 g-xl-8'>
				<div className='col-md-12'>
					<div className='card card-xl-stretch mb-5 mb-xl-8'>
						<div className='card-header border-0 pt-5'>
							<h3 className='card-title align-items-start flex-column'>
								<span className='fw-bold text-dark'>Job Post Insights</span>
								<span className='text-muted mt-1 fw-semibold fs-7'>Breakdown by job role</span>
							</h3>
						</div>
						<div className='card-body pt-3'>
							<div className='table-responsive'>
								<table className='table align-middle gs-0 gy-4'>
									<thead>
										<tr className='fw-bold text-muted'>
											<th>Job Title</th>
											<th>Total Interviews</th>
											<th>Screening Time (days)</th>
											<th>Avg Interview Duration</th>
										</tr>
									</thead>
									<tbody>
										{insights.map((item, index) => (
											<tr key={index}>
												<td>{item.jobTitle}</td>
												<td>{item.totalInterviews}</td>
												<td>{item.screeningTimeDays}</td>
												<td>{item.averageInterviewDuration}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

const DashboardWrapper = () => {
	const intl = useIntl()
	return (
		<>
			<PageTitle breadcrumbs={[]}>
				{intl.formatMessage({ id: 'MENU.DASHBOARD' })}
			</PageTitle>
			<DashboardPage />
		</>
	)
}

export { DashboardWrapper }
