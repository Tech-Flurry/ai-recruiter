import * as React from "react";
import { useEffect, useState } from 'react';
import axios from 'axios';
import clsx from 'clsx';

interface ScoredQuestionDto {
	text: string;
	answer: string;
	score: number;
}

interface CandidateInterviewResultDto {
	interviewScore: number;
	isPassed: boolean;
	interviewLength: number;
	questions: ScoredQuestionDto[];
}

interface CandidateInterviewResultProps {
	interviewId: string;
}

const CandidateInterviewResult: React.FC<CandidateInterviewResultProps> = ({ interviewId }) => {
	const [result, setResult] = useState<CandidateInterviewResultDto | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [errorMessage, setErrorMessage] = useState<string>('');

	useEffect(() => {
		const fetchInterviewResult = async () => {
			setLoading(true);
			setErrorMessage('');

			const token = localStorage.getItem('kt-auth-react-v');
			if (!token) {
				setErrorMessage('Auth token not found.');
				setLoading(false);
				return;
			}

			try {
				const response = await axios.get(
					`${(import.meta as any).env.VITE_APP_API_BASE_URL}/interviews/candidate-results/${interviewId}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (response.data.success && response.data.data) {
					setResult(response.data.data);
				} else {
					setErrorMessage(response.data.message || 'Unknown error fetching results.');
				}
			} catch (err: any) {
				setErrorMessage(err.response?.data?.message || err.message);
			} finally {
				setLoading(false);
			}
		};

		if (interviewId) {
			fetchInterviewResult();
		} else {
			setLoading(false);
		}
	}, [interviewId]);

	if (loading) {
		return (
			<div className="result-container">
				<div className="loading-state">
					<div className="spinner"></div>
					<p>Loading your interview results...</p>
				</div>
			</div>
		);
	}

	if (errorMessage) {
		return (
			<div className="result-container">
				<div className="error-state">
					<i className="fas fa-exclamation-triangle"></i>
					<p>{errorMessage}</p>
				</div>
			</div>
		);
	}

	if (!result) {
		return (
			<div className="result-container">
				<div className="empty-state">
					<i className="fas fa-file-alt"></i>
					<p>No interview results available</p>
				</div>
			</div>
		);
	}

	const { interviewScore, isPassed, interviewLength, questions } = result;

	return (
		<div className="result-container">
			<div className="result-card">
				<div className="result-header">
					<h2>Interview Results</h2>
					<div className="interview-info">
						<span>Duration: {interviewLength} minute{interviewLength !== 1 ? 's' : ''}</span>
						<span>Questions: {questions.length}</span>
					</div>
				</div>

				<div className="score-section">
					<div className="score-display">
						<div className={clsx('score-value', isPassed ? 'passed' : 'failed')}>
							{interviewScore.toFixed(2)}
						</div>
						<div className={clsx('score-status', isPassed ? 'passed' : 'failed')}>
							{isPassed ? 'Passed' : 'Failed'}
						</div>
					</div>
					<div className="score-bar">
						<div 
							className={clsx('score-fill', isPassed ? 'passed' : 'failed')}
							style={{ width: `${Math.min(interviewScore * 10, 100)}%` }}
						></div>
					</div>
				</div>

				<div className="questions-section">
					<h3>Question Details</h3>
					<div className="questions-list">
						{questions.map((q, idx) => (
							<div key={idx} className="question-item">
								<div className="question-header">
									<span className="question-number">Q{idx + 1}</span>
									<span className={clsx('question-score', q.score > 2.5 ? 'good' : 'poor')}>
										{q.score.toFixed(2)}/5
									</span>
								</div>
								<div className="question-text">{q.text}</div>
								<div className="answer-text">{q.answer}</div>
							</div>
						))}
					</div>
				</div>
			</div>

			<style jsx>{`
				.result-container {
					min-height: 100vh;
					background: #1a1a1a;
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 20px;
				}

				.result-card {
					background: white;
					border-radius: 12px;
					padding: 30px;
					max-width: 800px;
					width: 100%;
					box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
				}

				.result-header {
					text-align: center;
					margin-bottom: 30px;
				}

				.result-header h2 {
					font-size: 2rem;
					font-weight: 600;
					color: #1a1a1a;
					margin-bottom: 10px;
				}

				.interview-info {
					display: flex;
					justify-content: center;
					gap: 20px;
					font-size: 0.9rem;
					color: #666;
				}

				.score-section {
					text-align: center;
					margin-bottom: 40px;
				}

				.score-display {
					margin-bottom: 20px;
				}

				.score-value {
					font-size: 4rem;
					font-weight: 700;
					margin-bottom: 10px;
				}

				.score-value.passed {
					color: #22c55e;
				}

				.score-value.failed {
					color: #ef4444;
				}

				.score-status {
					font-size: 1.2rem;
					font-weight: 600;
					text-transform: uppercase;
					letter-spacing: 1px;
				}

				.score-status.passed {
					color: #22c55e;
				}

				.score-status.failed {
					color: #ef4444;
				}

				.score-bar {
					width: 100%;
					height: 12px;
					background: #e5e7eb;
					border-radius: 6px;
					overflow: hidden;
					margin: 0 auto;
					max-width: 300px;
				}

				.score-fill {
					height: 100%;
					border-radius: 6px;
					transition: width 0.3s ease;
				}

				.score-fill.passed {
					background: linear-gradient(90deg, #22c55e, #16a34a);
				}

				.score-fill.failed {
					background: linear-gradient(90deg, #ef4444, #dc2626);
				}

				.questions-section h3 {
					font-size: 1.3rem;
					font-weight: 600;
					color: #1a1a1a;
					margin-bottom: 20px;
				}

				.questions-list {
					display: flex;
					flex-direction: column;
					gap: 16px;
				}

				.question-item {
					background: #f8f9fa;
					border-radius: 8px;
					padding: 20px;
					border-left: 4px solid #e5e7eb;
				}

				.question-header {
					display: flex;
					justify-content: between;
					align-items: center;
					margin-bottom: 12px;
				}

				.question-number {
					background: #3b82f6;
					color: white;
					padding: 4px 8px;
					border-radius: 4px;
					font-size: 0.8rem;
					font-weight: 600;
				}

				.question-score {
					font-weight: 600;
					padding: 4px 8px;
					border-radius: 4px;
					font-size: 0.9rem;
				}

				.question-score.good {
					background: #dcfce7;
					color: #16a34a;
				}

				.question-score.poor {
					background: #fee2e2;
					color: #dc2626;
				}

				.question-text {
					font-weight: 600;
					color: #1a1a1a;
					margin-bottom: 8px;
					line-height: 1.4;
				}

				.answer-text {
					color: #666;
					line-height: 1.5;
					font-size: 0.95rem;
				}

				.loading-state,
				.error-state,
				.empty-state {
					text-align: center;
					color: white;
					padding: 40px;
				}

				.loading-state .spinner {
					width: 40px;
					height: 40px;
					border: 4px solid rgba(255, 255, 255, 0.3);
					border-top: 4px solid white;
					border-radius: 50%;
					animation: spin 1s linear infinite;
					margin: 0 auto 20px;
				}

				.error-state i,
				.empty-state i {
					font-size: 3rem;
					margin-bottom: 16px;
					opacity: 0.7;
				}

				@keyframes spin {
					0% { transform: rotate(0deg); }
					100% { transform: rotate(360deg); }
				}

				@media (max-width: 768px) {
					.result-card {
						padding: 20px;
					}

					.score-value {
						font-size: 3rem;
					}

					.interview-info {
						flex-direction: column;
						gap: 8px;
					}

					.question-header {
						flex-direction: column;
						align-items: flex-start;
						gap: 8px;
					}
				}
			`}</style>
		</div>
	);
};

export default CandidateInterviewResult;