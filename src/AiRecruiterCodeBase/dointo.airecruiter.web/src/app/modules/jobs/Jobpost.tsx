import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { KTCard, KTCardBody } from "../../../_metronic/helpers";
import Tagify from '@yaireo/tagify';
import "@yaireo/tagify/dist/tagify.css";

function JobPost() {
	const navigate = useNavigate();
	const tagifyRef = useRef(null);

	useEffect(() => {
		if (tagifyRef.current) {
			new Tagify(tagifyRef.current, {
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

	return (
		<>
			{/* Main container to center the "shadow box" */}
			<Container className="my-5 d-flex justify-content-center">
				{/* A wrapper div to control max width */}
				<div style={{ maxWidth: "900px", width: "100%" }}>
					{/* KTCard with shadow & rounded corners */}
					<KTCard className="shadow rounded">
						<KTCardBody>
							<div className="d-flex align-items-center mb-4">
								<h3 className="mb-0">Creating a job posting</h3>
							</div>

							<Form>
								<Row>
									<Col md={6}>
										{/* Job Title */}
										<Form.Group className="mb-3">
											<Form.Label>Job Title</Form.Label>
											<Form.Control
												type="text"
												name="jobTitle"
												placeholder="Example: Senior Software Engineer"
											/>
										</Form.Group>
									</Col>
									<Col md={6}>
										{/* Years of Experience */}
										<Form.Group className="mb-3">
											<Form.Label>Years of Experience</Form.Label>
											<Form.Control
												type="number"
												name="yearsOfExperience"
												placeholder="Enter required experience in years"
											/>
										</Form.Group>
									</Col>
								</Row>

								{/* Job Description */}
								<Form.Group className="mb-3">
									<Form.Label>Job Description</Form.Label>
									<Form.Control
										as="textarea"
										name="jobDescription"
										placeholder="Describe key responsibilities and requirements"
										rows={4}
									/>
								</Form.Group>

								{/* Skillset (Tagify Multi-Select) */}
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
										{/* Hiring Budget */}
										<Form.Group className="mb-3">
											<Form.Label>Hiring Budget</Form.Label>
											<div className="d-flex">
												<Form.Control
													type="number"
													name="budget"
													placeholder="Enter budget amount"
													className="me-2"
												/>
												<Form.Select name="currency">
													<option value="USD">USD</option>
													<option value="EUR">EUR</option>
													<option value="GBP">GBP</option>
												</Form.Select>
											</div>
										</Form.Group>
									</Col>
									<Col md={6}>
										{/* Additional Questions */}
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

								{/* Buttons */}
								<div className="d-flex gap-3 mt-4 justify-content-end">
									<a
										href="#"
										className="btn btn-light-primary font-weight-bold"
									>
										Save
									</a>

									<a
										href="#"
										className="btn btn-light-success font-weight-bold"
									>
										Reset
									</a>

									<Button
										variant="light"
										className="btn-light-dark font-weight-bold"
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
		</>
	);
}

export default JobPost;
