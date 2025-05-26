namespace Dointo.AiRecruiter.Dtos;

public class JobPostDto
{
    public string Id { get; set; } = default!;
    public string JobTitle { get; set; } = default!;
    public string Status { get; set; } = default!;
    public bool HasInterviews { get; set; }

    public int YearsOfExperience { get; set; }
    public string JobDescription { get; set; } = default!;
    public List<string> RequiredSkills { get; set; } = new();
    public double BudgetAmount { get; set; }
    public string BudgetCurrency { get; set; } = "USD";
    public string AdditionalQuestions { get; set; } = "";
}


