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


public class CredentialDto
{
	public string Certificate { get; set; } = null!;
	public string Institution { get; set; } = null!;
	public DateTime YearOfCompletion { get; set; }
}

public class ExperienceDto
{
	public string JobTitle { get; set; } = null!;
	public string Company { get; set; } = null!;
	public string Details { get; set; } = null!;
	public DateTime StartDate { get; set; }
	public DateTime? EndDate { get; set; }
}

public class SkillRatingDto
{
	public string Skill { get; set; } = null!;
	public int Rating { get; set; }
}
