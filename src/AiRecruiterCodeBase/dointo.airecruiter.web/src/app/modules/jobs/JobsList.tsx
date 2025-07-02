/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { KTCard, KTCardBody } from "../../../_metronic/helpers";
import { Modal, Form, Button, Table } from "react-bootstrap";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

interface JobPost {
	id: string;
	title: string;
	posted: string;
	status: "Open" | "Closed";
	isEditable: boolean;
	numberOfInterviews: number;
}

const JobPost: React.FC = () => {
	const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
	const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
	const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
	const [closeReason, setCloseReason] = useState("");
	const [copiedJobId, setCopiedJobId] = useState<string | null>(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [jobToDelete, setJobToDelete] = useState<JobPost | null>(null);

	const navigate = useNavigate();

	useEffect(() => {
		axios
			.get(`${import.meta.env.VITE_APP_API_BASE_URL}/JobPosts`)
			.then((res) => {
				if (res.data?.data) {
					const mappedJobs = res.data.data.map((job: any, index: number) => ({
						id: job.jobId ?? job.id ?? index.toString(), // fallback if no jobId provided
						title: job.title,
						posted: job.posted,
						status: job.status,
						isEditable: job.isEditable,
						numberOfInterviews: job.numberOfInterviews ?? 0
					}));
					setJobPosts(mappedJobs);
				}
			})
			.catch((err) => console.error("Failed to fetch job posts:", err));
	}, []);

	const toggleJobSelection = (id: string) => {
		setSelectedJobs((prev) =>
			prev.includes(id) ? prev.filter((jobId) => jobId !== id) : [...prev, id]
		);
	};

	const handleCloseJobs = () => {
		axios
			.post(
				`${import.meta.env.VITE_APP_API_BASE_URL}/JobPosts/close-multiple`,
				{
					jobIds: selectedJobs,
					reason: closeReason,
				}
			)
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

	const handleButtonClick = () => {
		navigate("/jobs/create");
	};

	const handleDeleteJobConfirmed = async () => {
		if (!jobToDelete) return;

		try {
			const res = await axios.delete(
				`${import.meta.env.VITE_APP_API_BASE_URL}/JobPosts/${jobToDelete.id}`,
				{
					withCredentials: true,
				}
			);

			if (res.data.success) {
				toastr.success(res.data.message);
				setJobPosts((prev) => prev.filter((j) => j.id !== jobToDelete.id));
			} else {
				toastr.error(res.data.message || "Failed to delete job post.");
			}
		} catch (error: any) {
			const msg = error?.response?.data?.message ?? "Something went wrong.";
			console.error("Delete job error", error);
			toastr.error(msg);
		} finally {
			setIsDeleteModalOpen(false);
			setJobToDelete(null);
		}
	};

	return (
		<div>
			<div className="d-flex justify-content-end p-3">
				<button className="btn btn-secondary" onClick={handleButtonClick}>
					Post a New Job
				</button>
			</div>
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
											disabled={job.status === "Closed"}
											onChange={() => toggleJobSelection(job.id)}
										/>
									</td>
									<td>
										<Link to={`/jobs/create?id=${job.id}`} className="text-primary fw-bold">
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
									<td>{job.posted}</td>
									<td>
										<Link
											to={`/jobs/${job.id}/interviews`}
											className="text-primary"
											style={{ textDecoration: "underline" }}
										>
											{job.numberOfInterviews}
										</Link>
									</td>
									<td>
										<Button
											variant="link"
											onClick={() => {
												const fullLink = `${window.location.origin}/jobs/conduct/${job.id}?usp=share`;
												navigator.clipboard.writeText(fullLink);
												setCopiedJobId(job.id);
												setTimeout(() => setCopiedJobId(null), 2000);
											}}
										>
											{copiedJobId === job.id ? "Copied!" : "Copy URI"}
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

					{/* Delete Modal */}
					<Modal show={isDeleteModalOpen} onHide={() => setIsDeleteModalOpen(false)} centered>
						<Modal.Header closeButton>
							<Modal.Title>Confirm Deletion</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							Are you sure you want to delete the job post <strong>{jobToDelete?.title}</strong>?
						</Modal.Body>
						<Modal.Footer>
							<Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
								Cancel
							</Button>
							<Button variant="danger" onClick={handleDeleteJobConfirmed}>
								Delete
							</Button>
						</Modal.Footer>
					</Modal>
				</KTCardBody>
			</KTCard>
		</div>
	);
};

export default JobPost;
