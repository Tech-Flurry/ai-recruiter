using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.Core.Extensions;
using Dointo.AiRecruiter.Core.Utils;
using Dointo.AiRecruiter.DbInfrastructure.Database;
using Dointo.AiRecruiter.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dointo.AiRecruiter.DbInfrastructure.Repositories;
internal class DummyRepository(AiRecruiterDbContext dbContext) : RepositoryBase<DummyEntity>(dbContext), IDummyRepository
{
	public async Task<DummyEntity?> GetByIdAsync(string id) => id.IsNotNullAndEmpty( ) ? await _entitySet.FindAsync(id) : null;
	public async Task<List<DummyEntity>> GetByOwnerAsync(string ownerId, bool allowInactive = false)
	{
		throw new NotImplementedException( );
		//return !allowInactive ? await QueryableEntity.Where(x => x.Owner.Id == ownerId).ToListAsync( ) : await _entitySet.Where(x => x.Owner.Id == ownerId).ToListAsync( );
	}

	public async Task<DummyEntity> SaveAsync(DummyEntity entity, string username)
	{
		if (await _entitySet.AnyAsync(e => entity.Id != null && entity.Id != AppConstants.EMPTY_STRING && e.Id == entity.Id))
		{
			var updatedEntity = Update(entity, username);
			return updatedEntity.Entity;
		}
		else
		{
			var addedEntity = Add(entity, username);
			return addedEntity.Entity;
		}
	}
}
