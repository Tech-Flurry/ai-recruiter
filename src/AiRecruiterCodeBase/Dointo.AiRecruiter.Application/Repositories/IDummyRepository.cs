using Dointo.AiRecruiter.Domain.Entities;

namespace Dointo.AiRecruiter.Application.Repositories;
public interface IDummyRepository : IRepository
{
	Task<DummyEntity?> GetByIdAsync(string id);
	Task<List<DummyEntity>> GetByOwnerAsync(string ownerId, bool allowInactive = false);
	Task<DummyEntity> SaveAsync(DummyEntity entity, string username);
}
