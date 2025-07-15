import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface CandidateInfoProps { onCandidateCreated?: (candidateId: string) => void }
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
	certificate: '',
	institution: '',
	yearOfCompletion: '',
});

const emptyExperience = (): Experience => ({
	jobTitle: '',
	company: '',
	details: '',
	startDate: '',
	endDate: '',
});

const emptySkillRating = (): SkillRating => ({
	skill: '',
	rating: 5,
});

const initialCandidate: Candidate = {
	firstName: '',
	lastName: '',
	dateOfBirth: '',
	email: '',
	phone: '',
	jobTitle: '',
	location: '',
	educationHistory: [],
	certifications: [],
	experiences: [],
	skills: [],
};

const CandidateInfo: React.FC<CandidateInfoProps> = ({ onCandidateCreated }) => {
	const [candidate, setCandidate] = useState<Candidate>(initialCandidate);
	const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
	const [statusMessage, setStatusMessage] = useState('');
	const [statusAlertClass, setStatusAlertClass] = useState('alert-info');
	const [isProcessing, setIsProcessing] = useState(false);

	useEffect(() => {
		// Load available skills from API using axios
		axios
			.get(`${import.meta.env.VITE_APP_API_BASE_URL}/JobPosts/skills`)
			.then((res) => setAvailableSkills(res.data.data || []))
			.catch(() => setAvailableSkills([]));
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setCandidate((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleCredentialChange = (
		listName: 'educationHistory' | 'certifications',
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

	const addCredential = (listName: 'educationHistory' | 'certifications') => {
		setCandidate((prev) => ({
			...prev,
			[listName]: [...prev[listName], emptyCredential()],
		}));
	};

	const removeCredential = (listName: 'educationHistory' | 'certifications', idx: number) => {
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
		e.preventDefault()
		setStatusMessage('')
		setStatusAlertClass('alert-info')
		setIsProcessing(true)

		try {
			const rawToken = localStorage.getItem('kt-auth-react-v')
			if (!rawToken) throw new Error('Missing auth token')
			const tokenObj = JSON.parse(rawToken)
			if (!tokenObj.api_token) throw new Error('Invalid auth token')
			const response = await axios.post(
				`${import.meta.env.VITE_APP_API_BASE_URL}/interviews/create-candidate`,
				{ ...candidate, id: '' },
				{
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${tokenObj}`,
					},
				}
			)

			const result = response.data
			if (result.success) {
				if (onCandidateCreated && result.data?.id) {
					onCandidateCreated(result.data.id)
				}
				setStatusMessage(result.message)
				setStatusAlertClass('alert-success')
				setCandidate(initialCandidate)
			}
			else if (result.errors) {
				setStatusMessage(
					result.message +
					'\n' +
					result.errors
						.map((e: any) => `${e.propertyName}: ${e.errorMessage}`)
						.join('\n')
				)
				setStatusAlertClass('alert-warning')
			}
			else if (result.exceptionMessage) {
				setStatusMessage(result.message + '\n' + result.exceptionMessage)
				setStatusAlertClass('alert-danger')
			}
			else {
				setStatusMessage('Unknown response from server.')
				setStatusAlertClass('alert-danger')
			}
		} catch (ex: any) {
			setStatusMessage(
				`An error occurred: ${ex.response?.data?.message || ex.message}`
			)
			setStatusAlertClass('alert-danger')
		} finally {
			setIsProcessing(false)
		}
	}


	return (
		<div>
			<h3>Create Candidate</h3>
			{statusMessage && <div className={`alert ${statusAlertClass}`}>{statusMessage}</div>}
			<form onSubmit={handleSubmit}>
				<div className="form-group">
					<label>First Name</label>
					<input
						name="firstName"
						value={candidate.firstName}
						onChange={handleChange}
						className="form-control"
						required
					/>
				</div>
				<div className="form-group">
					<label>Last Name</label>
					<input
						name="lastName"
						value={candidate.lastName}
						onChange={handleChange}
						className="form-control"
						required
					/>
				</div>
				<div className="form-group">
					<label>Date of Birth</label>
					<input
						name="dateOfBirth"
						type="date"
						value={candidate.dateOfBirth}
						onChange={handleChange}
						className="form-control"
						required
					/>
				</div>
				<div className="form-group">
					<label>Email</label>
					<input
						name="email"
						type="email"
						value={candidate.email}
						onChange={handleChange}
						className="form-control"
						required
					/>
				</div>
				<div className="form-group">
					<label>Phone</label>
					<input
						name="phone"
						value={candidate.phone}
						onChange={handleChange}
						className="form-control"
					/>
				</div>
				<div className="form-group">
					<label>Job Title</label>
					<input
						name="jobTitle"
						value={candidate.jobTitle}
						onChange={handleChange}
						className="form-control"
					/>
				</div>
				<div className="form-group">
					<label>Location</label>
					<input
						name="location"
						value={candidate.location}
						onChange={handleChange}
						className="form-control"
					/>
				</div>

				{/* Education History */}
				<div className="form-group my-2">
					<label>Education History</label>
					<button type="button" className="btn btn-secondary btn-sm mb-2" onClick={() => addCredential('educationHistory')}>
						+
					</button>
					{candidate.educationHistory.map((edu, idx) => (
						<div className="mb-2" key={idx}>
							<div className="row align-items-center">
								<div className="col-md-4">
									<input
										className="form-control"
										placeholder="Degree"
										value={edu.certificate}
										onChange={(e) => handleCredentialChange('educationHistory', idx, 'certificate', e.target.value)}
									/>
								</div>
								<div className="col-md-4">
									<input
										className="form-control"
										placeholder="Name of Institution"
										value={edu.institution}
										onChange={(e) => handleCredentialChange('educationHistory', idx, 'institution', e.target.value)}
									/>
								</div>
								<div className="col-md-3">
									<input
										className="form-control"
										type="date"
										placeholder="Completion Date"
										value={edu.yearOfCompletion}
										onChange={(e) => handleCredentialChange('educationHistory', idx, 'yearOfCompletion', e.target.value)}
									/>
								</div>
								<div className="col-md-1 text-end">
									<button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeCredential('educationHistory', idx)}>
										🗑
									</button>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Certifications */}
				<div className="form-group my-2">
					<label>Certifications</label>
					<button type="button" className="btn btn-secondary btn-sm mb-2" onClick={() => addCredential('certifications')}>
						+
					</button>
					{candidate.certifications.map((cert, idx) => (
						<div className="mb-2" key={idx}>
							<div className="row align-items-center">
								<div className="col-md-4">
									<input
										className="form-control"
										placeholder="Certificate"
										value={cert.certificate}
										onChange={(e) => handleCredentialChange('certifications', idx, 'certificate', e.target.value)}
									/>
								</div>
								<div className="col-md-4">
									<input
										className="form-control"
										placeholder="Institution"
										value={cert.institution}
										onChange={(e) => handleCredentialChange('certifications', idx, 'institution', e.target.value)}
									/>
								</div>
								<div className="col-md-3">
									<input
										className="form-control"
										type="date"
										placeholder="Year of Completion"
										value={cert.yearOfCompletion}
										onChange={(e) => handleCredentialChange('certifications', idx, 'yearOfCompletion', e.target.value)}
									/>
								</div>
								<div className="col-md-1 text-end">
									<button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeCredential('certifications', idx)}>
										🗑
									</button>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Experiences */}
				<div className="form-group my-2">
					<label>Experiences</label>
					<button type="button" className="btn btn-secondary btn-sm mb-2" onClick={addExperience}>
						+
					</button>
					{candidate.experiences.map((exp, idx) => (
						<div className="mb-2" key={idx}>
							<div className="row align-items-center">
								<div className="col-md-3">
									<input
										className="form-control"
										placeholder="Job Title"
										value={exp.jobTitle}
										onChange={(e) => handleExperienceChange(idx, 'jobTitle', e.target.value)}
									/>
								</div>
								<div className="col-md-3">
									<input
										className="form-control"
										placeholder="Company"
										value={exp.company}
										onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
									/>
								</div>
								<div className="col-md-3">
									<input
										className="form-control"
										placeholder="Details"
										value={exp.details}
										onChange={(e) => handleExperienceChange(idx, 'details', e.target.value)}
									/>
								</div>
								<div className="col-md-1">
									<input
										className="form-control"
										type="date"
										placeholder="Start Date"
										value={exp.startDate}
										onChange={(e) => handleExperienceChange(idx, 'startDate', e.target.value)}
									/>
								</div>
								<div className="col-md-1">
									<input
										className="form-control"
										type="date"
										placeholder="End Date (optional)"
										value={exp.endDate}
										onChange={(e) => handleExperienceChange(idx, 'endDate', e.target.value)}
									/>
								</div>
								<div className="col-md-1 text-end">
									<button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeExperience(idx)}>
										🗑
									</button>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Skills */}
				<div className="form-group my-2">
					<label>Skills</label>
					<button type="button" className="btn btn-secondary btn-sm mb-2" onClick={addSkill}>
						+
					</button>
					{candidate.skills.map((skill, idx) => (
						<div className="mb-2" key={idx}>
							<div className="row align-items-center">
								<div className="col-md-8">
									<select
										className="form-control"
										value={skill.skill}
										onChange={(e) => handleSkillChange(idx, 'skill', e.target.value)}
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
									<select
										className="form-control"
										value={skill.rating}
										onChange={(e) => handleSkillChange(idx, 'rating', Number(e.target.value))}
									>
										{[1, 2, 3, 4, 5].map((r) => (
											<option key={r} value={r}>
												{r}
											</option>
										))}
									</select>
								</div>
								<div className="col-md-1 text-end">
									<button type="button" className="btn btn-outline-danger btn-sm" onClick={() => removeSkill(idx)}>
										🗑
									</button>
								</div>
							</div>
						</div>
					))}
				</div>

				<button type="submit" className="btn btn-primary" disabled={isProcessing}>
					{isProcessing ? (
						<>
							<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
							Submitting...
						</>
					) : (
						'Start Interview'
					)}
				</button>
			</form>
		</div>
	);
};

export default CandidateInfo;