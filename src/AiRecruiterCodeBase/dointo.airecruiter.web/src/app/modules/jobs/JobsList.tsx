import React, { useState, useEffect } from "react";
import axios from "axios";
import { KTCard, KTCardBody } from "../../../_metronic/helpers";
import { Modal, Form, Button, Table } from "react-bootstrap";
import { Link } from "react-router-dom"; // 👈 for linking job titles

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

	useEffect(() => {
		axios
			.get("https://localhost:7072/api/JobPosts")
			.then((res) => setJobPosts(res.data.data))
			.catch((err) => console.error("Failed to fetch job posts:", err));
	}, []);

	const toggleJobSelection = (id: string) => {
		setSelectedJobs((prev) =>
			prev.includes(id) ? prev.filter((jobId) => jobId !== id) : [...prev, id]
		);
	};

	const handleCloseJobs = () => {
		axios
			.post("https://localhost:7072/api/JobPosts/close", {
				jobIds: selectedJobs,
				reason: closeReason,
			})
			.then(() => {
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
							<th>Posted</th>
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

								<td>
									<Link
										to={`/jobs/create?id=${job.id}`}
										className="text-primary text-hover-dark fw-bold"
										style={{ textDecoration: "none" }}
									>
										{job.title}
									</Link>
								</td>

								<td>
									<span
										className={`badge ${job.status === "Open" ? "bg-success" : "bg-danger"}`}
									>
										{job.status}
									</span>
								</td>

								<td>{new Date(job.createdAt).toLocaleDateString()}</td>
								<td>{job.numberOfInterviews}</td>

								<td>
									<Button
										className="btn btn-light-primary btn-sm"
										onClick={(e) => {
											const fullLink = `${window.location.origin}/jobs/conduct/${job.id}?usp=share`;
											navigator.clipboard.writeText(fullLink);
											const button = e.currentTarget;
											const originalText = button.innerText;
											button.innerText = "Copied!";
											setTimeout(() => {
												button.innerText = originalText;
											}, 2000);
										}}
									>
										Copy URI
									</Button>{" "}
									<Button
										variant="danger"
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

				{/* Close Modal */}
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
