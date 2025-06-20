public class Interviewee
{
    public string? JobFitAnalysis { get; set; }
    public string JobId { get; set; }
    public string CandidateId { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public int Experience { get; set; }
    public string Status { get; set; } // Added property to fix CS1061  
}
