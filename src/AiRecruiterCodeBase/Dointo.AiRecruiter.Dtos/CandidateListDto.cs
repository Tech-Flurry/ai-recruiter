public class CandidateListDto
{
	public string CandidateId { get; set; } = null!; // ✅ Needed for status update
	public string Name { get; set; } = null!;
	public string Email { get; set; } = null!;
	public int Score { get; set; }
	public string Status { get; set; } = null!;
	public string Phone { get; set; } = null!;
	public DateTime LastInterviewed { get; set; }
}
