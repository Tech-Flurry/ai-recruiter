public class JobPostDto
{
    public string? Id { get; set; }
    public string JobTitle { get; set; } = null!;
    public int YearsOfExperience { get; set; }
    public string JobDescription { get; set; } = null!;
    public List<string> RequiredSkills { get; set; } = new();
    public string? AdditionalQuestions { get; set; }

    public HiringBudgetDto? HiringBudget { get; set; }
}

public class HiringBudgetDto
{
    public double? Amount { get; set; }
    public string Currency { get; set; } = "USD";
}
