namespace Dointo.AiRecruiter.RestApi;

public class JobList
{
	public string? Id { get; set; }
	public string? Title { get; set; }
	public DateTime CreatedAt { get; set; }
	public string? Status { get; set; } // "open" or "closed"
	public bool HasInterviews { get; set; }
}
