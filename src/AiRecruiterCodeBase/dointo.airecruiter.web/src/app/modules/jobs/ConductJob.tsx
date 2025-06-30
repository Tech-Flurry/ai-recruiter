import React from "react";
import { useParams, useLocation } from "react-router-dom";

const ConductJob: React.FC = () => {
	const { jobId } = useParams();
	const location = useLocation();

	const isShared = new URLSearchParams(location.search).get("usp") === "share";
	const deepLink = `airecruiter:jobs/conduct/${jobId}`;

	return (
		<div
			className="d-flex justify-content-center align-items-center"
			style={{ height: "100vh", flexDirection: "column" }}
		>
			{isShared ? (
				<a
					href={deepLink}
					className="btn btn-primary btn-lg"
					style={{
						padding: "1rem 2rem",
						fontSize: "1.5rem",
						textDecoration: "none",
						borderRadius: "10px",
						fontWeight: "bold",
					}}
				>
					Open in AI Recruiter App
				</a>
			) : (
				<p>Invalid or unauthorized access.</p>
			)}
		</div>
	);
};

export default ConductJob;
