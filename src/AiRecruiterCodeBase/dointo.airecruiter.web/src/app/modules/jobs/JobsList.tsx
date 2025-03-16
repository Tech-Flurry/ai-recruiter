import React, { useState, useEffect } from "react";
import { KTCard, KTCardBody } from "../../../_metronic/helpers";
import { Modal, Form, Button, Table } from "react-bootstrap"; // Bootstrap Modal

// Job Post Type Definition
interface JobPost {
	id: string;
	title: string;
	createdAt: string;
	status: "open" | "closed";
	hasInterviews: boolean;
}

const JobPost: React.FC = () => {
	const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
	const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
	const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
	const [closeReason, setCloseReason] = useState("");

	// Fetch job posts (Mock API call)
	useEffect(() => {
		fetch("/api/job-posts")
			.then((res) => res.json())
			.then((data) => setJobPosts(data));
	}, []);

	// Toggle selection for bulk closing
	const toggleJobSelection = (id: string) => {
		setSelectedJobs((prev) =>
			prev.includes(id) ? prev.filter((jobId) => jobId !== id) : [...prev, id]
		);
	};

	// Handle closing jobs
	const handleCloseJobs = () => {
		fetch("/api/job-posts/close", {
			method: "POST",
			body: JSON.stringify({ jobIds: selectedJobs, reason: closeReason }),
			headers: { "Content-Type": "application/json" },
		}).then(() => {
			setJobPosts((prev) =>
				prev.map((job) =>
					selectedJobs.includes(job.id) ? { ...job, status: "closed" } : job
				)
			);
			setSelectedJobs([]);
			setIsCloseModalOpen(false);
			setCloseReason("");
		});
	};

	return (
		<KTCard>
			<KTCardBody>
				{/* Header with Bulk Action Button */}
				<div className="d-flex justify-content-between align-items-center mb-4">
					<h3 className="fw-bold">Job Posts</h3>
					<Button
						variant="primary"
						onClick={() => setIsCloseModalOpen(true)}
						disabled={selectedJobs.length === 0}
					>
						Bulk Close Selected
					</Button>
				</div>
				<Table striped bordered hover responsive>
					<thead>
						<tr>
							<th>
								<input
									type="checkbox"
									onChange={(e) =>
										setSelectedJobs(e.target.checked ? jobPosts.map((job) => job.id) : [])
									}
								/>
							</th>
							<th>Job Title</th>
							<th>Status</th>
							<th>Created At</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{jobPosts.map((job) => (
							<tr key={job.id}>
								<td>
									<input
										type="checkbox"
										checked={selectedJobs.includes(job.id)}
										onChange={() => toggleJobSelection(job.id)}
									/>
								</td>
								<td>{job.title}</td>
								<td>
									<span className={`badge ${job.status === "open" ? "bg-success" : "bg-danger"}`}>
										{job.status.toUpperCase()}
									</span>
								</td>
								<td>{new Date(job.createdAt).toLocaleDateString()}</td>
								<td>
									<Button variant="outline-primary" disabled={job.status === "closed" || job.hasInterviews}>
										Edit
									</Button>
									<Button variant="outline-secondary">Copy URI</Button>
									<Button
										variant="outline-danger"
										onClick={() => {
											setSelectedJobs([job.id]);
											setIsCloseModalOpen(true);
										}}
									>
										Close Job
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</Table>;


				{/* Close Job Modal */}
				<Modal show={isCloseModalOpen} onHide={() => setIsCloseModalOpen(false)} centered>
					<Modal.Header closeButton>
						<Modal.Title>Close Job Posts</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Form.Group>
							<Form.Label>Reason for Closing</Form.Label>
							<Form.Control
								as="textarea"
								rows={3}
								value={closeReason}
								onChange={(e) => setCloseReason(e.target.value)}
								placeholder="Enter closing reason..."
							/>
						</Form.Group>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={() => setIsCloseModalOpen(false)}>
							Cancel
						</Button>
						<Button variant="danger" onClick={handleCloseJobs} disabled={!closeReason}>
							Close Jobs
						</Button>
					</Modal.Footer>
				</Modal>
			</KTCardBody>
		</KTCard>
	);

};

export default JobPost;
