using Dointo.AiRecruiter.Domain.Entities;

namespace Dointo.AiRecruiter.Domain.Aggregates;
public static class InterviewAggregateExtensions
{
	public static double GetObtainedScore(this Interview interview) => interview.Questions.Sum(s => s.ScoreObtained);
	public static double GetTotalScore(this Interview interview) => interview.Questions.Sum(s => s.TotalScore);
	public static double GetScorePercentage(this Interview interview)
	{
		var totalScore = interview.GetTotalScore( );
		var percentage = totalScore is 0 ? 0 : interview.GetObtainedScore( ) / totalScore * 100;
		return Math.Round(percentage, 2);
	}

	public static bool IsPassed(this Interview interview) => interview.AiScore >= 70;

	public static TimeSpan GetLength(this Interview interview) => interview.EndTime.HasValue
			? interview.EndTime.Value - interview.StartTime
			: DateTime.UtcNow - interview.StartTime;
}
