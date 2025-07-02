namespace Dointo.AiRecruiter.Dtos;

public class CandidatePipelineMetricsDto
{
	// Weekly Applications (Candidates who applied in the last 7 days)
	public int WeeklyApplications { get; set; }

	// New Candidates (Distinct candidates added in the last 14 days)
	public int NewCandidates { get; set; }

	// Interviews Scheduled in the past 7 days
	public int InterviewsScheduled { get; set; }

	// Screened Candidates (AI score >= 7)
	public int ScreenedCandidates { get; set; }
}
