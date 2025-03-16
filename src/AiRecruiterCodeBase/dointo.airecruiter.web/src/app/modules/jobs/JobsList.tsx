import { useNavigate } from "react-router-dom";

function JobsList() {
	const navigate = useNavigate();

	const handleButtonClick = () => {
		console.log("Navigating to /jobs/post-new..."); // Debugging
		navigate("/jobs/post-new");
	};

	return (
		<div style={{ display: "flex", justifyContent: "flex-end", padding: "10px" }}>
			<button type="button" className="btn btn-secondary" onClick={handleButtonClick}>
				Post a New Job
			</button>
		</div>
	);
}

export default JobsList;