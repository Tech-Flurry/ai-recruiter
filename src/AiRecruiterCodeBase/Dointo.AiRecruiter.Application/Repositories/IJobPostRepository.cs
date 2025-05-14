using Dointo.AiRecruiter.Domain.Entities;

namespace Dointo.AiRecruiter.Application.Repositories;

public interface IJobPostRepository
{
	Task<Job?> GetByIdAsync(string id);

	Task<List<Job>> GetByOwnerAsync(string ownerId, bool allowInactive = false);
	Task<Job> SaveAsync(Job entity, string username);

	Task<List<Job>> GetAllAsync( );
}
