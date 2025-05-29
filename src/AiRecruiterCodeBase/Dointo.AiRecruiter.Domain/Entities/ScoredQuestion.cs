using Dointo.AiRecruiter.Domain.ValueObjects;

namespace Dointo.AiRecruiter.Domain.Entities;

public class ScoredQuestion
{
	public Question Question { get; set; } = null!;
	public double ScoreObtained { get; set; }
	public double TotalScore { get; set; }
}
