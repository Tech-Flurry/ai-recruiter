namespace Dointo.AiRecruiter.Dtos;

public class ExperienceDto
{
	public string JobTitle { get; set; } = null!;
	public string Company { get; set; } = null!;
	public string Details { get; set; } = null!;
	public DateTime StartDate { get; set; }
	public DateTime? EndDate { get; set; }
}
