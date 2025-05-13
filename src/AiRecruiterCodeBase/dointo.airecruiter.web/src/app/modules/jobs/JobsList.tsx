import React, { useState, useEffect } from "react";
import { KTCard, KTCardBody } from "../../../_metronic/helpers";
import { Modal, Form, Button, Table } from "react-bootstrap";

// Updated Job Post Type Definition based on your backend structure
interface JobPost {
	id: string;
	title: string;
	createdAt: string;
	status: "Open" | "Closed";
	isEditable: boolean;
	numberOfInterviews: number;
}

const JobPost: React.FC = () => {
	const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
	const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
	const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
	const [closeReason, setCloseReason] = useState("");

	// Fetch job posts from backend
	useEffect(() => {
		fetch("https://localhost:7072/api/JobPosts")
			.then((res) => res.json())
			.then((data) => setJobPosts(data.data)) // Adjusted for backend response shape
			.catch((err) => console.error("Failed to fetch job posts:", err));
	}, []);

	// Toggle selection for bulk close
	const toggleJobSelection = (id: string) => {
		setSelectedJobs((prev) =>
			prev.includes(id) ? prev.filter((jobId) => jobId !== id) : [...prev, id]
		);
	};

	// Close selected jobs (call backend)
	const handleCloseJobs = () => {
		fetch("https://localhost:7072/api/JobPosts/close", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ jobIds: selectedJobs, reason: closeReason }),
		})
			.then((res) => {
				if (!res.ok) throw new Error("Close failed");
				return res.json();
			})
			.then(() => {
				// Mark jobs closed in UI
				setJobPosts((prev) =>
					prev.map((job) =>
						selectedJobs.includes(job.id) ? { ...job, status: "Closed" } : job
					)
				);
				setSelectedJobs([]);
				setIsCloseModalOpen(false);
				setCloseReason("");
			})
			.catch((err) => {
				console.error("Error closing jobs:", err);
				alert("Failed to close jobs. Check server log.");
			});
	};

	return (
		<KTCard>
			<KTCardBody>
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
										setSelectedJobs(
											e.target.checked ? jobPosts.map((job) => job.id) : []
										)
									}
								/>
							</th>
							<th>Job Title</th>
							<th>Status</th>
							<th>Created At</th>
							<th>Interviews</th>
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
									<span
										className={`badge ${job.status === "Open" ? "bg-success" : "bg-danger"
											}`}
									>
										{job.status}
									</span>
								</td>
								<td>{new Date(job.createdAt).toLocaleDateString()}</td>
								<td>{job.numberOfInterviews}</td>
								<td>
									<Button
										variant="outline-primary"
										size="sm"
										disabled={job.status === "Closed" || !job.isEditable}
									>
										Edit
									</Button>{" "}
									<Button
										variant="outline-secondary"
										size="sm"
										onClick={() =>
											navigator.clipboard.writeText(
												`/jobs/conduct/${job.id}?usp=share`
											)
										}
									>
										Copy URI
									</Button>{" "}
									<Button
										variant="outline-danger"
										size="sm"
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
				</Table>

				{/* Close Job Modal */}
				<Modal
					show={isCloseModalOpen}
					onHide={() => setIsCloseModalOpen(false)}
					centered
				>
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
						<Button
							variant="danger"
							onClick={handleCloseJobs}
							disabled={!closeReason}
						>
							Close Jobs
						</Button>
					</Modal.Footer>
				</Modal>
			</KTCardBody>
		</KTCard>
	);
};

export default JobPost;
