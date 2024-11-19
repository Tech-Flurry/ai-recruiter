using Dointo.AiRecruiter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;
using MongoDB.EntityFrameworkCore.Extensions;

namespace Dointo.AiRecruiter.DbInfrastructure.Database;

public class AiRecruiterDbContext(DbContextOptions<AiRecruiterDbContext> options) : DbContext(options)
{
	public DbSet<DummyEntity> DummyEntities { get; set; } = null!;

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		var workspace = modelBuilder.Entity<DummyEntity>( );
		workspace.ToCollection("entities");
		workspace.HasKey(w => w.Id);
		workspace.Property(w => w.Id).HasConversion<ObjectId>( );
		workspace.Ignore(x => x.LastUpdated);
	}
}
