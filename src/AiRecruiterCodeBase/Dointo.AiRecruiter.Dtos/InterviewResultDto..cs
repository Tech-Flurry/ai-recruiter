namespace Dointo.AiRecruiter.Dtos;

public class InterviewResultDto
{
	public string InterviewId { get; set; } = null!;

	public string CandidateId { get; set; } = null!;
	public string FullName { get; set; } = null!;
	public double TotalScore { get; set; }
	public double AiScore { get; set; }
	public string Feedback { get; set; } = null!;
	public string Email { get; set; } = null!;
	public string Phone { get; set; } = null!;
	public string JobTitle { get; set; } = null!;
	public string Location { get; set; } = null!;
	public Dictionary<string, int> SkillWiseScore { get; set; } = [ ];
	public List<InterviewQuestionDto> Questions { get; set; } = [ ];
	public List<string> Violations { get; set; } = [ ];
	public List<ExperienceDto> Experience { get; set; } = [ ];
	public List<CredentialDto> Education { get; set; } = [ ];
	public List<CredentialDto> Certifications { get; set; } = [ ];
	public List<SkillRatingDto> SkillRatings { get; set; } = [ ];
}
