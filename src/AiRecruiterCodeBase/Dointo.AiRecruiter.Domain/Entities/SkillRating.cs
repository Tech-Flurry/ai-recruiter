namespace Dointo.AiRecruiter.Domain.Entities;

public class SkillRating
{
	private SkillRating(string skill, int rating)
	{
		Skill = skill;
		Rating = rating;
	}

	public string Skill { get; set; }
	public int Rating { get; set; }
	public override string ToString( ) => Skill;

	public static implicit operator string(SkillRating skillRating) => skillRating.Skill;
	public static implicit operator SkillRating(string skill) => new(skill, 0);
}
