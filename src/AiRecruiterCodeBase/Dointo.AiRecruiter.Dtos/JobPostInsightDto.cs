namespace Dointo.AiRecruiter.Dtos;

public class JobPostInsightDto
{
	public string JobTitle { get; set; } = string.Empty;
	public int TotalInterviews { get; set; }
	public string ScreeningTimeDays { get; set; } = string.Empty;
	public string AverageInterviewDuration { get; set; } = string.Empty; // e.g., "1h 20m"
}
