import React from 'react'
import { Row, Col, Card,Tab, Tabs } from 'react-bootstrap'
import { KTSVG } from '../../../_metronic/helpers'

const CandidateDashboard: React.FC = () => {
	const topSkills = [
		{ skill: 'React', level: 85 },
		{ skill: 'C#', level: 72 },
		{ skill: 'SQL', level: 65 },
	]


	return (
		<div className='mt-5 px-4'>
			{/* Welcome Banner */}
			<div className='p-5 bg-light-primary rounded mb-7'>
				<h2 className='fw-bold text-primary'>Welcome, Usman Tahir!</h2>
				<p className='mb-0 text-muted'>Track your interview progress and performance below.</p>
			</div>

			{/* KPI Summary Cards */}
			<Row className='mb-7 g-4'>
				<Col md={3}>
					<Card className='text-center shadow-sm border-0'>
						<Card.Body>
							<KTSVG path='/media/icons/duotune/general/gen048.svg' className='svg-icon-2tx text-primary mb-2' />
							<div className='fs-2 fw-bold text-primary'>5</div>
							<div className='text-muted'>Total Interviews</div>
						</Card.Body>
					</Card>
				</Col>
				<Col md={3}>
					<Card className='text-center shadow-sm border-0'>
						<Card.Body>
							<KTSVG path='/media/icons/duotune/general/gen049.svg' className='svg-icon-2tx text-success mb-2' />
							<div className='fs-2 fw-bold text-success'>7.6</div>
							<div className='text-muted'>Average Score</div>
						</Card.Body>
					</Card>
				</Col>
				<Col md={3}>
					<Card className='text-center shadow-sm border-0'>
						<Card.Body>
							<KTSVG path='/media/icons/duotune/general/gen050.svg' className='svg-icon-2tx text-warning mb-2' />
							<div className='fs-2 fw-bold text-warning'>60%</div>
							<div className='text-muted'>Pass Rate</div>
						</Card.Body>
					</Card>
				</Col>
				<Col md={3}>
					<Card className='text-center shadow-sm border-0'>
						<Card.Body>
							<KTSVG path='/media/icons/duotune/general/gen005.svg' className='svg-icon-2tx text-info mb-2' />
							<div className='fs-2 fw-bold text-info'>2</div>
							<div className='text-muted'>Upcoming Interviews</div>
						</Card.Body>
					</Card>
				</Col>
			</Row>

			{/* Skills Progress */}
			<Card className='mb-7 shadow-sm border-0'>
				<Card.Header className='bg-light d-flex justify-content-between align-items-center'>
					<h5 className='mb-0 fw-bold text-dark'>Top Skills Progress</h5>
					<span className='text-muted fs-7'>Based on AI interview analysis</span>
				</Card.Header>
				<Card.Body className='pt-4'>
					{topSkills.map((item, index) => {
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

						return (
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
						)
					})}
				</Card.Body>
			</Card>


			{/* Tabs Section */}
			<Tabs defaultActiveKey='summary' className='mb-3 fw-semibold'>
				<Tab eventKey='summary' title='Summary'>
					<div className='p-4 bg-light rounded border'>
						<h5 className='mb-3'>Performance Overview</h5>
						<p className='text-muted'>
							You’ve been steadily improving! Your frontend scores are above average, and communication is strong.
						</p>
					</div>
				</Tab>
				<Tab eventKey='history' title='Recent Activity'>
					<div className='p-4 bg-light rounded border'>
						<ul className='list-unstyled mb-0'>
							<li className='mb-2'>Completed Interview: Frontend Dev – 8.2 score</li>
							<li className='mb-2'>Upcoming Interview: AI Engineer – July 15</li>
							<li className='mb-2'>Skill Boost: C# improved from 3.5 → 4.2</li>
						</ul>
					</div>
				</Tab>
			</Tabs>
		</div>
	)
}

export default CandidateDashboard
