using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.Core.Extensions;
using Dointo.AiRecruiter.DbInfrastructure.Database;
using Dointo.AiRecruiter.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dointo.AiRecruiter.DbInfrastructure.Repositories;

public class JobPostRepository : RepositoryBase<JobPost>, IJobPostRepository
{
	public JobPostRepository(AiRecruiterDbContext dbContext) : base(dbContext) { }

	public async Task<JobPost?> GetByIdAsync(string id) =>
		id.IsNotNullAndEmpty( ) ? await _entitySet.FindAsync(id) : null;

	public async Task<List<JobPost>> GetByOwnerAsync(string ownerId, bool allowInactive = false)
	{
		if (string.IsNullOrWhiteSpace(ownerId))
			return [ ];

		return !allowInactive
			? await QueryableEntity.Where(x => x.CreatedBy == ownerId && !x.IsDeleted).ToListAsync( )
			: await _entitySet.Where(x => x.CreatedBy == ownerId).ToListAsync( );
	}

	public async Task<JobPost> SaveAsync(JobPost entity, string username)
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
}
