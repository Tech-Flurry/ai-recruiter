namespace Dointo.AiRecruiter.Dtos;
public class CandidateDashboardDto
{
	public string name { get; set; } = null!;
	public int TotalInterviews { get; set; }
	public double AverageScore { get; set; }
	public double PassRate { get; set; }
	public int UpcomingInterviews { get; set; }
	public List<SkillProgressDto> TopSkills { get; set; } = new( );
	public List<string> RecentActivities { get; set; } = new( );
}

public class SkillProgressDto
{
	public string Skill { get; set; } = null!;
	public int Level { get; set; }
}
