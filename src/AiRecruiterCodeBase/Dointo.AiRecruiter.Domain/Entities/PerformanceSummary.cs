namespace Dointo.AiRecruiter.Domain.Entities;
public class PerformanceSummary




	{
	public string Id { get; set; } = Guid.NewGuid( ).ToString( );

	public string OwnerId { get; set; } = null!;    
	public string Summary { get; set; } = null!;      
	public DateTime GeneratedOn { get; set; } 
	}
