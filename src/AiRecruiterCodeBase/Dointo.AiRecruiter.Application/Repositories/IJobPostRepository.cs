using Dointo.AiRecruiter.Domain.Entities;

namespace Dointo.AiRecruiter.Application.Repositories;

public interface IJobPostRepository
{
	Task<JobPostEntity?> GetByIdAsync(string id);

	Task<List<JobPostEntity>> GetByOwnerAsync(string ownerId, bool allowInactive = false);

	Task<JobPostEntity> SaveAsync(JobPostEntity entity, string username);
}
