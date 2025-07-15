import React, { useState, useEffect } from "react";
import axios from "axios";

interface CandidateInfoProps {
	onCandidateCreated?: (candidateId: string) => void;
}
interface Credential {
	certificate: string;
	institution: string;
	yearOfCompletion: string;
}

interface Experience {
	jobTitle: string;
	company: string;
	details: string;
	startDate: string;
	endDate?: string;
}

interface SkillRating {
	skill: string;
	rating: number;
}

interface Skill {
	name: string;
}

interface Candidate {
	firstName: string;
	lastName: string;
	dateOfBirth: string;
	email: string;
	phone: string;
	jobTitle: string;
	location: string;
	educationHistory: Credential[];
	certifications: Credential[];
	experiences: Experience[];
	skills: SkillRating[];
}

const emptyCredential = (): Credential => ({
	certificate: "",
	institution: "",
	yearOfCompletion: "",
});

const emptyExperience = (): Experience => ({
	jobTitle: "",
	company: "",
	details: "",
	startDate: "",
	endDate: "",
});

const emptySkillRating = (): SkillRating => ({
	skill: "",
	rating: 5,
});

const initialCandidate: Candidate = {
	firstName: "",
	lastName: "",
	dateOfBirth: "",
	email: "",
	phone: "",
	jobTitle: "",
	location: "",
	educationHistory: [],
	certifications: [],
	experiences: [],
	skills: [],
};

