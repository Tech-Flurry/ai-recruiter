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
	const [serverErrors, setServerErrors] = useState<{ [key: string]: string }>({});
	const [isEditable, setIsEditable] = useState(true);
	const [isGenerating, setIsGenerating] = useState(false);

	const normalizeSkills = (skills: any[]): string[] =>
		skills
			.map((s) => {
				if (typeof s === "string") return s;
				if (typeof s === "object") return s.name || s.value || "";
				return "";
			})
			.filter(Boolean);

	useEffect(() => {
		const fetchSkills = async () => {
			const token = localStorage.getItem('kt-auth-react-v'); 

			if (!token) {
				console.error("❌ Token not found.");
				return;
			}

			try {
				const response = await axios.get(
					`${import.meta.env.VITE_APP_API_BASE_URL}/JobPosts/skills`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				console.log("✅ Skills API response:", response.data);

				const skills = normalizeSkills(response.data.data);

				if (tagifyRef.current) {
					if (tagifyInstanceRef.current) {
						tagifyInstanceRef.current.destroy();
					}

					tagifyInstanceRef.current = new Tagify(tagifyRef.current, {
						whitelist: skills,
						dropdown: {
							enabled: 0,
							maxItems: 100,
							closeOnSelect: false,
							highlightFirst: true,
						},
					});

					tagifyInstanceRef.current.on("focus", () => {
						tagifyInstanceRef.current.dropdown.show.call(tagifyInstanceRef.current);
					});
				}
			} catch (error) {
				console.error("❌ Failed to fetch skills:", error);
			}
		};

		fetchSkills();
	}, []);


	useEffect(() => {
		if (isEditMode && jobId) {
			const fetchJob = async () => {
				const token = localStorage.getItem('kt-auth-react-v');
				if (!token) {
					console.error("❌ Auth token not found.");
					toastr.error("You are not authenticated.");
					return;
				}

				try {
					const res = await axios.get<{ data: JobPost }>(
						`${import.meta.env.VITE_APP_API_BASE_URL}/JobPosts/${jobId}`,
						{
							headers: {
								Authorization: `Bearer ${token}`,
							},
						}
					);

					const job = res.data?.data as JobPost;

					setJobTitle(job.jobTitle || "");
					setExperience(job.yearsOfExperience?.toString() || "");
					setJobDescription(job.jobDescription || "");
					setBudget(job.budgetAmount?.toString() || "");
					setIsEditable(job.status !== "Closed" && !job.hasInterviews);

					const currencyInput = formRef.current?.elements.namedItem(
						"currency"
					) as HTMLSelectElement;
					const additionalInput = formRef.current?.elements.namedItem(
						"additionalQuestions"
					) as HTMLTextAreaElement;

					if (currencyInput) currencyInput.value = job.budgetCurrency || "USD";
					if (additionalInput) additionalInput.value = job.additionalQuestions || "";

					setTimeout(() => {
						if (tagifyInstanceRef.current && Array.isArray(job.requiredSkills)) {
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


	// *** Changed here: only update description state, no auto skill extraction ***
	const handleJobDescriptionChange = (value: string) => {
		setJobDescription(value);
	};

	// Button-triggered skill generation with full control and toastr feedback
	const handleGenerateSkillsClick = async () => {
		if (jobDescription.trim().split(/\s+/).length < 30) {
			toastr.warning("Job description must be at least 30 words to generate skills.");
			return;
		}

		const token = localStorage.getItem("kt-auth-react-v");
		if (!token) {
			toastr.error("Authentication token not found.");
			return;
		}

		setIsGenerating(true);
		try {
			const response = await axios.post(
				`${import.meta.env.VITE_APP_API_BASE_URL}/JobPosts/extract-skills`,
				{ jobDescription },
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const skillsRaw = response.data?.data;
			console.log("Extracted skills:", skillsRaw);

			if (Array.isArray(skillsRaw) && skillsRaw.length > 0) {
				const skills = normalizeSkills(skillsRaw);
				tagifyInstanceRef.current?.removeAllTags();
				tagifyInstanceRef.current?.addTags(skills.map((skill) => ({ value: skill })));
				toastr.success("Skills generated successfully!");
			} else {
				toastr.warning("No skills found from extraction.");
			}
		} catch (err) {
			console.error("❌ Failed to extract skills", err);
			toastr.error("Failed to generate skills.");
		} finally {
			setIsGenerating(false);
		}
	};


	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setJobTitleTouched(true);
		setExperienceTouched(true);
		setDescriptionTouched(true);
		setBudgetTouched(true);
		setServerErrors({});

		const requiredSkills =
			tagifyInstanceRef.current?.value.map((tag: { value: string }) => tag.value) ?? [];

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
				`Failed to ${isEditMode ? "update" : "create"} job post: ${error.response?.data?.message ?? error.message}`
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

	const getJobDescriptionWordCount = () => jobDescription.trim().split(/\s+/).length || 0;

	const getFieldClassName = (touched: boolean, isValid: boolean) =>
		touched ? (isValid ? "form-control is-valid" : "form-control is-invalid") : "form-control";

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
											placeholder="Example: Backend Developer"
											className={getFieldClassName(jobTitleTouched, jobTitle.trim().length >= 3)}
										/>
										{jobTitleTouched && jobTitle.trim().length < 3 && (
											<div className="invalid-feedback">Job Title must be at least 3 characters.</div>
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
											placeholder="e.g. 2"
											className={getFieldClassName(experienceTouched, !!experience && parseInt(experience) >= 0)}
										/>
										{experienceTouched && (!experience || parseInt(experience) < 0) && (
											<div className="invalid-feedback">Experience must be a non-negative number.</div>
										)}
									</Form.Group>
								</Col>
							</Row>

							<Form.Group className="mb-1">
								<Form.Label>
									Job Description <span className="text-danger">*</span>
								</Form.Label>
								<Form.Control
									as="textarea"
									name="jobDescription"
									value={jobDescription}
									onChange={(e) => handleJobDescriptionChange(e.target.value)}
									onBlur={() => setDescriptionTouched(true)}
									rows={4}
									placeholder="Include roles, responsibilities, and requirements"
									className={getFieldClassName(descriptionTouched, getJobDescriptionWordCount() >= 30)}
								/>
								{descriptionTouched && getJobDescriptionWordCount() < 30 && (
									<div className="invalid-feedback">
										Job Description must be at least 30 words. (Current: {getJobDescriptionWordCount()})
									</div>
								)}
							</Form.Group>

							{/* Required Skills with AI Button */}
							<Form.Group className="mb-3">
								<div className="d-flex align-items-center mb-1 gap-2">
									<Form.Label className="mb-0">
										Required Skills <span className="text-danger">*</span>
									</Form.Label>
									<Button
										variant="info"
										size="sm"
										onClick={handleGenerateSkillsClick}
										disabled={isGenerating}
										title="Generate Skills with AI"
										style={{ minWidth: "28px", height: "24px", padding: "0 4px" }}
									>
										{isGenerating ? (
											<span className="spinner-border spinner-border-sm text-primary"></span>
										) : (
											<i className="bi bi-stars"></i>
										)}
									</Button>
								</div>
								<Form.Control
									ref={tagifyRef}
									name="requiredSkills"
									placeholder="Type skills and press Enter"
									type="text"
								/>
								{serverErrors.requiredSkills && (
									<div className="invalid-feedback d-block">{serverErrors.requiredSkills}</div>
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
												placeholder="e.g. 500"
												className={getFieldClassName(budgetTouched, !!budget && parseFloat(budget) > 0)}
											/>
											{budgetTouched && (!budget || parseFloat(budget) <= 0) && (
												<div className="invalid-feedback">Budget must be greater than 0.</div>
											)}

											<Form.Select name="currency" required className="ms-2">
												<option value="USD">USD</option>
												<option value="EUR">EUR</option>
												<option value="PKR">PKR</option>
											</Form.Select>
										</div>
									</Form.Group>
								</Col>

								<Col md={6}>
									<Form.Group className="mb-3">
										<Form.Label>Additional Questions (Optional)</Form.Label>
										<Form.Control
											as="textarea"
											name="additionalQuestions"
											rows={2}
											placeholder="Screening or clarification questions"
										/>
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
										<span className="spinner-border spinner-border-sm ms-2"></span>
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
