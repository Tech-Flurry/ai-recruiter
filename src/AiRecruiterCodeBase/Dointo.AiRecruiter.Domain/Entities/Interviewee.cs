namespace Dointo.AiRecruiter.Domain.Entities;

public class Interviewee
{
	public string? JobFitAnalysis { get; set; } = null;
	public string CandidateId { get; set; } = null!;
	public string Name { get; set; } = null!;
	public string Email { get; set; } = null!;
	public string Phone { get; set; } = null!;
	public int Experience { get; set; }
	public string? Status { get; set; }
	public string Location { get; set; } = null!;
}
