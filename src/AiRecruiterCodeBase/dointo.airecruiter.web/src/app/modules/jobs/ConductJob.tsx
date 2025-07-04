﻿import { React, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import CandidateInfo from "../interviews/CandidateInfo";
import InterviewRoom from "../interviews/InterviewRoom";

const ConductJob: React.FC = () => {
	const { jobId = '' } = useParams();
	const location = useLocation();
	const [candidateId, setCandidateId] = useState<string>('');

	const isShared = new URLSearchParams(location.search).get("usp") === "share";
	return (<> {!candidateId && (<CandidateInfo onCandidateCreated={(newId) => setCandidateId(newId)} />)}
		{candidateId && (<InterviewRoom jobId={jobId} candidateId={candidateId} />)}
	</>
	);
};

export default ConductJob;
