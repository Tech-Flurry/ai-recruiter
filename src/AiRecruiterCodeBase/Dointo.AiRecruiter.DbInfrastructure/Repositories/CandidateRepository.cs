using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.DbInfrastructure.Database;
using Dointo.AiRecruiter.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dointo.AiRecruiter.DbInfrastructure.Repositories;
internal class CandidateRepository(AiRecruiterDbContext dbContext) : RepositoryBase<Candidate>(dbContext), ICandidateRepository
{
	public async Task<Candidate> SaveAsync(Candidate entity, string username)
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
