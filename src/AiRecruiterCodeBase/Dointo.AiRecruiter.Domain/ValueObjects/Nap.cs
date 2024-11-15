using System.ComponentModel.DataAnnotations.Schema;

namespace Dointo.AiRecruiter.Domain.ValueObjects;
public class Name
{
	public string FirstName { get; set; } = null!;
	public string LastName { get; set; } = null!;
	[NotMapped]
	public string FullName => $"{FirstName} {LastName}";
}
