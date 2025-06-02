namespace Dointo.AiRecruiter.Domain.Entities;

public class AdditionalQuestion : BaseEntity
{
	public string Text { get; set; } = null!;
	public string? Answer { get; set; }
}
