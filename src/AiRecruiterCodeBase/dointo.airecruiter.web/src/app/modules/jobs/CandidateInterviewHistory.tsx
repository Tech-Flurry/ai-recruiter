import React from 'react'
import {
	Container,
	Card,
	Badge,
	Row,
	Col,
	Alert,
} from 'react-bootstrap'
import moment from 'moment'

type InterviewHistoryItem = {
	jobTitle: string
	score: number
	status: 'Passed' | 'Failed'
	jobStatus: 'Open' | 'Closed'
	interviewedAt: string
}

// 🔹 Mock interview data
const mockHistory: InterviewHistoryItem[] = [
	{
		jobTitle: 'Frontend Developer',
		score: 8.5,
		status: 'Passed',
		jobStatus: 'Closed',
		interviewedAt: '2025-07-01',
	},
	{
		jobTitle: 'React Engineer',
		score: 6.2,
		status: 'Failed',
		jobStatus: 'Open',
		interviewedAt: '2025-06-25',
	},
	{
		jobTitle: 'Full Stack Developer',
		score: 7.4,
		status: 'Passed',
		jobStatus: 'Closed',
		interviewedAt: '2025-06-10',
	},
]

const CandidateInterviewHistory: React.FC = () => {
	const history = [...mockHistory].sort(
		(a, b) =>
			new Date(b.interviewedAt).getTime() - new Date(a.interviewedAt).getTime()
	)

	const getStatusBadge = (status: string, type: 'result' | 'job') => {
		let variant: string = 'dark'

		if (type === 'result') {
			variant = status === 'Passed' ? 'success' : 'danger'
		} else if (type === 'job') {
			variant = status === 'Open' ? 'primary' : 'secondary'
		}

		return (
			<Badge bg={variant} className="px-3 py-1 rounded-pill">
				{status}
			</Badge>
		)
	}

	return (
		<Container className="my-5">
			<Row className="mb-4">
				<Col>
					<h2 className="fw-bold text-dark">Interview Performance Summary</h2>
					<p className="text-muted">
						Review your interview results, status updates, and job progress across applications.
					</p>
				</Col>
			</Row>

			<Card className="shadow-sm">
				<Card.Body>
					{history.length === 0 ? (
						<Alert variant="warning" className="text-center">
							No interviews found.
						</Alert>
					) : (
						<div className="table-responsive">
							<table className="table table-rounded table-row-bordered border gy-7 gs-7">
								<thead>
									<tr className="fw-bold fs-6 text-gray-800 border-bottom-2 border-gray-200">
										<th>Date</th>
										<th>Job Title</th>
										<th>Score</th>
										<th>Result</th>
										<th>Job Status</th>
									</tr>
								</thead>
								<tbody>
									{history.map((item, index) => (
										<tr key={index}>
											<td>{moment(item.interviewedAt).format('DD MMM YYYY')}</td>
											<td className="fw-semibold text-dark">{item.jobTitle}</td>
											<td>{item.score.toFixed(1)}</td>
											<td>{getStatusBadge(item.status, 'result')}</td>
											<td>{getStatusBadge(item.jobStatus, 'job')}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</Card.Body>
			</Card>
		</Container>
	)
}

export default CandidateInterviewHistory
