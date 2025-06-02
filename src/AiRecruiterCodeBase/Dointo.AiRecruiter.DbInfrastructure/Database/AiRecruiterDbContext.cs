using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Domain.ValueObjects;
using Humanizer;
using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Security.Claims;

namespace Dointo.AiRecruiter.DbInfrastructure.Database;

public class AiRecruiterDbContext(DbContextOptions<AiRecruiterDbContext> options, IMongoDatabase mongoDatabase) : DbContext(options)
{
	private const string SYSTEM_USER = "System";
	private readonly IMongoDatabase _mongoDatabase = mongoDatabase;
	// Define DbSets as MongoDB collections
	public DbSet<Job> Jobs { get; set; } = null!;
	public DbSet<Skill> Skills { get; set; } = null!;
	public DbSet<Candidate> Candidates { get; set; } = null!;
	public DbSet<Interview> Interviews { get; set; } = null!;

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		base.OnModelCreating(modelBuilder);
		modelBuilder.Entity<Job>(entity =>
		{
			entity.SetupBaseEntity( );
			entity.Property(e => e.Title).IsRequired( );
			entity.Property(e => e.JobDescription).IsRequired( );
			entity.Property(e => e.Status).HasConversion(x => x.Humanize( ), y => Enum.Parse<JobStatus>(y));
			entity.OwnsMany(e => e.AdditionalQuestions, a =>
			{
				a.WithOwner( );
				a.HasKey(q => q.Id);
				a.Property(q => q.Id).HasConversion<ObjectId>( ).HasValueGenerator<BsonIdValueGenerator>( ).ValueGeneratedOnAdd( );
				a.Ignore(q => q.LastUpdated);
			});
		});
		modelBuilder.Entity<Candidate>(entity => entity.SetupBaseEntity( ));
		modelBuilder.Entity<Interview>(entity => entity.SetupBaseEntity( ));
		modelBuilder.Entity<Skill>(entity =>
		{
			entity.Property(e => e.Name).IsRequired( );
			entity.SetupBaseEntity( );
		});
	}

	public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
	{
		Database.AutoTransactionBehavior = AutoTransactionBehavior.Never;
		foreach (var entry in ChangeTracker.Entries( ))
		{
			if (entry.State is not EntityState.Modified && entry.State is not EntityState.Added)
				continue;

			if (entry.Entity is not BaseEntity entity)
				continue;

			var exists = await EntityExistsInDatabaseAsync(entity, entry.Entity.GetType( ), cancellationToken);
			if (exists)
			{
				entry.State = EntityState.Modified;
				entry.Property(nameof(BaseEntity.CreatedAt)).IsModified = false;
				entry.Property(nameof(BaseEntity.CreatedBy)).IsModified = false;
				entity.UpdatedAt = DateTime.UtcNow;
				entity.UpdatedBy = string.IsNullOrEmpty(entity.UpdatedBy) ? SYSTEM_USER : entity.UpdatedBy;
			}
			else
			{
				entry.State = EntityState.Added;
				if (string.IsNullOrEmpty(entity.Id))
					entity.Id = ObjectId.GenerateNewId( ).ToString( );
				entity.CreatedAt = DateTime.UtcNow;
				entity.CreatedBy = string.IsNullOrEmpty(entity.CreatedBy) ? SYSTEM_USER : entity.CreatedBy;
			}
		}
		return await base.SaveChangesAsync(cancellationToken);
	}

	public async Task<int> SaveChangesAsync(ClaimsPrincipal user, CancellationToken cancellationToken = default)
	{
		foreach (var entry in ChangeTracker.Entries( ))
		{
			if (entry.Entity is BaseEntity entity)
			{
				switch (entry.State)
				{
					case EntityState.Added:
						entity.CreatedBy = user is { Identity.IsAuthenticated: true } ? user.FindFirst(ClaimTypes.NameIdentifier)?.Value! : SYSTEM_USER;
						continue;
					case EntityState.Modified:
						entity.UpdatedBy = user is { Identity.IsAuthenticated: true } ? user.FindFirst(ClaimTypes.NameIdentifier)?.Value! : SYSTEM_USER;
						continue;
					default:
						continue;
				}
			}
		}
		return await SaveChangesAsync(cancellationToken);
	}

	private async Task<bool> EntityExistsInDatabaseAsync(BaseEntity entity, Type entityType, CancellationToken cancellationToken)
	{
		var collectionName = entityType.GetCollectionName( );
		var collection = _mongoDatabase.GetCollection<BaseEntity>(collectionName);
		if (string.IsNullOrEmpty(entity.Id))
			return false;
		var filter = Builders<BaseEntity>.Filter.Eq("_id", ObjectId.Parse(entity.Id));
		var count = await collection.CountDocumentsAsync(filter, cancellationToken: cancellationToken);
		return count > 0;
	}


}
