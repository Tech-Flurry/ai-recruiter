import { useNavigate } from "react-router-dom";

function JobsList() {

	const navigate = useNavigate();
	const handleButtonClick = () => 
	{
		navigate("/jobs/create");
	};

	return (
		<div style={{ display: "flex", justifyContent: "flex-end", padding: "10px" }}>
			<button
				type="button"
				className="btn btn-secondary"
				onClick={handleButtonClick}
			>
				Post a New Job
			</button>
		</div>
	);
}

export default JobsList;
