using Dointo.AiRecruiter.Domain.Entities;
using Humanizer;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MongoDB.Bson;
using MongoDB.EntityFrameworkCore.Extensions;

namespace Dointo.AiRecruiter.DbInfrastructure.Database;
public static class DbContextExtensions
{
	public static EntityTypeBuilder<T> ToCollection<T>(this EntityTypeBuilder<T> builder) where T : class => builder.ToCollection(typeof(T).GetCollectionName( ));
	public static string GetCollectionName(this Type entityType) => entityType.Name.ToLower( ).Pluralize( );
	public static EntityTypeBuilder<T> SetupBaseEntity<T>(this EntityTypeBuilder<T> builder) where T : BaseEntity
	{
		builder.ToCollection( );
		builder.HasKey(e => e.Id);
		builder.Property(e => e.Id).HasConversion<ObjectId>( ).HasValueGenerator<BsonIdValueGenerator>( ).ValueGeneratedOnAdd( );
		builder.Ignore(e => e.LastUpdated);
		return builder;
	}
}
