namespace Dointo.AiRecruiter.Dtos;

public class EditJobDto
{
	public string Id { get; set; } = null!;
	public string JobTitle { get; set; } = null!;
	public int YearsOfExperience { get; set; }
	public string JobDescription { get; set; } = null!;
	public List<string> RequiredSkills { get; set; } = [ ];
	public string? AdditionalQuestions { get; set; }
	public double? BudgetAmount { get; set; }
	public string? BudgetCurrency { get; set; }
}
