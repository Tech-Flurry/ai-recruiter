namespace Dointo.AiRecruiter.Dtos;

public class CandidateInterviewResultDto
{
	public double InterviewScore { get; set; }
	public bool IsPassed { get; set; }
	public int InterviewLength { get; set; }
	public List<ScoredQuestionDto> Questions { get; set; } = [ ];
}

public class ScoredQuestionDto
{
	public double Score { get; set; }
	public double Total { get; set; }
	public string Question { get; set; } = null!;
	public string Answer { get; set; } = null!;
}
