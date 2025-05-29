namespace Dointo.AiRecruiter.Domain.Entities;

public class Experience
{
	public string JobTitle { get; set; } = null!;
	public string Company { get; set; } = null!;
	public string Details { get; set; } = null!;
	public DateTime StartDate { get; set; }
	public DateTime? EndDate { get; set; }
}
