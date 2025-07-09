namespace Dointo.AiRecruiter.Dtos;

public class InterviewReportDto
{
	public string JobTitle { get; set; } = null!;
	public DateTime InterviewDate { get; set; }
	public string Status { get; set; } = null!;
	public int TotalScore { get; set; }
	public string AiFeedback { get; set; } = null!;

	public List<QuestionScoreDto> QuestionScores { get; set; } = [ ];
	public List<SkillRatingDto> SkillRatings { get; set; } = [ ];
}

public class QuestionScoreDto
{
	public string Text { get; set; } = null!;	
	public int ScoreObtained { get; set; }
	public int TotalScore { get; set; }
}

public class SkillRatingDto
{
	public string Skill { get; set; } = null!;
	public double Rating { get; set; }
}
