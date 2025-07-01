import React from "react";
import { useParams, useLocation } from "react-router-dom";
import CandidateInfo from "../interviews/CandidateInfo";

const ConductJob: React.FC = () => {
	const { jobId } = useParams();
	const location = useLocation();

	const isShared = new URLSearchParams(location.search).get("usp") === "share";
	const deepLink = `airecruiter://jobs/conduct/${jobId}`;

	return (
		<CandidateInfo />
	);
};

export default ConductJob;
