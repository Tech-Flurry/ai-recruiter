namespace Dointo.AiRecruiter.Dtos;

public class InterviewQuestionDto
{
	public string Question { get; set; } = null!;
	public string Answer { get; set; } = null!;
	public double ScoreObtained { get; set; }
	public double TotalScore { get; set; }
}
