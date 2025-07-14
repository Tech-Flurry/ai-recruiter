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
		const fetchJobs = async () => {
			const token = localStorage.getItem('kt-auth-react-v');
		  if (!token) {
			console.error("Token not found.");
			return;
		  }
	  
		  try {
			const res = await axios.get<{ data: JobPost[] }>(
			  `${import.meta.env.VITE_APP_API_BASE_URL}/JobPosts`,
			  {
				headers: {
				  Authorization: `Bearer ${token.api_token}`,
				},
			  }
			);
			setJobPosts(res.data.data);
		  } catch (err) {
			console.error("Failed to fetch job posts:", err);
		  }
		};
	  
		fetchJobs();
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
										<button
											onClick={() => {
												const fullLink = `${window.location.origin}/jobs/conduct/${job.id}?usp=share`;
												navigator.clipboard.writeText(fullLink);
												setCopiedJobId(job.id);
												setTimeout(() => setCopiedJobId(null), 2000);
											}}
											title="Copy URI"
											style={{
												background: "transparent",
												border: "none",
												padding: 0,
												marginRight: "8px",
												boxShadow: "none",
												cursor: "pointer",
											}}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="24px"
												height="24px"
												viewBox="0 0 24 24"
											>
												<g
													stroke="none"
													strokeWidth="1"
													fill="none"
													fillRule="evenodd"
												>
													<rect x="0" y="0" width="24" height="24" />
													<path
														d="M8,3 L8,3.5 C8,4.32842712 8.67157288,5 9.5,5 L14.5,5 C15.3284271,5 16,4.32842712 16,3.5 L16,3 L18,3 C19.1045695,3 20,3.8954305 20,5 L20,21 C20,22.1045695 19.1045695,23 18,23 L6,23 C4.8954305,23 4,22.1045695 4,21 L4,5 C4,3.8954305 4.8954305,3 6,3 L8,3 Z"
														fill={
															copiedJobId === job.id ? "#009EF7" : "#5E6278"
														}
														opacity="0.3"
													/>
													<path
														d="M11,2 C11,1.44771525 11.4477153,1 12,1 C12.5522847,1 13,1.44771525 13,2 L14.5,2 C14.7761424,2 15,2.22385763 15,2.5 L15,3.5 C15,3.77614237 14.7761424,4 14.5,4 L9.5,4 C9.22385763,4 9,3.77614237 9,3.5 L9,2.5 C9,2.22385763 9.22385763,2 9.5,2 L11,2 Z"
														fill={
															copiedJobId === job.id ? "#009EF7" : "#5E6278"
														}
													/>
													<rect
														fill={
															copiedJobId === job.id ? "#009EF7" : "#5E6278"
														}
														opacity="0.3"
														x="7"
														y="10"
														width="5"
														height="2"
														rx="1"
													/>
													<rect
														fill={
															copiedJobId === job.id ? "#009EF7" : "#5E6278"
														}
														opacity="0.3"
														x="7"
														y="14"
														width="9"
														height="2"
														rx="1"
													/>
												</g>
											</svg>
										</button>

										{/* Close Job Icon */}
										{job.status !== "Closed" && (
											<span
												className="svg-icon svg-icon-2x"
												style={{
													cursor: "pointer",
													color: selectedJobs.includes(job.id)
														? "#F1416C"
														: "#A1A5B7",
													transition: "color 0.2s ease",
												}}
												onClick={() => {
													setSelectedJobs([job.id]);
													setIsCloseModalOpen(true);
												}}
												title="Close Job"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													width="24px"
													height="24px"
													viewBox="0 0 24 24"
													fill="currentColor"
												>
													<g
														stroke="none"
														strokeWidth="1"
														fill="none"
														fillRule="evenodd"
													>
														<rect x="0" y="0" width="24" height="24" />
														<path
															d="M12,22 C6.4771525,22 2,17.5228475 2,12 
														C2,6.4771525 6.4771525,2 12,2 
														C17.5228475,2 22,6.4771525 22,12 
														C22,17.5228475 17.5228475,22 12,22 Z 
														M12,20 C16.418278,20 20,16.418278 20,12 
														C20,7.581722 16.418278,4 12,4 
														C7.581722,4 4,7.581722 4,12 
														C4,16.418278 7.581722,20 12,20 Z 
														M19.0710678,4.92893219 
														C19.4615921,5.31945648 19.4615921,5.95262146 19.0710678,6.34314575 
														L6.34314575,19.0710678 
														C5.95262146,19.4615921 5.31945648,19.4615921 4.92893219,19.0710678 
														C4.5384079,18.6805435 4.5384079,18.0473785 4.92893219,17.6568542 
														L17.6568542,4.92893219 
														C18.0473785,4.5384079 18.6805435,4.5384079 19.0710678,4.92893219 Z"
															fill="currentColor"
															fillRule="nonzero"
															opacity="0.9"
														/>
													</g>
												</svg>
											</span>
										)}
										{/* Delete Button */}
										<button
											title="Delete Job"
											onClick={() => {
												if (job.numberOfInterviews > 0) {
													toastr.warning(
														"This job post cannot be deleted because candidates have already interviewed. You can only close it."
													);
													return;
												}
												setJobToDelete(job);
												setIsDeleteModalOpen(true);
											}}
											style={{
												background: "transparent",
												border: "none",
												marginLeft: "10px",
												cursor: "pointer",
											}}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="20"
												height="20"
												fill="red"
												viewBox="0 0 24 24"
											>
												<path d="M3 6h18v2H3zm2 3h14l-1.5 12.5c-.1.8-.8 1.5-1.7 1.5H8.2c-.9 0-1.6-.7-1.7-1.5L5 9zm5 2v9h2v-9H10zm4 0v9h2v-9h-2z" />
											</svg>
										</button>
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
