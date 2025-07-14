/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react'
import { KTCard, KTCardBody } from '../../../_metronic/helpers'
import { Table } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'

const InterviewReport: React.FC = () => {
	const { interviewId } = useParams<{ interviewId: string }>()
	const [loading, setLoading] = useState(true)
	const [report, setReport] = useState<any>(null)

	useEffect(() => {
		if (!interviewId) {
			console.warn('Interview ID missing from URL.')
			return
		}

		const rawToken = localStorage.getItem('kt-auth-react-v')
		if (!rawToken) {
			console.error('Auth token not found in localStorage')
			setLoading(false)
			return
		}

		let token
		try {
			token = JSON.parse(rawToken)
		} catch (err) {
			console.error('Failed to parse token JSON:', err)
			setLoading(false)
			return
		}

		if (!token.api_token) {
			console.error('API token not present in parsed token.')
			setLoading(false)
			return
		}

		const url = `${import.meta.env.VITE_APP_API_BASE_URL}/Interviews/interview-report/${interviewId}`
		console.log('Calling API:', url)

		axios
			.get(url, {
				headers: {
					Authorization: `Bearer ${token.api_token}`,
				},
			})
			.then((res) => {
				console.log('Report Data:', res.data)
				setReport(res.data.data)
				setLoading(false)
			})
			.catch((err) => {
				console.error('Error fetching report:', err.response?.data || err.message)
				setLoading(false)
			})
	}, [interviewId])


	if (loading) return <div>Loading interview report...</div>
	if (!report) return <div>Interview report not found.</div>

	const { jobTitle, interviewDate, status, totalScore, aiFeedback, questionScores = [], skillRatings = [] } = report

	return (
		<KTCard className="mt-5">
			<KTCardBody>
				{/* Header */}
				<div className="d-flex justify-content-between align-items-center mb-5">
					<h2 className="fw-bold mb-0">{jobTitle}</h2>
					<Link to="/jobs/interview-history" className="btn btn-sm btn-light-primary">
						← Back to History
					</Link>
				</div>

				{/* Job Details */}
				<div className="mb-5">
					<div className="text-muted fs-6">
						<span className="me-4">
							<strong>Date:</strong>{' '}
							{new Date(interviewDate).toLocaleDateString(undefined, {
								day: 'numeric',
								month: 'long',
								year: 'numeric',
							})}
						</span>
						<span className="me-4">
							<strong>Status:</strong>{' '}
							<span className={`badge ${status === 'Open' ? 'badge-light-primary' : 'badge-light-danger'} fw-bold`}>
								{status ?? 'Closed'}
							</span>
						</span>
						<span>
							<strong>Total Score:</strong>{' '}
							<span className="text-success fw-bold">{totalScore} / 10</span>
						</span>
					</div>
				</div>

				{/* AI Feedback */}
				<div className="mb-5">
					<h5 className="fw-semibold mb-2">AI Feedback Summary</h5>
					<div className="bg-light px-4 py-3 rounded border text-gray-800">{aiFeedback}</div>
				</div>

				{/* Question-wise Performance */}
				<div className="mb-5">
					<h5 className="fw-semibold mb-3">Question-wise Performance</h5>
					<div className="table-responsive">
						<Table bordered hover className="align-middle table-row-dashed fs-6 gy-5">
							<thead className="table-light fw-bold">
								<tr className="text-muted text-uppercase">
									<th style={{ width: '50px' }}>#</th>
									<th>Question</th>
									<th style={{ width: '160px' }}>Score</th>
								</tr>
							</thead>
							<tbody>
								{Array.isArray(questionScores) && questionScores.length > 0 ? (
									questionScores.map((q: any, index: number) => (
										<tr key={index}>
											<td>{index + 1}</td>
											<td>{q.text}</td>
											<td>
												<span className="text-primary fw-bold">
													{q.scoreObtained} / {q.totalScore}
												</span>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan={3} className="text-center text-muted">
											No question data available.
										</td>
									</tr>
								)}
							</tbody>
						</Table>
					</div>
				</div>

				{/* Skill Assessment */}
				<div>
					<h5 className="fw-semibold mb-3">AI-Rated Skill Assessment</h5>
					<div className="table-responsive">
						<Table bordered hover className="align-middle table-row-dashed fs-6 gy-5">
							<thead className="table-light fw-bold">
								<tr className="text-muted text-uppercase">
									<th>Skill</th>
									<th style={{ width: '240px' }}>Rating</th>
								</tr>
							</thead>
							<tbody>
								{Array.isArray(skillRatings) && skillRatings.length > 0 ? (
									skillRatings.map((item: any, index: number) => {
										const width = `${item.rating * 10}%`
										let color = 'bg-success'
										if (item.rating <= 6) color = 'bg-warning'
										if (item.rating <= 4) color = 'bg-danger'

										return (
											<tr key={index}>
												<td className="fw-semibold text-dark">{item.skill}</td>
												<td>
													<div className="d-flex flex-column">
														<div className="progress rounded-pill shadow-sm" style={{ height: '8px' }}>
															<div
																className={`progress-bar ${color}`}
																role="progressbar"
																style={{ width }}
																aria-valuenow={item.rating}
																aria-valuemin={0}
																aria-valuemax={10}
															></div>
														</div>
														<small className="text-muted mt-1 fw-semibold">{item.rating} / 10</small>
													</div>
												</td>
											</tr>
										)
									})
								) : (
									<tr>
										<td colSpan={2} className="text-center text-muted">
											No skill ratings available.
										</td>
									</tr>
								)}
							</tbody>
						</Table>
					</div>
				</div>
			</KTCardBody>
		</KTCard>
	)
}

export default InterviewReport
