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
		if (interviewId) {
			axios
				.get(`${import.meta.env.VITE_APP_API_BASE_URL}/Interviews/interview-report/${interviewId}`)
				.then((res) => {
					setReport(res.data);
					setLoading(false)
				})
				.catch((err) => {
					console.error('Error loading interview report:', err)
					setLoading(false)
				})
		}
	}, [interviewId])

	if (loading) return <div>Loading interview report...</div>
	if (!report) return <div>Interview report not found.</div>

	return (
		<KTCard className="mt-5">
			<KTCardBody>
				{/* Header */}
				<div className="d-flex justify-content-between align-items-center mb-5">
					<h2 className="fw-bold mb-0">{report.jobTitle}</h2>
					<Link to="/jobs/interview-history" className="btn btn-sm btn-light-primary">
						← Back to History
					</Link>
				</div>

				{/* Job Details */}
				<div className="mb-5">
					<div className="text-muted fs-6">
						<span className="me-4">
							<strong>Date:</strong>{' '}
							{new Date(report.interviewDate).toLocaleDateString(undefined, {
								day: 'numeric',
								month: 'long',
								year: 'numeric',
							})}
						</span>
						<span className="me-4">
							<strong>Status:</strong>{' '}
							<span className={`badge ${report.status == 'Open' ? 'badge badge-light-primary fw-bold' : 'badge badge-light-danger fw-bold'}`}>{report.status ?? 'Closed'}</span>
						</span>
						<span>
							<strong>Total Score:</strong>{' '}
							<span className="text-success fw-bold">{report.totalScore} / 10</span>
						</span>
					</div>
				</div>
				<div className="mb-5">
					<h5 className="fw-semibold mb-2">AI Feedback Summary</h5>
					<div className="bg-light px-4 py-3 rounded border text-gray-800">
						{report.aiFeedback}
					</div>
				</div>
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
								{report.questionScores.map((q: any, index: number) => (
									<tr key={index}>
										<td>{index + 1}</td>
										<td>{q.text}</td>
										<td>
											<span className="text-primary fw-bold">
												{q.scoreObtained} / {q.totalScore}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</Table>
					</div>
				</div>
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
								{report.skillRatings.map((item: any, index: number) => {
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
								})}
							</tbody>
						</Table>
					</div>
				</div>
			</KTCardBody>
		</KTCard>
	)
}

export default InterviewReport