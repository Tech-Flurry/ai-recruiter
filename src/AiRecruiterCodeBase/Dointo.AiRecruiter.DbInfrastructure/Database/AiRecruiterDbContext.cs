using Dointo.AiRecruiter.Domain.Entities;
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

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		base.OnModelCreating(modelBuilder);
		modelBuilder.Entity<Job>(entity =>
		{
			entity.ToCollection( );
			entity.HasKey(e => e.Id);
			entity.Property(e => e.Id).HasConversion<ObjectId>( ).HasValueGenerator<BsonIdValueGenerator>( ).ValueGeneratedOnAdd( );
			entity.Property(e => e.Title).IsRequired( );
			entity.Property(e => e.JobDescription).IsRequired( );
			entity.Ignore(e => e.LastUpdated);
		});
	}

	public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
	{
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
