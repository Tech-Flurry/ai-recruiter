using Dointo.AiRecruiter.Domain.ValueObjects;

namespace Dointo.AiRecruiter.Domain.Entities;

public class Job : BaseEntity
{
	public string Title { get; set; } = null!;
	public int Experience { get; set; }
	public string JobDescription { get; set; } = null!;
	public List<string> RequiredSkills { get; set; } = [ ];
	public Money? Budget { get; set; }
	public JobStatus Status { get; set; } = JobStatus.Open;
	public string? ClosedReason { get; set; }
	public List<Question> AdditionalQuestions { get; set; } = null!;
}
