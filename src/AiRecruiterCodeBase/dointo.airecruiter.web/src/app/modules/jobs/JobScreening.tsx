﻿import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { KTCard, KTCardBody } from "../../../_metronic/helpers";
import { Table, Dropdown, Form, InputGroup, FormControl } from "react-bootstrap";
import toastr from "toastr";
import "toastr/build/toastr.min.css";
import { Link } from 'react-router-dom';
import axios from "axios";

type Candidate = {
	id: number;
	interviewId: string;
	name: string;
	email: string;
	phoneNumber?: string;
	score: number;
	status: "Selected" | "Rejected" | "Screened";
	jobId: string;
	jobTitle: string;
	lastInterviewed: Date;
	profilePicUrl?: string;
};

const getInitials = (name: string) =>
	name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.toUpperCase();

const timeAgo = (date: Date) => {
	const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
	if (seconds < 60) return `${seconds} seconds ago`;
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes} minutes ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours} hours ago`;
	const days = Math.floor(hours / 24);
	return `${days} days ago`;
};

const JobScreen: React.FC = () => {
	const { jobId } = useParams<{ jobId: string }>();
	const [candidates, setCandidates] = useState<Candidate[]>([]);
	const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
	const [selectedCandidates, setSelectedCandidates] = useState<Set<number>>(new Set());
	const [searchTerm, setSearchTerm] = useState("");
	const [updatingId, setUpdatingId] = useState<number | null>(null);
	const [jobTitle, setJobTitle] = useState<string>("Loading...");

	useEffect(() => {
		const fetchCandidates = async () => {
			const token = localStorage.getItem('kt-auth-react-v');
			if (!token) {
				console.error('Auth token not found.');
				toastr.error('You are not authorized.');
				return;
			}

			try {
				const response = await axios.get(
					`${import.meta.env.VITE_APP_API_BASE_URL}/candidates/by-job/${jobId}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (response.data.success) {
					const apiCandidates = response.data.data.map((cand: any, index: number) => ({
						id: index + 1,
						interviewId: cand.interviewId,
						name: cand.name,
						email: cand.email,
						phoneNumber: cand.phone ?? "",
						score: cand.score,
						status: cand.status ?? "Screened",
						jobId: jobId ?? "",
						jobTitle: cand.jobTitle ?? "",
						lastInterviewed: new Date(cand.lastInterviewed),
						profilePicUrl: undefined,
					}));
					setCandidates(apiCandidates);
					setFilteredCandidates(apiCandidates);
					setSelectedCandidates(new Set());
					setSearchTerm("");
				} else {
					toastr.warning(response.data.message || "No candidates found.");
				}
			} catch (error) {
				console.error("Failed to fetch candidates", error);
				toastr.error("Error fetching candidates.");
			}
		};

		const fetchJobTitle = async () => {
			const token = localStorage.getItem('kt-auth-react-v');
			if (!token) {
				console.error('Auth token not found.');
				return;
			}

			try {
				const res = await axios.get(
					`${import.meta.env.VITE_APP_API_BASE_URL}/candidates/job-title/${jobId}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (res.data?.success && res.data.jobTitle) {
					setJobTitle(res.data.jobTitle);
				} else {
					setJobTitle("Unknown");
				}
			} catch (err) {
				console.error("Error fetching job title", err);
				setJobTitle("Unknown");
			}
		};

		if (jobId) {
			fetchCandidates();
			fetchJobTitle();
		}
	}, [jobId]);

	useEffect(() => {
		const term = searchTerm.toLowerCase();
		const filtered = candidates.filter(
			(cand) =>
				cand.name.toLowerCase().includes(term) ||
				cand.email.toLowerCase().includes(term)
		);
		setFilteredCandidates(filtered);
	}, [searchTerm, candidates]);

	const updateStatus = async (id: number, newStatus: Candidate["status"]) => {
		const candidate = candidates.find(c => c.id === id);
		if (!candidate) return;

		setUpdatingId(id);

		const token = localStorage.getItem('kt-auth-react-v');
		if (!token) {
			toastr.error("Auth token not found.");
			setUpdatingId(null);
			return;
		}

		try {
			const response = await axios.patch(
				`${import.meta.env.VITE_APP_API_BASE_URL}/candidates/update-status`,
				{
					interviewId: candidate.interviewId,
					status: newStatus
				},
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.status === 200 && response.data?.success !== false) {
				setCandidates((prev) =>
					prev.map((cand) =>
						cand.id === id ? { ...cand, status: newStatus } : cand
					)
				);
				toastr.success(`Candidate marked as "${newStatus}"`);
			} else {
				toastr.error(response.data.message || "Failed to update status.");
			}
		} catch (error) {
			console.error("Failed to update status:", error);
			toastr.error("Error updating candidate status.");
		} finally {
			setUpdatingId(null);
		}
	};


	const toggleCandidateSelection = (id: number) => {
		setSelectedCandidates((prev) => {
			const copy = new Set(prev);
			if (copy.has(id)) copy.delete(id);
			else copy.add(id);
			return copy;
		});
	};

	const toggleSelectAll = () => {
		const allSelected = filteredCandidates.every((cand) => selectedCandidates.has(cand.id));
		const newSet = new Set<number>();
		if (!allSelected) {
			filteredCandidates.forEach((cand) => newSet.add(cand.id));
		}
		setSelectedCandidates(newSet);
	};

	const getStatusBadgeClass = (status: Candidate["status"]) => {
		switch (status) {
			case "Selected":
				return "badge badge-light-success fw-bold";
			case "Rejected":
				return "badge badge-light-danger fw-bold";
			case "Screened":
			default:
				return "badge badge-light-primary fw-bold text-primary";
		}
	};

	return (
		<KTCard className="mt-5">
			<KTCardBody>
				<h3 className="mb-4">
					Screened Candidates for Job: <span className="text-primary fw-bold">{jobTitle}</span>
				</h3>

				<div className="d-flex align-items-center justify-content-start mb-4 flex-wrap gap-2">
					<InputGroup style={{ maxWidth: "320px", minWidth: "220px", flexGrow: 1 }}>
						<InputGroup.Text>
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8e9aad" strokeWidth="2">
								<circle cx="11" cy="11" r="7"></circle>
								<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
							</svg>
						</InputGroup.Text>
						<FormControl
							placeholder="Search candidate"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</InputGroup>
				</div>

				<Table hover responsive className="align-middle table-row-dashed fs-6 gy-5">
					<thead>
						<tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
							<th style={{ width: "40px" }}>
								<Form.Check
									type="checkbox"
									checked={
										filteredCandidates.length > 0 &&
										filteredCandidates.every((cand) => selectedCandidates.has(cand.id))
									}
									onChange={toggleSelectAll}
								/>
							</th>
							<th className="min-w-200px">Candidate</th>
							<th>Interview Score</th>
							<th>Status</th>
							<th>Last Interviewed</th>
							<th style={{ width: "100px" }}>Actions</th>
						</tr>
					</thead>
					<tbody>
						{filteredCandidates.map(({ id, name, email, phoneNumber, score, status, lastInterviewed, interviewId }) => (
							<tr key={id}>
								<td>
									<Form.Check
										type="checkbox"
										checked={selectedCandidates.has(id)}
										onChange={() => toggleCandidateSelection(id)}
									/>
								</td>
								<td>
									<div className="d-flex align-items-center">
										<div className="symbol symbol-circle symbol-40px me-3 bg-light-primary text-primary fw-bold">
											{getInitials(name)}
										</div>
										<div>
											<Link to={`/jobs/interview/${interviewId}`} className="fw-bold text-gray-800 text-hover-primary fs-6">
												{name}
											</Link>

											<br />
											<span className="text-muted fs-7">{email}</span>
										</div>
									</div>
								</td>
								<td>{score}</td>
								<td>
									<span className={getStatusBadgeClass(status)}>{status}</span>
								</td>
								<td>
									<span className="text-muted fs-7">{timeAgo(lastInterviewed)}</span>
								</td>
								<td>
									<Dropdown>
										<Dropdown.Toggle
											variant="light"
											className="btn btn-sm btn-light btn-active-light-primary"
										>
											Actions
										</Dropdown.Toggle>
										<Dropdown.Menu>
											<Dropdown.Item onClick={() => alert(`Email: ${email}\nPhone: ${phoneNumber || "N/A"}`)}>
												View Contact
											</Dropdown.Item>
											<Dropdown.Item
												onClick={() => updateStatus(id, "Selected")}
												disabled={status === "Selected" || updatingId === id}
											>
												Mark as Selected
											</Dropdown.Item>
											<Dropdown.Item
												onClick={() => updateStatus(id, "Rejected")}
												disabled={status === "Rejected" || updatingId === id}
											>
												Mark as Rejected
											</Dropdown.Item>
											<Dropdown.Item
												onClick={() => updateStatus(id, "Screened")}
												disabled={status === "Screened" || updatingId === id}
											>
												Mark as Screened
											</Dropdown.Item>
										</Dropdown.Menu>
									</Dropdown>
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			</KTCardBody>
		</KTCard>
	);
};

export default JobScreen;
