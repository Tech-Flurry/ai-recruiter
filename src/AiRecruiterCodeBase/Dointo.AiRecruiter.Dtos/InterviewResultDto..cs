namespace Dointo.AiRecruiter.Dtos;

public class InterviewResultDto
{
	public string? JobId { get; set; }
	public string? FullName { get; set; }
	public int TotalScore { get; set; }
	public double? AiScore { get; set; }


	public Dictionary<string, int>? SkillWiseScore { get; set; }

	public List<InterviewQuestionDto>? Questions { get; set; }
	public List<string>? Violations { get; set; }

	public string? PersonalityAnalysis { get; set; }
	public string? SystemFeedback { get; set; }

	public List<ExperienceDto>? Experience { get; set; }
	public List<CredentialDto>? Credentials { get; set; }
	public List<SkillRatingDto>? SkillRatings { get; set; }

	public string? Name { get; set; }
	public string? Email { get; set; }
	public string? Phone { get; set; }
	public string? JobTitle { get; set; }
	public string? Location { get; set; }
}
