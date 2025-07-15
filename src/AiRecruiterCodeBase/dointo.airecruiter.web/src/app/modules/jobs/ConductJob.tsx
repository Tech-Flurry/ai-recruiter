import * as React from "react";
import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import CandidateInfo from "../interviews/CandidateInfo";
import InterviewRoom from "../interviews/InterviewRoom";

const ConductJob: React.FC = () => {
	const { jobId = '' } = useParams();
	const location = useLocation();
	const [candidateId, setCandidateId] = useState<string>('');
	const [isCheckingCandidate, setIsCheckingCandidate] = useState(true);
	const [error, setError] = useState<string>('');

	const isShared = new URLSearchParams(location.search).get("usp") === "share";

	useEffect(() => {
		const checkExistingCandidate = async () => {
			try {
				const rawToken = localStorage.getItem("kt-auth-react-v");
				if (!rawToken) {
					setIsCheckingCandidate(false);
					return;
				}

				const tokenObj = JSON.parse(rawToken);
				if (!tokenObj.api_token) {
					setIsCheckingCandidate(false);
					return;
				}

				const response = await axios.get(
					`${import.meta.env.VITE_APP_API_BASE_URL}/interviews/get-candidate`,
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${tokenObj.api_token}`,
						},
					}
				);

				const result = response.data;
				if (result.success && result.data?.id) {
					// Candidate exists, set the ID to skip the form
					setCandidateId(result.data.id);
				}
				// If no candidate found or unsuccessful, candidateId remains empty
				// which will show the candidate creation form
			} catch (error: any) {
				// If API call fails (e.g., no candidate found), we'll show the form
				// Only set error for unexpected failures
				if (error.response?.status !== 404) {
					setError("Failed to check existing candidate. Please try again.");
				}
			} finally {
				setIsCheckingCandidate(false);
			}
		};

		checkExistingCandidate();
	}, []);

	if (isCheckingCandidate) {
		return (
			<div className="conduct-job-container">
				<div className="loading-wrapper">
					<div className="text-center">
						<div className="spinner-border text-primary" role="status">
							<span className="visually-hidden">Loading...</span>
						</div>
						<p className="mt-3">Checking for existing candidate...</p>
					</div>
				</div>
				<style jsx="true">{`
					.conduct-job-container {
						min-height: 100vh;
						background: #f8f9fa;
						display: flex;
						align-items: center;
						justify-content: center;
					}

					.loading-wrapper {
						text-align: center;
					}
				`}</style>
			</div>
		);
	}

	if (error) {
		return (
			<div className="conduct-job-container">
				<div className="error-wrapper">
					<div className="alert alert-danger" role="alert">
						{error}
					</div>
					<button 
						className="btn btn-primary mt-3"
						onClick={() => window.location.reload()}
					>
						Try Again
					</button>
				</div>
				<style jsx="true">{`
					.conduct-job-container {
						min-height: 100vh;
						background: #f8f9fa;
						display: flex;
						align-items: center;
						justify-content: center;
					}

					.error-wrapper {
						max-width: 500px;
						width: 100%;
						text-align: center;
					}
				`}</style>
			</div>
		);
	}

	return (
		<div className="conduct-job-container">
			{!candidateId && (
				<div className="candidate-info-wrapper">
					<CandidateInfo onCandidateCreated={(newId) => setCandidateId(newId)} />
				</div>
			)}
			{candidateId && (
				<InterviewRoom jobId={jobId} candidateId={candidateId} />
			)}

			<style jsx="true">{`
				.conduct-job-container {
					min-height: 100vh;
					background: #f8f9fa;
				}

				.candidate-info-wrapper {
					padding: 20px;
					max-width: 1200px;
					margin: 0 auto;
				}
			`}</style>
		</div>
	);
};

export default ConductJob;
