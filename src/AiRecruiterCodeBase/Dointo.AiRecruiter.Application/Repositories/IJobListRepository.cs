using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Dointo.AiRecruiter.Domain.Entities;

namespace Dointo.AiRecruiter.Application.Repositories;

public interface IJobListRepository : IRepository
{
	Task<List<JobListEntity>> GetAllAsync(bool allowInactive);
}
