import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { ListGroup, Row, Col, Table } from 'react-bootstrap'

interface InterviewQuestion {
	question: string
	answer: string
	isRecruiterAdded?: boolean
	scoreObtained?: number
	totalScore?: number
}

interface SkillScore {
	[skill: string]: number
}

interface Experience {
	jobTitle: string
	company: string
	details: string
	startDate: string
	endDate?: string
}

interface Credential {
	certificate: string
	institution: string
	yearOfCompletion: string
}

interface SkillRating {
	skill: string
	rating: number
}

interface InterviewResultData {
	jobId: string
	fullName: string
	totalScore: number
	skillWiseScore: SkillScore
	questions: InterviewQuestion[]
	violations: string[]
	personalityAnalysis?: string
	systemFeedback?: string
	experience?: Experience[]
	credentials?: Credential[]
	education?: Credential[]
	certifications?: Credential[]
	skillRatings?: SkillRating[]
	name: string
	email: string
	phone: string
	jobTitle: string
	location: string
	feedback?: string
}

const InterviewResult: React.FC = () => {
	const { jobId } = useParams<{ jobId: string }>()
	const [data, setData] = useState<InterviewResultData | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchData = async () => {
			try {
				console.log('Fetching interview result for ID:', jobId)
				const res = await axios.get(
					`${import.meta.env.VITE_APP_API_BASE_URL}/Interviews/interview-results/${jobId}`
				)
				setData(res.data.data)
			} catch (err: never) {
				console.error('API call failed:', err)
				setError('Failed to load interview result. Please try again later.')
			} finally {
				setLoading(false)
			}
		}

		if (jobId) {
			fetchData()
		}
	}, [jobId])

	if (loading) return <div className="p-4">Loading interview result...</div>
	if (error) return <div className="p-4 text-danger">{error}</div>
	if (!data) return <div className="p-4 text-danger">Interview result not found.</div>

	return (
		<div className="container py-4">
			<Row className="gutters-sm">
				<Col md={4} className="mb-3">
					{/* Candidate Profile */}
					<div className="card card-custom mb-4">
						<div className="card-header"><h3 className="card-title">Candidate Profile</h3></div>
						<div className="card-body text-center">
							<img
								src="https://bootdey.com/img/Content/avatar/avatar7.png"
								alt="User Avatar"
								className="rounded-circle mb-3"
								width="150"
							/>
							<h4>{data.fullName}</h4>
							<p className="text-muted">{data.location}</p>
							<p className="text-secondary">{data.jobId}</p>
						</div>
					</div>

					{/* Candidate Details */}
					<div className="card card-custom mb-4">
						<div className="card-header"><h3 className="card-title">Candidate Details</h3></div>
						<div className="card-body">
							{[
								['Email', data.email],
								['Phone', data.phone],
								['Job Title', data.jobTitle],
								['Location', data.location],
							].map(([label, value], idx) => (
								<Row className="mb-2" key={idx}>
									<Col sm={5}><strong>{label}:</strong></Col>
									<Col sm={7}>{value}</Col>
								</Row>
							))}
						</div>
					</div>

					{/* Experience */}
					{Array.isArray(data.experience) && data.experience.length > 0 && (
						<div className="card card-custom mb-4">
							<div className="card-header"><h3 className="card-title">Experience</h3></div>
							<div className="card-body">
								{data.experience.map((exp, idx) => (
									<div key={idx} className="mb-4 border-bottom pb-3">
										<h6 className="fw-bold text-dark mb-1">{exp.jobTitle}</h6>
										<p className="mb-1 text-muted">{exp.company}</p>
										<p className="mb-1 text-muted" style={{ fontSize: '13px' }}>
											{new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} –{' '}
											{exp.endDate
												? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
												: 'Present'}
										</p>
										<p className="text-muted" style={{ fontSize: '14px' }}>{exp.details}</p>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Education */}
					{Array.isArray(data.education) && data.education.length > 0 && (
						<div className="card card-custom mb-4">
							<div className="card-header"><h3 className="card-title">Education</h3></div>
							<div className="card-body">
								{data.education.map((edu, idx) => (
									<div key={idx} className="mb-4 border-bottom pb-3">
										<h6 className="fw-bold text-dark mb-1">{edu.certificate}</h6>
										<p className="mb-1 text-muted">{edu.institution}</p>
										<p className="mb-0 text-muted">
											{new Date(edu.yearOfCompletion).toLocaleDateString('en-US', {
												month: 'short',
												year: 'numeric'
											})}
										</p>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Certifications */}
					{Array.isArray(data.certifications) && data.certifications.length > 0 && (
						<div className="card card-custom mb-4">
							<div className="card-header"><h3 className="card-title">Certifications</h3></div>
							<div className="card-body">
								{data.certifications.map((cert, idx) => (
									<div key={idx} className="mb-4 border-bottom pb-3">
										<h6 className="fw-bold text-dark mb-1">{cert.certificate}</h6>
										<p className="mb-1 text-muted">{cert.institution}</p>
										<p className="mb-0 text-muted">
											{new Date(cert.yearOfCompletion).toLocaleDateString('en-US', {
												month: 'short',
												year: 'numeric'
											})}
										</p>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Skill Ratings */}
					{Array.isArray(data.skillRatings) && data.skillRatings.length > 0 && (
						<div className="card card-custom mb-4">
							<div className="card-header"><h3 className="card-title">Skill Ratings</h3></div>
							<div className="card-body">
								{data.skillRatings.map((sr, idx) => (
									<div key={idx} className="mb-3 d-flex justify-content-between">
										<span className="fw-bold text-dark">{sr.skill}</span>
										<span className="text-muted">⭐ {sr.rating}/5</span>
									</div>
								))}
							</div>
						</div>
					)}
				</Col>

				<Col md={8}>
					{/* Skill-wise Scores */}
					<div className="card card-custom mb-4">
						<div className="card-header"><h3 className="card-title">Skill-wise Scores</h3></div>
						<div className="card-body">
							<Table bordered responsive hover>
								<thead style={{ backgroundColor: '#0d6efd' }}>
									<tr><th style={{ color: '#fff' }}>Skill</th><th style={{ color: '#fff' }}>Score</th></tr>
								</thead>
								<tbody>
									{Object.entries(data.skillWiseScore).map(([skill, score]) => (
										<tr key={skill}><td>{skill}</td><td>{score}</td></tr>
									))}
								</tbody>
							</Table>
						</div>
					</div>

					{/* Total Score */}
					<div className="card card-custom mb-4">
						<div className="card-header"><h3 className="card-title">Total Score</h3></div>
						<div className="card-body">
							<h4 className="text-primary fw-bold">{data.totalScore} / 100</h4>
							<p className="text-muted mb-0">This is the candidate's overall evaluation score based on all interview responses.</p>
						</div>
					</div>

					{/* Feedback */}
					{data.feedback && (
						<div className="card card-custom mb-4">
							<div className="card-header"><h3 className="card-title">Candidate Fit Feedback</h3></div>
							<div className="card-body"><p>{data.feedback}</p></div>
						</div>
					)}

					{/* Questions */}
					<div className="card card-custom mb-4">
						<div className="card-header"><h3 className="card-title">Interview Questions</h3></div>
						<div className="card-body">
							{data.questions.map((q, index) => (
								<div
									key={index}
									className="p-4 mb-3 rounded border"
									style={{
										borderLeft: '4px solid',
										borderColor: q.isRecruiterAdded ? '#facc15' : '#ccc',
										backgroundColor: '#f8f9fa'
									}}
								>
									<div className="mb-2 d-flex align-items-center">
										<strong className="me-2">Q{index + 1}:</strong>
										<span style={{ fontWeight: 500 }}>{q.question}</span>
									</div>
									<div className="d-flex flex-column p-3 rounded" style={{ backgroundColor: '#ffffff' }}>
										<div className="d-flex align-items-start mb-2">
											<span className="me-2 text-muted fw-bold">A:</span>
											<span className="text-dark">{q.answer}</span>
										</div>
										{q.scoreObtained !== undefined && q.totalScore !== undefined && (
											<div className="text-end mt-1">
												<span className="badge bg-primary px-3 py-2">
													Score: {q.scoreObtained} / {q.totalScore}
												</span>
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Violations */}
					<div className="card card-custom mb-4">
						<div className="card-header"><h3 className="card-title">Violations</h3></div>
						<div className="card-body">
							{data.violations.length > 0 ? (
								<ListGroup>
									{data.violations.map((v, idx) => (
										<ListGroup.Item key={idx} className="bg-danger text-white">{v}</ListGroup.Item>
									))}
								</ListGroup>
							) : <p>No violations recorded.</p>}
						</div>
					</div>

					{/* Personality Analysis */}
					{data.personalityAnalysis && (
						<div className="card card-custom mb-4">
							<div className="card-header"><h3 className="card-title">Personality Analysis</h3></div>
							<div className="card-body"><p>{data.personalityAnalysis}</p></div>
						</div>
					)}

					{/* System Feedback */}
					{data.systemFeedback && (
						<div className="card card-custom mb-4">
							<div className="card-header"><h3 className="card-title">System Feedback</h3></div>
							<div className="card-body"><p>{data.systemFeedback}</p></div>
						</div>
					)}
				</Col>
			</Row>
		</div>
	)
}

export default InterviewResult
