namespace Dointo.AiRecruiter.Dtos;

public class JobListDto
{
	public string Id { get; set; } = null!;
	public string Title { get; set; } = null!;
	public string URL { get; set; } = null!;
	public bool IsEditable { get; set; }
	public int? NumberOfInterviews { get; set; } = 0;
	public string Status { get; set; } = null!;
	public string Posted { get; set; } = null!;
}
