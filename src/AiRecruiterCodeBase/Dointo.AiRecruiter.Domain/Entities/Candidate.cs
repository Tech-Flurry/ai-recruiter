using Dointo.AiRecruiter.Domain.ValueObjects;

namespace Dointo.AiRecruiter.Domain.Entities;
public class Candidate : BaseEntity
{
	public Name Name { get; set; } = null!;
	public string Email { get; set; } = null!;
	public string Phone { get; set; } = null!;
	public string JobTitle { get; set; } = null!;
	public string Location { get; set; } = null!;
	public List<Credential> EducationHistory { get; set; } = [ ];
	public List<Credential> Certifications { get; set; } = [ ];
	public List<Experience> Experiences { get; set; } = [ ];
	public List<SkillRating> SKills { get; set; } = [ ];

}

public record Credential(string Certificate, string Institution, DateTime YearOfCompletion);

public record Experience(string JobTitle, string Company, string Details, DateTime StartDate, DateTime? EndDate);

public record SkillRating(string Skill, int Rating)
{
	public static implicit operator string(SkillRating skillRating) => skillRating.Skill;
	public static implicit operator SkillRating(string skill) => new(skill, 0);
	public override string ToString( ) => Skill;
}
