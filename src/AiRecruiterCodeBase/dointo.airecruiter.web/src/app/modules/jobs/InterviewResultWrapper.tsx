import { useParams } from 'react-router-dom'
import InterviewResult from './InterviewResult'

const InterviewResultWrapper = () => {
	const { jobId } = useParams()

	if (!jobId) return <div className="p-4 text-danger">Invalid job ID</div>

	return <InterviewResult jobId={jobId} />
}

export default InterviewResultWrapper
