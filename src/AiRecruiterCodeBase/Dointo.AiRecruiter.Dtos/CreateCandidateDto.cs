namespace Dointo.AiRecruiter.Dtos;
public class CreateCandidateDto
{
	public string Id { get; set; } = null!;
	public string FirstName { get; set; } = null!;
	public string LastName { get; set; } = null!;
	public DateOnly DateOfBirth { get; set; }
	public string Email { get; set; } = null!;
	public string Phone { get; set; } = null!;
	public string JobTitle { get; set; } = null!;
	public string Location { get; set; } = null!;
	public List<CredentialDto> EducationHistory { get; set; } = [ ];
	public List<CredentialDto> Certifications { get; set; } = [ ];
	public List<ExperienceDto> Experiences { get; set; } = [ ];
	public List<SkillRatingDto> SKills { get; set; } = [ ];
}


public record CredentialDto(string Certificate, string Institution, DateTime YearOfCompletion);

public record ExperienceDto(string JobTitle, string Company, string Details, DateTime StartDate, DateTime? EndDate);

public record SkillRatingDto(string Skill, int Rating);
