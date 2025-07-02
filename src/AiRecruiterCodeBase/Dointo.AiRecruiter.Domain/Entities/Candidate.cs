using Dointo.AiRecruiter.Domain.ValueObjects;

namespace Dointo.AiRecruiter.Domain.Entities;

public class Candidate : BaseEntity
{
	public FullName Name { get; set; } = null!;
	public string Email { get; set; } = null!;
	public string Phone { get; set; } = null!;
	public string JobTitle { get; set; } = null!;
	public string Location { get; set; } = null!;
	public int Score { get; set; } = 0;
	public DateTime LastInterviewed { get; set; }

	public List<Credential> EducationHistory { get; set; } = new( );
	public List<Credential> Certifications { get; set; } = new( );
	public List<Experience> Experiences { get; set; } = new( );
	public List<SkillRating> SKills { get; set; } = new( );
}
