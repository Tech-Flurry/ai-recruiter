using Dointo.AiRecruiter.Domain.Entities;

namespace Dointo.AiRecruiter.Application.Repositories;

public interface IJobPostRepository
{
	Task<JobPost?> GetByIdAsync(string id);

	Task<List<JobPost>> GetByOwnerAsync(string ownerId, bool allowInactive = false);

	Task<JobPost> SaveAsync(JobPost entity, string username);
}
