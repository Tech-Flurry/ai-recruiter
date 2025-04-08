using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Dointo.AiRecruiter.Domain.Entities;

namespace Dointo.AiRecruiter.Application.Repositories;

public interface IJobListRepository : IRepository
{
	Task<JobListEntity?> GetByIdAsync(string id);
	Task<List<JobListEntity>> GetByOwnerAsync(string ownerId, bool allowInactive = false);
	Task<JobListEntity> SaveAsync(JobListEntity entity, string username);
	Task<List<JobListEntity>> GetAllAsync(bool allowInactive);

}
