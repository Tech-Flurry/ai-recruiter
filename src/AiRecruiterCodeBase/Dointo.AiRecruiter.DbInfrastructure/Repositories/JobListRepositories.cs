using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.Core.Extensions;
using Dointo.AiRecruiter.DbInfrastructure.Database;
using Dointo.AiRecruiter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace Dointo.AiRecruiter.DbInfrastructure.Repositories;

internal class JobListRepository(AiRecruiterDbContext dbContext)
	: RepositoryBase<JobListEntity>(dbContext), IJobListRepository
{
	public async Task<JobListEntity?> GetByIdAsync(string id) =>
		id.IsNotNullAndEmpty( ) ? await _entitySet.FindAsync(id) : null;

	public List<JobListEntity> GetByOwner(string ownerId, bool allowInactive = false)
	{
		throw new NotImplementedException( );
		//return !allowInactive 
		//    ? await QueryableEntity.Where(x => x.CreatedBy == ownerId && !x.IsDeleted).ToListAsync()
		//    : await _entitySet.Where(x => x.CreatedBy == ownerId).ToListAsync();
	}

	public async Task<JobListEntity> SaveAsync(JobListEntity entity, string username)
	{
		if (await _entitySet.AnyAsync(e => !string.IsNullOrEmpty(entity.Id) && e.Id == entity.Id))
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
	public async Task<List<JobListEntity>> GetAllAsync(bool allowInactive)
	{
		return !allowInactive
			? await _entitySet.Where(x => !x.IsDeleted).ToListAsync( )
			: await _entitySet.ToListAsync( );
	}


	Task<JobListEntity?> IJobListRepository.GetByIdAsync(string id) => throw new NotImplementedException( );
	Task<List<JobListEntity>> IJobListRepository.GetByOwnerAsync(string ownerId, bool allowInactive) => throw new NotImplementedException( );
	Task<JobListEntity> IJobListRepository.SaveAsync(JobListEntity entity, string username) => throw new NotImplementedException( );

}
