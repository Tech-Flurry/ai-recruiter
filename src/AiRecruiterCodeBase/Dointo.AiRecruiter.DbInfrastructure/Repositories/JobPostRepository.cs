using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.Core.Extensions;
using Dointo.AiRecruiter.DbInfrastructure.Database;
using Dointo.AiRecruiter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;

namespace Dointo.AiRecruiter.DbInfrastructure.Repositories;

public class JobPostRepository(AiRecruiterDbContext dbContext) : RepositoryBase<Job>(dbContext), IJobPostRepository
{
	public async Task<Job?> GetByIdAsync(string id)
	{
		if (string.IsNullOrWhiteSpace(id))
			return null;

		return await _entitySet.FirstOrDefaultAsync(x => x.Id == id);
	}


	public async Task<List<Job>> GetByOwnerAsync(string ownerId, bool allowInactive = false)
	{
		if (string.IsNullOrWhiteSpace(ownerId))
			return [ ];

		return !allowInactive
			? await QueryableEntity.Where(x => x.CreatedBy == ownerId && !x.IsDeleted).ToListAsync( )
			: await _entitySet.Where(x => x.CreatedBy == ownerId).ToListAsync( );
	}

	public async Task<Job> SaveAsync(Job entity, string username)
	{
		if (await _entitySet.AnyAsync(e =>
			!string.IsNullOrEmpty(entity.Id) &&
			e.Id == entity.Id))
		{
			var updated = Update(entity, username);
			return updated.Entity;
		}
		else
		{
			var added = Add(entity, username);
			return added.Entity;
		}
	}

	public async Task<List<Job>> GetAllAsync( )
	{
		return await QueryableEntity
			.Where(job => !job.IsDeleted)
			.ToListAsync( );
	}
}
