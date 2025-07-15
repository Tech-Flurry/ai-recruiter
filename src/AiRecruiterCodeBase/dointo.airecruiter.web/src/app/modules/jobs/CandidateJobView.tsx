import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Table } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { KTCard, KTCardBody } from '../../../_metronic/helpers'

interface CandidateJobDto {
	id: string
	title: string
	posted: string
	status: string
}

const CandidateJobView = () => {
	const [jobs, setJobs] = useState<CandidateJobDto[]>([])
	const [error, setError] = useState<string | null>(null)
	const navigate = useNavigate()

	useEffect(() => {
		const fetchJobs = async () => {
			const token = localStorage.getItem('kt-auth-react-v')

			if (!token) {
				console.error('❌ Auth token not found.')
				setError('You are not authenticated.')
				return
			}

			try {
				const res = await axios.get<CandidateJobDto[]>(
					`${import.meta.env.VITE_APP_API_BASE_URL}/JobPosts/candidate-jobs`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				)
				setJobs(res.data)
			} catch (err) {
				console.error('❌ Error fetching jobs:', err)
				setError('Failed to load jobs.')
			}
		}

		fetchJobs()
	}, [])

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
					<button type='button' className='btn btn-primary' onClick={() => navigate(`/jobs/conduct/${jobId}`)}>
						Start Interview
					</button>
				)
			case 'Completed':
				return <button type='button' className='btn btn-success' disabled>Completed</button>
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
								Available Jobs
							</h2>
							<p className='text-muted fs-6'>Choose a job to begin or resume your interview process.</p>
						</div>
						</div>
					{error ? (
						<div className='alert alert-danger'>{error}</div>
					) : (
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
					)}
				</KTCardBody>
			</KTCard>
		</div>
	)
}

export default CandidateJobView
