import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState } from 'react';

const InterviewResultWrapper = () => {
	const { jobId } = useParams();
	const [result, setResult] = useState(null);

	useEffect(() => {
		if (!jobId) return;

		console.log("Fetching result for jobId:", jobId);

		axios
			.get(`${import.meta.env.VITE_APP_API_BASE_URL}/InterviewResults/${jobId}`)
			.then(res => {
				console.log("API Success:", res.data);
				setResult(res.data);
			})
			.catch(err => {
				console.error("API Error:", err);
			});
	}, [jobId]);

	return (
		<div>
			<h2>Interview Result</h2>
			<pre>{JSON.stringify(result, null, 2)}</pre>
		</div>
	);
};

export default InterviewResultWrapper;
