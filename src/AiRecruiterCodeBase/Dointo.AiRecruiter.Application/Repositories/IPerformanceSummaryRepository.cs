using Dointo.AiRecruiter.Domain.Entities;

namespace Dointo.AiRecruiter.Application.Repositories;

public interface IPerformanceSummaryRepository
{
	Task<PerformanceSummary?> GetByOwnerIdAsync(string ownerId);
	Task SaveAsync(PerformanceSummary summary);
}
