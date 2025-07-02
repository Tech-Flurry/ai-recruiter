namespace Dointo.AiRecruiter.Domain.Entities;

public class InterviewJob
{
	public string JobId { get; set; } = null!;
	public string JobTitle { get; set; } = null!;
	public string JobDescription { get; set; } = null!;
	public int RequiredExperience { get; set; }
	public List<string> RequiredSkills { get; set; } = [ ];
}
