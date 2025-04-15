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

internal class JobListRepository(AiRecruiterDbContext dbContext): RepositoryBase<JobListEntity>(dbContext), IJobListRepository
{
	public async Task<List<JobListEntity>> GetAllAsync(bool allowInactive)
	{
		return !allowInactive
			? await _entitySet.Where(x => !x.IsDeleted).ToListAsync( )
			: await _entitySet.ToListAsync( );
	}
}
