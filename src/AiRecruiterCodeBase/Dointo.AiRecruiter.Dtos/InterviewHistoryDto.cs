namespace Dointo.AiRecruiter.Dtos;

public class InterviewHistoryDto
{
	public string JobTitle { get; set; } = null!;
	public double Score { get; set; }
	public string Status { get; set; } = null!;
	public string JobStatus { get; set; } = null!;
	public DateTime InterviewedAt { get; set; }
}
