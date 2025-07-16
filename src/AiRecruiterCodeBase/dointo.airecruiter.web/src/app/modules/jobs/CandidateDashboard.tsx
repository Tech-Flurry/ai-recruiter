import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Tab, Tabs, Spinner, Alert } from 'react-bootstrap'
import axios from 'axios'
import { KTSVG } from '../../../_metronic/helpers'

interface SkillDto {
	skill: string
	level: number
}

interface CandidateDashboardDto {
	name: string
	summary: string
	totalInterviews: number
	averageScore: number
	passRate: number
	topSkills: SkillDto[]
	recentActivities: string[]
}

const CandidateDashboard: React.FC = () => {
	const [data, setData] = useState<Partial<CandidateDashboardDto>>({})
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchDashboardData = async () => {
			const token = localStorage.getItem('kt-auth-react-v')

			if (!token) {
				console.error('❌ Authentication token not found.')
				setError('Authentication token not found.')
				setLoading(false)
				return
			}

			try {
				const dashboardRes = await axios.get(
					`${import.meta.env.VITE_APP_API_BASE_URL}/Interviews/candidate-dashboard`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				)

				setData(dashboardRes.data?.data || {})
			} catch (err: any) {
				console.error('❌ Error fetching dashboard data:', err)
				if (err.response?.status === 401) {
					setError('Unauthorized. Please log in again.')
				} else {
					setError('Failed to load dashboard. Please try again.')
				}
			} finally {
				setLoading(false)
			}
		}

		fetchDashboardData()
	}, [])

	const getVariant = (level: number) => {
		if (level >= 80) return 'success'
		if (level >= 60) return 'primary'
		if (level >= 40) return 'warning'
		return 'danger'
	}

	const getLevelLabel = (level: number) => {
		if (level >= 80) return 'Expert'
		if (level >= 60) return 'Proficient'
		if (level >= 40) return 'Intermediate'
		return 'Beginner'
	}

	if (loading) {
		return (
			<div className='text-center mt-10'>
				<Spinner animation='border' variant='primary' />
			</div>
		)
	}

	return (
		<div className='mt-5 px-4'>
			{error && (
				<Alert variant='danger' className='text-center'>
					{error}
				</Alert>
			)}

			{/* Welcome Banner */}
			<div className='p-5 bg-light-primary rounded mb-7'>
				<h2 className='fw-bold text-primary'>Welcome, {data?.name || 'Candidate'}!</h2>
				<p className='mb-0 text-muted'>Track your interview progress and performance below.</p>
			</div>

			{/* === Summary Cards === */}
			<Row className='mb-7 g-4'>
				<Col md={4}>
					<div className='card card-xl-stretch mb-xl-8 shadow-sm border-0 text-center'>
						<div className='card-body'>
							<KTSVG path='/media/icons/duotune/general/gen048.svg' className='svg-icon-2tx mb-2 text-primary' />
							<div className='fs-2hx fw-bold text-dark'>{data?.totalInterviews ?? 0}</div>
							<div className='text-muted fw-semibold'>Total Interviews</div>
						</div>
					</div>
				</Col>
				<Col md={4}>
					<div className='card card-xl-stretch mb-xl-8 shadow-sm border-0 text-center'>
						<div className='card-body'>
							<KTSVG path='/media/icons/duotune/general/gen049.svg' className='svg-icon-2tx mb-2 text-success' />
							<div className='fs-2hx fw-bold text-dark'>{data?.averageScore ?? 0}</div>
							<div className='text-muted fw-semibold'>Average Score</div>
						</div>
					</div>
				</Col>
				<Col md={4}>
					<div className='card card-xl-stretch mb-xl-8 shadow-sm border-0 text-center'>
						<div className='card-body'>
							<KTSVG path='/media/icons/duotune/arrows/arr016.svg' className='svg-icon-2tx mb-2 text-primary' />
							<div className='fs-2hx fw-bold text-dark'>{data?.passRate ?? 0}%</div>
							<div className='text-muted fw-semibold'>Pass Rate</div>
						</div>
					</div>
				</Col>
			</Row>

			{/* === Skills Progress Card === */}
			<Card className='mb-7 shadow-sm border-0'>
				<Card.Header className='bg-light d-flex justify-content-between align-items-center'>
					<h5 className='mb-0 fw-bold text-dark'>Top Skills Progress</h5>
					<span className='text-muted fs-7'>Based on AI interview analysis</span>
				</Card.Header>
				<Card.Body className='pt-4'>
					{data?.topSkills?.length ? (
						data.topSkills.map((item, index) => (
							<div key={index} className='mb-4'>
								<div className='d-flex justify-content-between align-items-center mb-2'>
									<span className='fw-semibold fs-6'>{item.skill}</span>
									<span className={`badge bg-light-${getVariant(item.level)} text-${getVariant(item.level)}`}>
										{getLevelLabel(item.level)}
									</span>
								</div>
								<div className='progress' style={{ height: '10px' }}>
									<div
										className={`progress-bar progress-bar-striped progress-bar-animated bg-${getVariant(item.level)}`}
										role='progressbar'
										style={{ width: `${item.level}%` }}
										aria-valuenow={item.level}
										aria-valuemin={0}
										aria-valuemax={100}
									></div>
								</div>
							</div>
						))
					) : (
						<p className='text-muted'>No skill data available.</p>
					)}
				</Card.Body>
			</Card>

			{/* === Performance Tabs === */}
			<Tabs defaultActiveKey='summary' className='mb-3 fw-semibold'>
				<Tab eventKey='summary' title='Summary'>
					<div className='p-4 bg-light rounded border'>
						<h5 className='mb-3'>Performance Overview</h5>
						<p className='text-muted'>{data?.summary || 'No summary available yet.'}</p>
					</div>
				</Tab>

				<Tab eventKey='history' title='Recent Activity'>
					<div className='p-4 bg-light rounded border'>
						<h5 className='mb-4 text-dark fw-bold'>Activity Timeline</h5>
						<div className='timeline'>
							{data?.recentActivities?.length ? (
								data.recentActivities.map((item, index) => (
									<div key={index} className='timeline-item d-flex mb-4'>
										<div className='timeline-label'>
											<span className='bullet bullet-dot bg-primary me-4'></span>
										</div>
										<div className='flex-grow-1'>
											<div className='d-flex justify-content-between align-items-center mb-1'>
												<span className='fw-semibold text-gray-800'>{item}</span>
												<span className='badge bg-light-primary text-primary'>#{index + 1}</span>
											</div>
										</div>
									</div>
								))
							) : (
								<div className='text-muted'>No recent activity found.</div>
							)}
						</div>
					</div>
				</Tab>
			</Tabs>
		</div>
	)
}

export default CandidateDashboard
