/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { KTCard, KTCardBody } from "../../../_metronic/helpers";
import Tagify from "@yaireo/tagify";
import "@yaireo/tagify/dist/tagify.css";
import axios from "axios";
import toastr from "toastr";
import "toastr/build/toastr.min.css";

function JobPost() {
	const navigate = useNavigate();
	const tagifyRef = useRef<HTMLInputElement>(null);
	const tagifyInstanceRef = useRef<any>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const btnSaveRef = useRef<HTMLButtonElement>(null);

	const [jobTitle, setJobTitle] = useState("");
	const [jobTitleTouched, setJobTitleTouched] = useState(false);

	const [experienceTouched, setExperienceTouched] = useState(false);
	const [experience, setExperience] = useState("");

	const [jobDescription, setJobDescription] = useState("");
	const [descriptionTouched, setDescriptionTouched] = useState(false);

	const [budget, setBudget] = useState("");
	const [budgetTouched, setBudgetTouched] = useState(false);
	const [serverErrors, setServerErrors] = useState<{ [key: string]: string }>({});

	// ✅ Fetch skills from API and set them in Tagify whitelist
	useEffect(() => {
		const fetchSkills = async () => {
			try {
				const response = await axios.get(`${import.meta.env.VITE_APP_API_BASE_URL}/JobPosts/skills`, {
					withCredentials: true,
				});
				const skills = response.data.map((skill: { name: string }) => skill.name);
				if (tagifyRef.current) {
					tagifyInstanceRef.current = new Tagify(tagifyRef.current, {
						whitelist: skills,
						dropdown: {
							enabled: 0,
							maxItems: 100,
							closeOnSelect: false,
							highlightFirst: true
						}
					});
					tagifyInstanceRef.current.on('focus', () => {
						tagifyInstanceRef.current.dropdown.show.call(tagifyInstanceRef.current);
					});
				}

			} catch (error) {
				console.error("❌ Failed to fetch skills:", error);
			}
		};

		fetchSkills();
	}, []);

	const handleJobDescriptionChange = async (value: string) => {
		setJobDescription(value);

		const wordCount = value.trim().split(/\s+/).length;
		if (wordCount >= 30) {
			try {
				const response = await axios.post(
					`${import.meta.env.VITE_APP_API_BASE_URL}/JobPosts/extract-skills`,
					{ jobDescription: value },
					{ headers: { "Content-Type": "application/json" }, withCredentials: true }
				);
				const skills: string[] = response.data;
				if (Array.isArray(skills)) {
					tagifyInstanceRef.current?.removeAllTags();
					tagifyInstanceRef.current?.addTags(skills);
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
			id: "",
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

			const responseData = response.data;

			if (responseData?.success) {
				toastr.success("Job post has been saved.");
				navigate("/jobs/list");
			} else {
				toastr.error(`Failed to create job post: ${responseData?.message}`);
				if (responseData?.errors) {
					const errors: { [key: string]: string } = {};
					responseData.errors.forEach((err: { propertyName: string; errorMessage: string }) => {
						errors[err.propertyName] = err.errorMessage;
					});
					setServerErrors(errors);
				}
			}
		} catch (error: any) {
			toastr.error(`Failed to create job post: ${error.response?.data?.message ?? error.message}`);
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
		<Container className="my-5 d-flex justify-content-center">
			<div style={{ maxWidth: "900px", width: "100%" }}>
				<KTCard className="rounded shadow">
					<KTCardBody>
						<Form ref={formRef} onSubmit={handleSubmit}>
							<Row>
								<Col md={6}>
									<Form.Group className="mb-3">
										<Form.Label>Job Title <span className="text-danger">*</span></Form.Label>
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
										<Form.Label>Years of Experience <span className="text-danger">*</span></Form.Label>
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

							<Form.Group className="mb-3">
								<Form.Label>Job Description <span className="text-danger">*</span></Form.Label>
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

							<Form.Group className="mb-3">
								<Form.Label>Required Skills <span className="text-danger">*</span></Form.Label>
								<Form.Control
									ref={tagifyRef}
									name="requiredSkills"
									placeholder="Type skills and press Enter"
								/>
								{serverErrors.requiredSkills && (
									<div className="invalid-feedback d-block">{serverErrors.requiredSkills}</div>
								)}

							</Form.Group>

							<Row>
								<Col md={6}>
									<Form.Group className="mb-3">
										<Form.Label>Hiring Budget <span className="text-danger">*</span></Form.Label>
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

							<div className="d-flex justify-content-end gap-3 mt-4">
								<Button ref={btnSaveRef} type="submit" variant="primary">
									<span className="indicator-label">Save</span>
									<span className="indicator-progress">
										Saving...
										<span className="spinner-border spinner-border-sm ms-2"></span>
									</span>
								</Button>
								<Button type="button" variant="secondary" onClick={handleReset}>Reset</Button>
								<Button type="button" variant="dark" onClick={() => navigate("/jobs/list")}>Cancel</Button>
							</div>
						</Form>
					</KTCardBody>
				</KTCard>
			</div>
		</Container>
	);
}

export default JobPost;
