import * as React from "react";
import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import CandidateInfo from "../interviews/CandidateInfo";
import InterviewRoom from "../interviews/InterviewRoom";

const ConductJob: React.FC = () => {
	const { jobId = '' } = useParams();
	const location = useLocation();
	const [candidateId, setCandidateId] = useState<string>('');

	const isShared = new URLSearchParams(location.search).get("usp") === "share";

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

			<style jsx>{`
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
