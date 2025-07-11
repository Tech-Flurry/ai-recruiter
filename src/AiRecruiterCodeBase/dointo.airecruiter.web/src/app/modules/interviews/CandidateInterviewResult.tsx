import React, { useEffect, useState } from 'react'
import axios from 'axios'
import clsx from 'clsx'

interface ScoredQuestionDto {
	text: string
	answer: string
	score: number
}

interface CandidateInterviewResultDto {
	interviewScore: number
	isPassed: boolean
	interviewLength: number
	questions: ScoredQuestionDto[]
}

interface CandidateInterviewResultProps {
	interviewId: string
}

const CandidateInterviewResult: React.FC<CandidateInterviewResultProps> = ({ interviewId }) => {
	const [result, setResult] = useState<CandidateInterviewResultDto | null>(null)
	const [loading, setLoading] = useState<boolean>(true)
	const [errorMessage, setErrorMessage] = useState<string>('')

	useEffect(() => {
		const fetchInterviewResult = async () => {
			setLoading(true)
			setErrorMessage('')

			try {
				// Example: GET /api/Interviews/candidate-results/{interviewId}
				const response = await axios.get(
					`${import.meta.env.VITE_APP_API_BASE_URL}/interviews/candidate-results/${interviewId}`
				)

				// Your API response is typically wrapped in a success state
				if (response.data.success && response.data.data) {
					setResult(response.data.data)
				} else {
					setErrorMessage(response.data.message || 'Unknown error fetching results.')
				}
			} catch (err: any) {
				setErrorMessage(err.response?.data?.message || err.message)
			} finally {
				setLoading(false)
			}
		}

		if (interviewId) {
			fetchInterviewResult()
		} else {
			setLoading(false)
		}
	}, [interviewId])

	if (loading) {
		return <div className="alert alert-info">Loading results...</div>
	}

	if (errorMessage) {
		return <div className="alert alert-danger">{errorMessage}</div>
	}

	if (!result) {
		return (
			<div className="alert alert-warning">
				No data available for this interview.
			</div>
		)
	}

	const { interviewScore, isPassed, interviewLength, questions } = result

	return (
		<div className="card">
			<div className="card-header border-0">
				<h3 className="card-title">Candidate Interview Result</h3>
			</div>
			<div className="card-body pt-0">
				{/* Score and pass/fail indicator */}
				<div className="row mb-5">
					<div className="col">
						<span
							className={clsx(
								'fs-1 fw-bolder',
								isPassed ? 'text-success' : 'text-danger'
							)}
						>
							{interviewScore.toFixed(2)}
						</span>
						<span className="text-muted ms-3">
							{isPassed ? '(Passed)' : '(Failed)'}
						</span>
					</div>
					<div className="col text-end">
						<span className="fs-6 fw-bold text-gray-600">
							Interview Length: {interviewLength} minute
							{interviewLength !== 1 ? 's' : ''}
						</span>
					</div>
				</div>

				{/* Questions list */}
				<div className="table-responsive">
					<table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
						<thead>
							<tr className="fw-bold text-muted">
								<th>Question</th>
								<th>Answer</th>
								<th>Score</th>
							</tr>
						</thead>
						<tbody>
							{questions.map((q, idx) => (
								<tr key={idx}>
									<td className="text-gray-800 fw-semibold">{q.question}</td>
									<td className="text-gray-600">{q.answer}</td>
									<td
										className={clsx(
											'fw-semibold',
											q.score > 0 ? 'text-success' : 'text-danger'
										)}
									>
										{q.score.toFixed(2)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}

export default CandidateInterviewResult