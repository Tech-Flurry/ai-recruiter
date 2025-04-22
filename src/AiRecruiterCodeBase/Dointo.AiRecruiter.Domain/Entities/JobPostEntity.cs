using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Dointo.AiRecruiter.Domain.Entities;

public class JobPostEntity : BaseEntity
{
	[BsonId]
	[BsonRepresentation(BsonType.ObjectId)]
	public new string Id { get; set; } = null!;

	[BsonElement("jobTitle")]
	public string JobTitle { get; set; } = null!;

	[BsonElement("yearsOfExperience")]
	public int YearsOfExperience { get; set; }

	[BsonElement("jobDescription")]
	public string JobDescription { get; set; } = null!;

	[BsonElement("requiredSkills")]
	public List<string> RequiredSkills { get; set; } = new( );

	[BsonElement("budget")]
	public HiringBudget Budget { get; set; } = new( );

	[BsonElement("additionalQuestions")]
	[BsonIgnoreIfNull]
	public string? AdditionalQuestions { get; set; }

}
public class HiringBudget
{
	[BsonElement("amount")]
	public double Amount { get; set; }

	[BsonElement("currency")]
	public string Currency { get; set; } = "USD";
}
