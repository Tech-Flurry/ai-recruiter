/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { KTCard, KTCardBody } from "../../../_metronic/helpers";
import Tagify from "@yaireo/tagify";
import "@yaireo/tagify/dist/tagify.css";
import axios from "axios";

function JobPost() {
	const navigate = useNavigate();
	const tagifyRef = useRef<HTMLInputElement>(null);
	const tagifyInstanceRef = useRef<any>(null);
	const formRef = useRef<HTMLFormElement>(null);

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
				dropdown: {
					enabled: 0,
				},
			});
		}
	}, []);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);

		const jobTitle = formData.get("jobTitle") as string;
		const yearsOfExperience = parseInt(formData.get("yearsOfExperience") as string);
		const jobDescription = (formData.get("jobDescription") as string)?.replace(/\r?\n|\r/g, " ");
		const requiredSkills =
			tagifyInstanceRef.current?.value.map((tag: { value: string }) => tag.value) || [];
		const budgetAmount = parseFloat(formData.get("budget") as string);
		const budgetCurrency = formData.get("currency") as string;
		const additionalQuestions = formData.get("additionalQuestions") as string;

		// ✅ Payload exactly matching backend DTO
		const payload = {
			id: "", // Empty id for new job
			jobTitle: jobTitle,
			yearsOfExperience: yearsOfExperience,
			jobDescription: jobDescription,
			requiredSkills: requiredSkills,
			additionalQuestions: additionalQuestions,
			budgetAmount: budgetAmount,
			budgetCurrency: budgetCurrency,
		};

		try {
			const response = await axios.post(
				"https://localhost:7072/api/JobPosts",
				payload,
				{
					headers: {
						"Content-Type": "application/json",
					},
					withCredentials: true,
				}
			);

			console.log("✅ Job post created successfully:", response.data);
			navigate("/jobs/list");
		} catch (error: any) {
			console.error("❌ Error creating job post:", error.response?.data || error.message);
			alert(`Failed to create job post: ${error.response?.data?.message || error.message}`);
		}
	};

	const handleReset = () => {
		if (tagifyInstanceRef.current) {
			tagifyInstanceRef.current.removeAllTags();
		}
		if (formRef.current) {
			formRef.current.reset();
		}
	};

	return (
		<Container className="my-5 d-flex justify-content-center">
			<div style={{ maxWidth: "900px", width: "100%" }}>
				<KTCard className="shadow rounded">
					<KTCardBody>
						<div className="d-flex align-items-center mb-4">
							<h3 className="mb-0">Creating a job posting</h3>
						</div>

						<Form ref={formRef} onSubmit={handleSubmit}>
							<Row>
								<Col md={6}>
									<Form.Group className="mb-3">
										<Form.Label>Job Title</Form.Label>
										<Form.Control
											type="text"
											name="jobTitle"
											placeholder="Example: Senior Software Engineer"
											required
										/>
									</Form.Group>
								</Col>
								<Col md={6}>
									<Form.Group className="mb-3">
										<Form.Label>Years of Experience</Form.Label>
										<Form.Control
											type="number"
											name="yearsOfExperience"
											placeholder="Enter required experience in years"
											required
										/>
									</Form.Group>
								</Col>
							</Row>

							<Form.Group className="mb-3">
								<Form.Label>Job Description</Form.Label>
								<Form.Control
									as="textarea"
									name="jobDescription"
									placeholder="Describe key responsibilities and requirements"
									rows={4}
									required
								/>
							</Form.Group>

							<Form.Group className="mb-3">
								<Form.Label>Required Skills</Form.Label>
								<Form.Control
									ref={tagifyRef}
									name="requiredSkills"
									placeholder="Type skills and press Enter (e.g., React, Node.js)"
								/>
							</Form.Group>

							<Row>
								<Col md={6}>
									<Form.Group className="mb-3">
										<Form.Label>Hiring Budget</Form.Label>
										<div className="d-flex">
											<Form.Control
												type="number"
												name="budget"
												placeholder="Enter budget amount"
												className="me-2"
												required
											/>
											<Form.Select name="currency" required>
												<option value="USD">USD</option>
												<option value="EUR">EUR</option>
												<option value="GBP">GBP</option>
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
											placeholder="Enter any screening questions"
											rows={2}
										/>
									</Form.Group>
								</Col>
							</Row>

							<div className="d-flex gap-3 mt-4 justify-content-end">
								<Button type="submit" variant="primary" className="font-weight-bold">
									Save
								</Button>
								<Button
									type="button"
									variant="secondary"
									className="font-weight-bold"
									onClick={handleReset}
								>
									Reset
								</Button>
								<Button
									type="button"
									variant="dark"
									className="font-weight-bold"
									onClick={() => navigate("/jobs/list")}
								>
									Cancel
								</Button>
							</div>
						</Form>
					</KTCardBody>
				</KTCard>
			</div>
		</Container>
	);
}

export default JobPost;
