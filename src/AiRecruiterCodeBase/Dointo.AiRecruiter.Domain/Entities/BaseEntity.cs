using System.ComponentModel.DataAnnotations.Schema;

namespace Dointo.AiRecruiter.Domain.Entities;
public abstract class BaseEntity
{
	public string Id { get; set; } = null!;
	public string CreatedBy { get; set; } = null!;
	public DateTime CreatedAt { get; set; }
	public string? UpdatedBy { get; set; } = null!;
	public DateTime? UpdatedAt { get; set; }
	public bool IsDeleted { get; set; }
	[NotMapped]
	public DateTime LastUpdated => UpdatedAt is not null && UpdatedAt > CreatedAt ? UpdatedAt.Value : CreatedAt;
}
