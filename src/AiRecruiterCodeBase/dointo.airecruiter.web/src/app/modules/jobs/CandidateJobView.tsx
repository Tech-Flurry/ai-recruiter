import React from 'react'
import { Table } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { KTCard, KTCardBody } from '../../../_metronic/helpers' // Adjust path if needed

const CandidateJobView = () => {
	const navigate = useNavigate()

	const jobs = [
		{ id: '1', title: 'Frontend Developer', posted: '3 days ago', status: 'Not Started' },
		{ id: '2', title: 'Backend Developer', posted: '5 days ago', status: 'In Progress' },
		{ id: '3', title: 'UI/UX Designer', posted: '1 week ago', status: 'Completed' },
		{ id: '4', title: 'DevOps Engineer', posted: '2 weeks ago', status: 'Not Started' },
		{ id: '5', title: 'Data Scientist', posted: '4 days ago', status: 'In Progress' },
	]

	// Filter to show only "Not Started" and "Completed"
	const visibleJobs = jobs.filter((job) => job.status === 'Not Started' || job.status === 'Completed')

	const getBadge = (status: string) => {
		switch (status) {
			case 'Not Started':
				return <span className='badge badge-light-danger fw-bold'>Not Started</span>
			case 'Completed':
				return <span className='badge badge-light-primary fw-bold'>Completed</span>
			default:
				return <span className='badge badge-light fw-bold'>Unknown</span>
		}
	}

	const getActionButton = (status: string, jobId: string) => {
		switch (status) {
			case 'Not Started':
				return (
					<button
						type="button"
						className="btn btn-primary"
						onClick={() => navigate(`/jobs/conduct/${jobId}`)}
					>
						Start Interview
					</button>
				)
			case 'Completed':
				return (
					<button type="button" className="btn btn-success" disabled>
						Completed
					</button>
				)
			default:
				return null
		}
	}

	return (
		<div className='p-4'>
			<KTCard>
				<KTCardBody>
					<div className='d-flex justify-content-between align-items-center mb-5'>
						<div>
							<h2 className='fw-bold text-dark mb-1 d-flex align-items-center'>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									width='26'
									height='26'
									fill='currentColor'
									className='me-2 text-primary'
									viewBox='0 0 16 16'
								>
									<path d='M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2H0z' />
									<path
										fillRule='evenodd'
										d='M0 5h16v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V5zm5 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z'
									/>
								</svg>
								Available Interviews
							</h2>
							<p className='text-muted fs-6'>Choose a job to begin or resume your interview process.</p>
						</div>
					</div>

					<div className='table-responsive'>
						<Table hover responsive className='align-middle table-row-dashed fs-6 gy-5'>
							<thead className='text-start text-muted fw-bold fs-7 text-uppercase gs-0'>
								<tr>
									<th>#</th>
									<th>Job Title</th>
									<th>Posted</th>
									<th>Status</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{visibleJobs.map((job, index) => (
									<tr key={job.id}>
										<td>{index + 1}</td>
										<td className='fw-semibold text-primary'>{job.title}</td>
										<td>{job.posted}</td>
										<td>{getBadge(job.status)}</td>
										<td>{getActionButton(job.status, job.id)}</td>
									</tr>
								))}
							</tbody>
						</Table>
					</div>
				</KTCardBody>
			</KTCard>
		</div>
	)
}

export default CandidateJobView
