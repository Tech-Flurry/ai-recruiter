namespace Dointo.AiRecruiter.Dtos;

public class UpdateCandidateDto
{
	public string Id { get; set; } = null!;
	public string Email { get; set; } = null!;
	public string Phone { get; set; } = null!;
	public string JobTitle { get; set; } = null!;
	public string Location { get; set; } = null!;
}
