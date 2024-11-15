namespace Dointo.AiRecruiter.Domain.ValueObjects;

public class Owner
{
	public string Id { get; set; } = null!;
	public Name Name { get; set; } = null!;
	public string Email { get; set; } = null!;
}
