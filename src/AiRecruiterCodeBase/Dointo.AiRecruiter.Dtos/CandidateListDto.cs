namespace Dointo.AiRecruiter.Dtos;

public class CandidateListDto
{
	public string InterviewId { get; set; } = null!;
	public string Name { get; set; } = null!;
	public string Email { get; set; } = null!;
	public int Score { get; set; }
	public string Status { get; set; } = null!;
	public string Phone { get; set; } = null!;
	public DateTime LastInterviewed { get; set; }
	public string JobTitle { get; set; } = null!;
}
