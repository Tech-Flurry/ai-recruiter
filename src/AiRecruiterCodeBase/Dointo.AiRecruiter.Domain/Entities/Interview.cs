namespace Dointo.AiRecruiter.Domain.Entities;
public class Interview : BaseEntity
{
	public InterviewJob Job { get; set; } = null!;
	public Interviewee Interviewee { get; set; } = null!;
	public DateTime StartTime { get; set; }
	public DateTime? EndTime { get; set; }
	public double AiScore { get; set; }
	public List<SkillRating> ScoredSkills { get; set; } = [ ];
	public List<ScoredQuestion> Questions { get; set; } = [ ];
}
