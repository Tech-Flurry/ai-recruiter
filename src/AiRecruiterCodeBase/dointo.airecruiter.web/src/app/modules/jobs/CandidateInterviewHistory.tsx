import React, { useEffect, useState } from 'react'
import {
	Container,
	Card,
	Badge,
	Row,
	Col,
	Alert,
	Spinner,
	Button,
	Form,
} from 'react-bootstrap'
import moment from 'moment'
import axios from 'axios'

type InterviewHistoryItem = {
	jobTitle: string
	score: number
	status: 'Passed' | 'Failed'
	jobStatus: 'Open' | 'Closed'
	interviewedAt: string
}

const CandidateInterviewHistory: React.FC = () => {
	const [history, setHistory] = useState<InterviewHistoryItem[]>([])
	const [filteredHistory, setFilteredHistory] = useState<InterviewHistoryItem[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string>('')

	// Filters
	const [searchTitle, setSearchTitle] = useState('')
	const [resultFilter, setResultFilter] = useState<'All' | 'Passed' | 'Failed'>('All')
	const [startDate, setStartDate] = useState('')
	const [endDate, setEndDate] = useState('')

	useEffect(() => {
		const fetchHistory = async () => {
			try {
				const res = await axios.get(
					`${import.meta.env.VITE_APP_API_BASE_URL}/Interviews/history`,
					{ withCredentials: true }
				)
				const sortedData = [...res.data].sort(
					(a, b) =>
						new Date(b.interviewedAt).getTime() - new Date(a.interviewedAt).getTime()
				)
				setHistory(sortedData)
				setFilteredHistory(sortedData)
			} catch (err) {
				console.error(err)
				setError('Failed to fetch interview history.')
			} finally {
				setLoading(false)
			}
		}

		fetchHistory()
	}, [])

	// Filter logic
	useEffect(() => {
		const filtered = history.filter((item) => {
			const matchesTitle = item.jobTitle.toLowerCase().includes(searchTitle.toLowerCase())
			const matchesResult = resultFilter === 'All' || item.status === resultFilter
			const matchesStart = !startDate || new Date(item.interviewedAt) >= new Date(startDate)
			const matchesEnd = !endDate || new Date(item.interviewedAt) <= new Date(endDate)
			return matchesTitle && matchesResult && matchesStart && matchesEnd
		})
		setFilteredHistory(filtered)
	}, [searchTitle, resultFilter, startDate, endDate, history])

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

	const clearFilters = () => {
		setSearchTitle('')
		setResultFilter('All')
		setStartDate('')
		setEndDate('')
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

			{/* Filters */}
			<Row className="mb-4 align-items-end g-2">
				<Col md={3}>
					<Form.Label>Search Job Title</Form.Label>
					<Form.Control
						type="text"
						placeholder="e.g. React Developer"
						value={searchTitle}
						onChange={(e) => setSearchTitle(e.target.value)}
					/>
				</Col>
				<Col md={2}>
					<Form.Label>Result</Form.Label>
					<Form.Select
						value={resultFilter}
						onChange={(e) => setResultFilter(e.target.value as 'All' | 'Passed' | 'Failed')}
					>
						<option value="All">All</option>
						<option value="Passed">Passed</option>
						<option value="Failed">Failed</option>
					</Form.Select>
				</Col>
				<Col md={2}>
					<Form.Label>Start Date</Form.Label>
					<Form.Control
						type="date"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
					/>
				</Col>
				<Col md={2}>
					<Form.Label>End Date</Form.Label>
					<Form.Control
						type="date"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
					/>
				</Col>
				<Col md={3}>
					<Button variant="outline-primary" className="w-100 mt-1" onClick={clearFilters}>
						Clear Filters
					</Button>

				</Col>
			</Row>

			<Card className="shadow-sm">
				<Card.Body>
					{loading ? (
						<div className="text-center">
							<Spinner animation="border" variant="primary" />
						</div>
					) : error ? (
						<Alert variant="danger" className="text-center">
							{error}
						</Alert>
					) : filteredHistory.length === 0 ? (
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
									{filteredHistory.map((item, index) => (
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
