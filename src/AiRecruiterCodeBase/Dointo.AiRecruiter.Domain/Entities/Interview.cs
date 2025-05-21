using Dointo.AiRecruiter.Domain.ValueObjects;

namespace Dointo.AiRecruiter.Domain.Entities;
public class Interview : BaseEntity
{
	public InterviewJob Job { get; set; } = null!;
	public Interviewee Interviewee { get; set; } = null!;
	public DateTime StartTime { get; set; }
	public DateTime EndTime { get; set; }
	public List<SkillRating> ScoredSkills { get; set; } = [ ];
	public List<ScoredQuestion> Questions { get; set; } = [ ];
}

public record InterviewJob(string JobId, string JobTitle);

public record Interviewee(string CandidateId, string Name, string Email, string Phone, int Experience);

public record ScoredQuestion(Question Question, double ScoreObtained, double TotalScore);
