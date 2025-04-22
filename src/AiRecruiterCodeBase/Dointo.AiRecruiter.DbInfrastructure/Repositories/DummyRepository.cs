using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.Core.Extensions;
using Dointo.AiRecruiter.Core.Utils;
using Dointo.AiRecruiter.DbInfrastructure.Database;
using Dointo.AiRecruiter.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dointo.AiRecruiter.DbInfrastructure.Repositories;

public class DummyRepository : RepositoryBase<DummyEntity>, IDummyRepository
{
	public DummyRepository(AiRecruiterDbContext dbContext) : base(dbContext) { }

	public async Task<DummyEntity?> GetByIdAsync(string id) =>
		id.IsNotNullAndEmpty( ) ? await _entitySet.FindAsync(id) : null;

	public Task<List<DummyEntity>> GetByOwnerAsync(string ownerId, bool allowInactive = false)
	{
		throw new NotImplementedException( );
	}

	public async Task<DummyEntity> SaveAsync(DummyEntity entity, string username)
	{
		if (await _entitySet.AnyAsync(e =>
			entity.Id != null && entity.Id != AppConstants.EMPTY_STRING && e.Id == entity.Id))
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
