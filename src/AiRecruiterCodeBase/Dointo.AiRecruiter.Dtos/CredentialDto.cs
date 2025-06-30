namespace Dointo.AiRecruiter.Dtos;

public class CredentialDto
{
	public string Certificate { get; set; } = null!;
	public string Institution { get; set; } = null!;
	public DateTime YearOfCompletion { get; set; }
}
