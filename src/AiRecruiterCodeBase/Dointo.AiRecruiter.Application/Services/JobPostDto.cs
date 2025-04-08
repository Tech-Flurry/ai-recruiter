namespace Dointo.AiRecruiter.Application.Services;

public class JobPostDto
{
	public string Id { get; internal set; }
	public string Title { get; internal set; }
	public string Status { get; internal set; }
	public bool HasInterviews { get; internal set; }
	public DateTime CreatedAt { get; internal set; }
}
