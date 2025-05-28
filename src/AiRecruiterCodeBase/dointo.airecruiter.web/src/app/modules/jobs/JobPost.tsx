/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { KTCard, KTCardBody } from "../../../_metronic/helpers";
import Tagify from "@yaireo/tagify";
import "@yaireo/tagify/dist/tagify.css";
import axios from "axios";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

interface JobPost {
	id: string;
	jobTitle: string;
	yearsOfExperience: number;
	jobDescription: string;
	requiredSkills: string[];
	budgetAmount: number;
	budgetCurrency: string;
	status: "Open" | "Closed";
	hasInterviews?: boolean;
	additionalQuestions?: string;
}

interface JobPostResponse {
	success?: boolean;
	message?: string;
	errors?: { propertyName: string; errorMessage: string }[];
}
function JobPost() {
	const navigate = useNavigate();
	const location = useLocation();
	const tagifyRef = useRef<HTMLInputElement>(null);
	const tagifyInstanceRef = useRef<any>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const btnSaveRef = useRef<HTMLButtonElement>(null);

	const queryParams = new URLSearchParams(location.search);
	const jobId = queryParams.get("id");
	const isEditMode = !!jobId;

	const [jobTitle, setJobTitle] = useState("");
	const [jobTitleTouched, setJobTitleTouched] = useState(false);
	const [experienceTouched, setExperienceTouched] = useState(false);
	const [experience, setExperience] = useState("");
	const [jobDescription, setJobDescription] = useState("");
	const [descriptionTouched, setDescriptionTouched] = useState(false);
	const [budget, setBudget] = useState("");
	const [budgetTouched, setBudgetTouched] = useState(false);
	const [serverErrors, setServerErrors] = useState<{ [key: string]: string }>(
		{}
	);
	const [isEditable, setIsEditable] = useState(true); // NEW

	useEffect(() => {
		if (tagifyRef.current) {
			tagifyInstanceRef.current = new Tagify(tagifyRef.current, {
				whitelist: [
					"JavaScript",
					"Python",
					"React",
					"Node.js",
					"Java",
					"C++",
					"Ruby",
				],
				dropdown: { enabled: 0 },
			});
		}
	}, []);

	useEffect(() => {
		if (isEditMode && jobId) {
			const fetchJob = async () => {
				try {
					const res = await axios.get<{ data: JobPost }>(
						`${import.meta.env.VITE_APP_API_BASE_URL}/JobPosts/${jobId}`,
						{ withCredentials: true }
					);

					const job = res.data?.data as JobPost;

					console.log("🟢 Full job response:", job);

					// Set form fields
					setJobTitle(job.jobTitle || "");
					setExperience(job.yearsOfExperience?.toString() || "");
					setJobDescription(job.jobDescription || "");
					setBudget(job.budgetAmount?.toString() || "");

					// Set editable status
					setIsEditable(job.status !== "Closed" && !job.hasInterviews);

					// Set currency and additional questions
					const currencyInput = formRef.current?.elements.namedItem(
						"currency"
					) as HTMLSelectElement;
					const additionalInput = formRef.current?.elements.namedItem(
						"additionalQuestions"
					) as HTMLTextAreaElement;
					if (currencyInput) currencyInput.value = job.budgetCurrency || "USD";
					if (additionalInput)
						additionalInput.value = job.additionalQuestions || "";

					// Set skills
					setTimeout(() => {
						if (
							tagifyInstanceRef.current &&
							Array.isArray(job.requiredSkills)
						) {
							tagifyInstanceRef.current.removeAllTags();
							tagifyInstanceRef.current.addTags(
								job.requiredSkills.map((skill: string) => ({ value: skill }))
							);
						}
					}, 300);
				} catch (err) {
					console.error("❌ Failed to load job post for edit:", err);
					toastr.error("Unable to load job post.");
				}
			};

			fetchJob();
		}
	}, [isEditMode, jobId]);




	const handleJobDescriptionChange = async (value: string) => {
		setJobDescription(value);
		const wordCount = value.trim().split(/\s+/).length;

		if (wordCount >= 30) {
			try {
				const response = await axios.post(
					`${import.meta.env.VITE_APP_API_BASE_URL}/JobPosts/extract-skills`,
					{ jobDescription: value },
					{
						headers: { "Content-Type": "application/json" },
						withCredentials: true,
					}
				);

				const skills = response.data as string[];
				if (Array.isArray(skills)) {
					tagifyInstanceRef.current?.removeAllTags();
					tagifyInstanceRef.current?.addTags(
						skills.map((skill) => ({ value: skill }))
					);
				}
			} catch (err) {
				console.error("❌ Failed to extract skills", err);
			}
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setJobTitleTouched(true);
		setExperienceTouched(true);
		setDescriptionTouched(true);
		setBudgetTouched(true);

		// Clear previous server errors
		setServerErrors({});

		const requiredSkills = (tagifyInstanceRef.current?.value ?? []).map(
			(tag: any) => tag.value
		);

		if (
			jobTitle.trim().length < 3 ||
			!experience ||
			parseInt(experience) < 0 ||
			jobDescription.trim().split(/\s+/).length < 30 ||
			requiredSkills.length === 0 ||
			!budget ||
			parseFloat(budget) <= 0
		) {
			return;
		}

		const formData = new FormData(e.currentTarget);
		const budgetCurrency = formData.get("currency") as string;
		const additionalQuestions = formData.get("additionalQuestions") as string;

		const payload = {
			id: jobId ?? "",
			jobTitle: jobTitle.trim(),
			yearsOfExperience: parseInt(experience),
			jobDescription: jobDescription.trim(),
			requiredSkills: requiredSkills,
			additionalQuestions: additionalQuestions,
			budgetAmount: parseFloat(budget),
			budgetCurrency: budgetCurrency,
		};

		try {
			btnSaveRef.current?.setAttribute("data-kt-indicator", "on");
			btnSaveRef.current?.classList.add("disabled");
			btnSaveRef.current?.setAttribute("disabled", "disabled");
			const response = await axios.post(
				`${import.meta.env.VITE_APP_API_BASE_URL}/JobPosts`,
				payload,
				{
					headers: { "Content-Type": "application/json" },
					withCredentials: true,
				}
			);
			const responseData = response.data as JobPostResponse;

			if (responseData.success || response.status === 200) {
				toastr.success(responseData.message || "Job post has been saved.");
				navigate("/jobs/list");
			} else {
				toastr.error(`Failed to create job post: ${responseData.message}`);
				if (responseData.errors) {
					const errors: { [key: string]: string } = {};
					responseData.errors.forEach((err: { propertyName: string; errorMessage: string }) => {
						errors[err.propertyName] = err.errorMessage;
					});
					setServerErrors(errors);
				}
			}
		} catch (error: any) {
			toastr.error(
				`Failed to ${isEditMode ? "update" : "create"} job post: ${error.response?.data?.message ?? error.message
				}`
			);
		} finally {
			btnSaveRef.current?.removeAttribute("data-kt-indicator");
			btnSaveRef.current?.classList.remove("disabled");
			btnSaveRef.current?.removeAttribute("disabled");
		}
	};

	const handleReset = () => {
		setJobTitle("");
		setJobTitleTouched(false);
		setExperience("");
		setExperienceTouched(false);
		setJobDescription("");
		setDescriptionTouched(false);
		setBudget("");
		setBudgetTouched(false);
		tagifyInstanceRef.current?.removeAllTags();
		formRef.current?.reset();
	};

	const getJobDescriptionWordCount = () => {
		return jobDescription.trim()
			? jobDescription.trim().split(/\s+/).length
			: 0;
	};
	function getJobTitleClassName() {
		if (jobTitleTouched) {
			if (jobTitle.trim().length >= 3) {
				return "form-control is-valid";
			} else {
				return "form-control is-invalid";
			}
		} else {
			return "form-control";
		}
	}

	function getExperienceClassName() {
		if (experienceTouched) {
			if (experience && parseInt(experience) >= 0) {
				return "form-control is-valid";
			} else {
				return "form-control is-invalid";
			}
		} else {
			return "form-control";
		}
	}

	function getDescriptionClassName() {
		if (descriptionTouched) {
			if (getJobDescriptionWordCount() >= 30) {
				return "form-control is-valid";
			} else {
				return "form-control is-invalid";
			}
		} else {
			return "form-control";
		}
	}
	function getBudgetClassName() {
		if (budgetTouched) {
			if (budget && parseFloat(budget) > 0) {
				return "form-control is-valid";
			} else {
				return "form-control is-invalid";
			}
		} else {
			return "form-control";
		}
	}

	return (
		<Container className="d-flex justify-content-center my-5">
			<div style={{ maxWidth: "900px", width: "100%" }}>
				<KTCard className="rounded shadow">
					<KTCardBody>
						<Form ref={formRef} onSubmit={handleSubmit}>
							<Row>
								<Col md={6}>
									<Form.Group className="mb-3">
										<Form.Label>
											Job Title <span className="text-danger">*</span>
										</Form.Label>
										<Form.Control
											type="text"
											name="jobTitle"
											value={jobTitle}
											onChange={(e) => setJobTitle(e.target.value)}
											onBlur={() => setJobTitleTouched(true)}
											placeholder="Example: Senior Software Engineer"
											className={getJobTitleClassName()}
										/>
										{jobTitleTouched && jobTitle.trim().length < 3 && (
											<div className="invalid-feedback">
												Job Title must be at least 3 characters.
											</div>
										)}
										{serverErrors.Title && (
											<div className="invalid-feedback">
												{serverErrors.Title}
											</div>
										)}
									</Form.Group>
								</Col>

								<Col md={6}>
									<Form.Group className="mb-3">
										<Form.Label>
											Years of Experience <span className="text-danger">*</span>
										</Form.Label>
										<Form.Control
											type="number"
											name="yearsOfExperience"
											value={experience}
											onChange={(e) => setExperience(e.target.value)}
											onBlur={() => setExperienceTouched(true)}
											placeholder="Enter experience in years"
											className={getExperienceClassName()}
										/>
										{experienceTouched &&
											(!experience || parseInt(experience) < 0) && (
												<div className="invalid-feedback">
													Experience must be a non-negative number.
												</div>
											)}
										{serverErrors["Experience"] && (
											<div className="invalid-feedback">
												{serverErrors["Experience"]}
											</div>
										)}
									</Form.Group>
								</Col>

							</Row>

							<Form.Group className="mb-3">
								<Form.Label>
									Job Description <span className="text-danger">*</span>
								</Form.Label>
								<Form.Control
									as="textarea"
									name="jobDescription"
									value={jobDescription}
									onChange={(e) => setJobDescription(e.target.value)}
									onBlur={() => setDescriptionTouched(true)}
									rows={4}
									placeholder="Describe key responsibilities and requirements"
									className={getDescriptionClassName()}
								/>
								{descriptionTouched && getJobDescriptionWordCount() < 30 && (
									<div className="invalid-feedback">
										Job Description must have at least 30 words. (Current:{" "}
										{getJobDescriptionWordCount()} words)
									</div>
								)}
								{serverErrors.JobDescription && (
									<div className="invalid-feedback">
										{serverErrors.JobDescription}
									</div>
								)}
							</Form.Group>

							<Form.Group className="mb-3">
								<Form.Label>
									Required Skills <span className="text-danger">*</span>
								</Form.Label>
								<Form.Control
									ref={tagifyRef}
									name="requiredSkills"
									placeholder="Type skills and press Enter (e.g., React, Node.js)"
								/>
								{serverErrors.RequiredSkills && (
									<div className="invalid-feedback">
										{serverErrors.RequiredSkills}
									</div>
								)}
							</Form.Group>

							<Row>
								<Col md={6}>
									<Form.Group className="mb-3">
										<Form.Label>
											Hiring Budget <span className="text-danger">*</span>
										</Form.Label>
										<div className="d-flex">
											<Form.Control
												type="number"
												name="budget"
												value={budget}
												onChange={(e) => setBudget(e.target.value)}
												onBlur={() => setBudgetTouched(true)}
												placeholder="Enter budget amount"
												className={getBudgetClassName()}
											/>
											<Form.Select name="currency" required className="ms-2">
												<option value="USD">USD</option>
												<option value="EUR">EUR</option>
												<option value="GBP">GBP</option>
											</Form.Select>
										</div>
										{budgetTouched && (!budget || parseFloat(budget) <= 0) && (
											<div className="invalid-feedback">
												Budget must be greater than 0.
											</div>
										)}
										{serverErrors.Budget && (
											<div className="invalid-feedback">
												{serverErrors.Budget}
											</div>
										)}
									</Form.Group>
								</Col>

								<Col md={6}>
									<Form.Group className="mb-3">
										<Form.Label>Additional Questions (Optional)</Form.Label>
										<Form.Control
											as="textarea"
											name="additionalQuestions"
											placeholder="Enter any screening questions"
											rows={2}
										/>
										{serverErrors.AdditionalQuestions && (
											<div className="invalid-feedback">
												{serverErrors.AdditionalQuestions}
											</div>
										)}
									</Form.Group>
								</Col>
							</Row>
							<div className="d-flex justify-content-end mt-4 gap-3">
								<Button
									ref={btnSaveRef}
									type="submit"
									variant="primary"
									disabled={!isEditable}
									title={
										!isEditable
											? "Editing is disabled for closed job or one with interviews"
											: ""
									}
								>
									<span className="indicator-label">Save</span>
									<span className="indicator-progress">
										Saving...
										<span className="spinner-border spinner-border-sm ms-2 align-middle"></span>
									</span>
								</Button>

								<Button
									type="button"
									variant="secondary"
									onClick={handleReset}
									disabled={!isEditable}
									title={
										!isEditable
											? "Reset disabled because job is closed or has interviews"
											: ""
									}
								>
									Reset
								</Button>

								<Button
									type="button"
									variant="dark"
									onClick={() => navigate("/jobs/list")}
								>
									Cancel
								</Button>
							</div>

							{!isEditable && (
								<div className="text-danger fw-semibold mt-3">
									This job post is either closed or already has interviews. You
									cannot edit it.
								</div>
							)}
						</Form>
					</KTCardBody>
				</KTCard>
			</div>
		</Container>
	);
}

export default JobPost;
