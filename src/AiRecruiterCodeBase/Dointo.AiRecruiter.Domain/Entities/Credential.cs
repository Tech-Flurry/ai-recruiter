namespace Dointo.AiRecruiter.Domain.Entities;

public class Credential
{
	public string Certificate { get; set; } = null!;
	public string Institution { get; set; } = null!;
	public DateTime YearOfCompletion { get; set; }
}