const CandidateInfo: React.FC<CandidateInfoProps> = ({
	onCandidateCreated,
}) => {
	const [candidate, setCandidate] = useState<Candidate>(initialCandidate);
	const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
	const [statusMessage, setStatusMessage] = useState("");
	const [statusAlertClass, setStatusAlertClass] = useState("alert-info");
	const [isProcessing, setIsProcessing] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem('kt-auth-react-v');

		if (!token) {
			console.error("❌ Token not found.");
			setAvailableSkills([]);
			return;
		}

		axios
			.get(`${import.meta.env.VITE_APP_API_BASE_URL}/JobPosts/skills`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.then((res) => {
				setAvailableSkills(res.data.data || []);
			})
			.catch((error) => {
				console.error("❌ Failed to fetch skills:", error);
				setAvailableSkills([]);
			});
	}, []);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setCandidate((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleCredentialChange = (
		listName: "educationHistory" | "certifications",
		idx: number,
		field: keyof Credential,
		value: string
	) => {
		setCandidate((prev) => {
			const updatedList = [...prev[listName]];
			updatedList[idx] = { ...updatedList[idx], [field]: value };
			return { ...prev, [listName]: updatedList };
		});
	};

	const handleExperienceChange = (
		idx: number,
		field: keyof Experience,
		value: string
	) => {
		setCandidate((prev) => {
			const updatedList = [...prev.experiences];
			updatedList[idx] = { ...updatedList[idx], [field]: value };
			return { ...prev, experiences: updatedList };
		});
	};
	const handleSkillChange = (
		idx: number,
		field: keyof SkillRating,
		value: string | number
	) => {
		setCandidate((prev) => {
			const updatedList = [...prev.skills];
			updatedList[idx] = { ...updatedList[idx], [field]: value };
			return { ...prev, skills: updatedList };
		});
	};

	const addCredential = (listName: "educationHistory" | "certifications") => {
		setCandidate((prev) => ({
			...prev,
			[listName]: [...prev[listName], emptyCredential()],
		}));
	};

	const removeCredential = (
		listName: "educationHistory" | "certifications",
		idx: number
	) => {
		setCandidate((prev) => {
			const updatedList = [...prev[listName]];
			updatedList.splice(idx, 1);
			return { ...prev, [listName]: updatedList };
		});
	};

	const addExperience = () => {
		setCandidate((prev) => ({
			...prev,
			experiences: [...prev.experiences, emptyExperience()],
		}));
	};

	const removeExperience = (idx: number) => {
		setCandidate((prev) => {
			const updatedList = [...prev.experiences];
			updatedList.splice(idx, 1);
			return { ...prev, experiences: updatedList };
		});
	};

	const addSkill = () => {
		setCandidate((prev) => ({
			...prev,
			skills: [...prev.skills, emptySkillRating()],
		}));
	};

	const removeSkill = (idx: number) => {
		setCandidate((prev) => {
			const updatedList = [...prev.skills];
			updatedList.splice(idx, 1);
			return { ...prev, skills: updatedList };
		});
	};
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setStatusMessage("");
		setStatusAlertClass("alert-info");
		setIsProcessing(true);

		try {
			const rawToken = localStorage.getItem("kt-auth-react-v");
			if (!rawToken) throw new Error("Missing auth token");
			const tokenObj = JSON.parse(rawToken);
			if (!tokenObj.api_token) throw new Error("Invalid auth token");

			// 📡 Submit API request
			const response = await axios.post(
				`${import.meta.env.VITE_APP_API_BASE_URL}/interviews/create-candidate`,
				{ ...candidate, id: "" },
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${tokenObj.api_token}`,
					},
				}
			);

			const result = response.data;
			if (result.success) {
				if (onCandidateCreated && result.data?.id) {
					onCandidateCreated(result.data.id);
				}
				setStatusMessage(result.message);
				setStatusAlertClass("alert-success");
				setCandidate(initialCandidate);
			} else if (result.errors) {
				setStatusMessage(
					result.message +
						"\n" +
						result.errors
							.map((e: any) => `${e.propertyName}: ${e.errorMessage}`)
							.join("\n")
				);
				setStatusAlertClass("alert-warning");
			} else if (result.exceptionMessage) {
				setStatusMessage(result.message + "\n" + result.exceptionMessage);
				setStatusAlertClass("alert-danger");
			} else {
				setStatusMessage("Unknown response from server.");
				setStatusAlertClass("alert-danger");
			}
		} catch (ex: any) {
			setStatusMessage(
				`An error occurred: ${ex.response?.data?.message || ex.message}`
			);
			setStatusAlertClass("alert-danger");
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<div>
			<p className="fs-6 fw-semibold text-gray-600 mb-8">
				Enter all required candidate details to proceed with the interview.
			</p>

			{statusMessage && <div className={`alert ${statusAlertClass}`}>{statusMessage}</div>}
			<form onSubmit={handleSubmit}>
				<div className="mb-10">
					<label htmlFor="firstName" className="required form-label fw-semibold">
						First Name
					</label>
					<input
						type="text"
						id="firstName"
						name="firstName"
						className="form-control form-control-solid"
						placeholder="e.g. John"
						value={candidate.firstName}
						onChange={handleChange}
						required
					/>
					<div className="form-text text-muted">Enter your given name as it appears on official documents.</div>
				</div>

				<div className="mb-10">
					<label htmlFor="lastName" className="required form-label fw-semibold">
						Last Name
					</label>
					<input
						type="text"
						id="lastName"
						name="lastName"
						value={candidate.lastName}
						onChange={handleChange}
						className="form-control form-control-solid"
						placeholder="e.g. Smith"
						required
					/>
					<div className="form-text text-muted">Enter your surname as it appears on official documents.</div>
				</div>

				<div className="mb-10">
					<label htmlFor="dateOfBirth" className="required form-label fw-semibold">
						Date of Birth
					</label>
					<input
						type="date"
						id="dateOfBirth"
						name="dateOfBirth"
						value={candidate.dateOfBirth}
						onChange={handleChange}
						className="form-control form-control-solid"
						required
					/>
					<div className="form-text text-muted">
						Please select a valid date of birth 
					</div>
				</div>


				<div className="mb-10">
					<label htmlFor="email" className="required form-label fw-semibold">
						Email Address
					</label>
					<input
						type="email"
						id="email"
						name="email"
						value={candidate.email}
						onChange={handleChange}
						className="form-control form-control-solid"
						placeholder="e.g. johndoe@example.com"
						required
					/>
					<div className="form-text text-muted">We'll never share your email with anyone else.</div>
				</div>

				<div className="mb-10">
					<label htmlFor="phone" className="form-label fw-semibold">
						Phone Number
					</label>
					<input
						type="tel"
						id="phone"
						name="phone"
						value={candidate.phone}
						onChange={handleChange}
						className="form-control form-control-solid"
						placeholder="e.g. +92 300 1234567"
						pattern="^\+?[0-9\s\-]{7,15}$"
						maxLength={15}
					/>
					<div className="form-text text-muted">
						Include country code (e.g. +92 for Pakistan)
					</div>
				</div>

				<div className="mb-10">
					<label htmlFor="location" className="form-label fw-semibold">
						Location
					</label>
					<input
						type="text"
						id="location"
						name="location"
						value={candidate.location}
						onChange={handleChange}
						className="form-control form-control-solid"
						placeholder="e.g. New York, NY"
					/>
					<div className="form-text text-muted">
						Enter the candidate's current city or work location
					</div>
				</div>

				<div className="mb-10">
					<label htmlFor="jobTitle" className="form-label fw-semibold">
						Job Title
					</label>
					<input
						type="text"
						id="jobTitle"
						name="jobTitle"
						value={candidate.jobTitle}
						onChange={handleChange}
						className="form-control form-control-solid"
						placeholder="e.g. Frontend Developer"
					/>
					<div className="form-text text-muted">
						Specify the role the candidate is applying for
					</div>
				</div>


				<div className="mb-10">
					<div className="d-flex justify-content-between align-items-center mb-3">
						<label className="required form-label mb-0">Education History</label>
						<button
							type="button"
							className="btn btn-sm btn-light-primary"
							onClick={() => addCredential('educationHistory')}
						>
							+ Add
						</button>
					</div>

					{candidate.educationHistory.map((edu, idx) => (
						<div className="card mb-4 p-4" key={idx}>
							<div className="row g-3 align-items-end">
								<div className="col-md-4">
									<label className="form-label">Degree</label>
									<input
										type="text"
										className="form-control form-control-solid"
										placeholder="e.g. BSc Computer Science"
										value={edu.certificate}
										onChange={(e) =>
											handleCredentialChange('educationHistory', idx, 'certificate', e.target.value)
										}
									/>
								</div>
								<div className="col-md-4">
									<label className="form-label">Institution</label>
									<input
										type="text"
										className="form-control form-control-solid"
										placeholder="e.g. Harvard University"
										value={edu.institution}
										onChange={(e) =>
											handleCredentialChange('educationHistory', idx, 'institution', e.target.value)
										}
									/>
								</div>
								<div className="col-md-3">
									<label className="form-label">Year of Completion</label>
									<input
										type="date"
										className="form-control form-control-solid"
										value={edu.yearOfCompletion}
										onChange={(e) =>
											handleCredentialChange('educationHistory', idx, 'yearOfCompletion', e.target.value)
										}
									/>
								</div>
								<div className="col-md-1 text-end">
									<button
										type="button"
										className="btn btn-sm btn-icon btn-light-danger"
										onClick={() => removeCredential('educationHistory', idx)}
									>
										<i className="bi bi-trash"></i>
									</button>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Certifications */}
				<div className="mb-10">
					<div className="d-flex justify-content-between align-items-center mb-3">
						<label className="form-label fw-bold mb-0">Certifications</label>
						<button
							type="button"
							className="btn btn-sm btn-light-primary"
							onClick={() => addCredential('certifications')}
						>
							+ Add Certification
						</button>
					</div>

					{candidate.certifications.map((cert, idx) => (
						<div key={idx} className="bg-white p-4 rounded mb-3 border shadow-sm">
							<div className="row g-3 align-items-center">
								<div className="col-md-4">
									<label className="form-label">Certificate</label>
									<input
										type="text"
										className="form-control form-control-solid"
										placeholder="e.g. AWS Certified"
										value={cert.certificate}
										onChange={(e) =>
											handleCredentialChange('certifications', idx, 'certificate', e.target.value)
										}
									/>
								</div>
								<div className="col-md-4">
									<label className="form-label">Institution</label>
									<input
										type="text"
										className="form-control form-control-solid"
										placeholder="e.g. Amazon Web Services"
										value={cert.institution}
										onChange={(e) =>
											handleCredentialChange('certifications', idx, 'institution', e.target.value)
										}
									/>
								</div>
								<div className="col-md-3">
									<label className="form-label">Year of Completion</label>
									<input
										type="date"
										className="form-control form-control-solid"
										value={cert.yearOfCompletion}
										onChange={(e) =>
											handleCredentialChange('certifications', idx, 'yearOfCompletion', e.target.value)
										}
									/>
								</div>
								<div className="col-md-1 text-end mt-4">
									<button
										type="button"
										className="btn btn-sm btn-icon btn-light-danger"
										onClick={() => removeCredential('certifications', idx)}
									>
										<i className="bi bi-trash"></i>
									</button>
								</div>
							</div>
						</div>
					))}
				</div>


				{/* Experiences */}
				<div className="mb-10">
					<div className="d-flex justify-content-between align-items-center mb-3">
						<label className="form-label fw-bold mb-0">Experiences</label>
						<button
							type="button"
							className="btn btn-sm btn-light-primary"
							onClick={addExperience}
						>
							+ Add Experience
						</button>
					</div>

					{candidate.experiences.map((exp, idx) => (
						<div key={idx} className="bg-white p-4 rounded mb-3 border shadow-sm">
							<div className="row g-3 align-items-center">
								<div className="col-md-3">
									<label className="form-label">Job Title</label>
									<input
										type="text"
										className="form-control form-control-solid"
										placeholder="e.g. Frontend Developer"
										value={exp.jobTitle}
										onChange={(e) =>
											handleExperienceChange(idx, "jobTitle", e.target.value)
										}
									/>
								</div>
								<div className="col-md-3">
									<label className="form-label">Company</label>
									<input
										type="text"
										className="form-control form-control-solid"
										placeholder="e.g. Google"
										value={exp.company}
										onChange={(e) =>
											handleExperienceChange(idx, "company", e.target.value)
										}
									/>
								</div>
								<div className="col-md-3">
									<label className="form-label">Details</label>
									<input
										type="text"
										className="form-control form-control-solid"
										placeholder="e.g. Worked on UI features"
										value={exp.details}
										onChange={(e) =>
											handleExperienceChange(idx, "details", e.target.value)
										}
									/>
								</div>
								<div className="col-md-1">
									<label className="form-label">Start</label>
									<input
										type="date"
										className="form-control form-control-solid"
										value={exp.startDate}
										onChange={(e) =>
											handleExperienceChange(idx, "startDate", e.target.value)
										}
									/>
								</div>
								<div className="col-md-1">
									<label className="form-label">End</label>
									<input
										type="date"
										className="form-control form-control-solid"
										value={exp.endDate}
										onChange={(e) =>
											handleExperienceChange(idx, "endDate", e.target.value)
										}
									/>
								</div>
								<div className="col-md-1 text-end mt-4">
									<button
										type="button"
										className="btn btn-sm btn-icon btn-light-danger"
										onClick={() => removeExperience(idx)}
									>
										<i className="bi bi-trash"></i>
									</button>
								</div>
							</div>
						</div>
					))}
				</div>


				{/* Skills */}
				<div className="mb-10">
					<div className="d-flex justify-content-between align-items-center mb-3">
						<label className="form-label fw-bold mb-0">Skills</label>
						<button type="button" className="btn btn-sm btn-light-primary" onClick={addSkill}>
							+ Add Skill
						</button>
					</div>

					{candidate.skills.map((skill, idx) => (
						<div key={idx} className="bg-white p-4 rounded mb-3 border shadow-sm">
							<div className="row g-3 align-items-center">
								<div className="col-md-8">
									<label className="form-label">Skill</label>
									<select
										className="form-select form-select-solid"
										value={skill.skill}
										onChange={(e) =>
											handleSkillChange(idx, "skill", e.target.value)
										}
									>
										<option value="">Select skill</option>
										{availableSkills.map((s) => (
											<option key={s.name} value={s.name}>
												{s.name}
											</option>
										))}
									</select>
								</div>
								<div className="col-md-3">
									<label className="form-label">Proficiency</label>
									<select
										className="form-select form-select-solid"
										value={skill.rating}
										onChange={(e) =>
											handleSkillChange(idx, "rating", Number(e.target.value))
										}
									>
										{[1, 2, 3, 4, 5].map((r) => (
											<option key={r} value={r}>
												{r}
											</option>
										))}
									</select>
								</div>
								<div className="col-md-1 text-end mt-4">
									<button
										type="button"
										className="btn btn-sm btn-icon btn-light-danger"
										onClick={() => removeSkill(idx)}
									>
										<i className="bi bi-trash"></i>
									</button>
								</div>
							</div>
						</div>
					))}
				</div>

				<button
					type="submit"
					className="btn btn-primary"
					disabled={isProcessing}
				>
					{isProcessing ? (
						<>
							<span
								className="spinner-border spinner-border-sm me-2"
								role="status"
								aria-hidden="true"
							></span>
							Submitting...
						</>
					) : (
						"Start Interview"
					)}
				</button>
			</form>
		</div>
	);
};

export default CandidateInfo;
