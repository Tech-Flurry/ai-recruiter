using Dointo.AiRecruiter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;
using MongoDB.EntityFrameworkCore.Extensions;

namespace Dointo.AiRecruiter.DbInfrastructure.Database;

public class AiRecruiterDbContext : DbContext
{
	public AiRecruiterDbContext(DbContextOptions<AiRecruiterDbContext> options)
		: base(options) { }

	// Define DbSets as MongoDB collections
	public DbSet<DummyEntity> DummyEntities { get; set; } = null!;
	public DbSet<JobPostEntity> JobPosts { get; set; } = null!;

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		base.OnModelCreating(modelBuilder);

		// ----- DummyEntity Mapping -----
		modelBuilder.Entity<DummyEntity>(entity =>
		{
			entity.ToCollection("DummyEntities"); // Maps to MongoDB collection
			entity.HasKey(e => e.Id); // Set Id as the key
			entity.Property(e => e.Id).HasConversion<ObjectId>( ); // ObjectId conversion
			entity.Ignore(e => e.LastUpdated); // Ignore non-persistent property
		});

		// ----- JobPostEntity Mapping -----
		modelBuilder.Entity<JobPostEntity>(entity =>
		{
			entity.ToCollection("JobPosts"); // Maps to MongoDB collection
			entity.HasKey(e => e.Id); // Set Id as the key
			entity.Property(e => e.Id).HasConversion<ObjectId>( ); // ObjectId conversion
			entity.Property(e => e.JobTitle).IsRequired( );
			entity.Property(e => e.CreatedBy).IsRequired( );
			entity.Property(e => e.IsDeleted); // Optional: Only if needed
		});
	}
}
