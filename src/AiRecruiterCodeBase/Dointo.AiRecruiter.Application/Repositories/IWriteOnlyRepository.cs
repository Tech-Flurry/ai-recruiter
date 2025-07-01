using Dointo.AiRecruiter.Domain.Entities;

namespace Dointo.AiRecruiter.Application.Repositories;

public interface IWriteOnlyRepository
{
	Task AddAsync<T>(T entity) where T : BaseEntity;
	Task DeleteAsync<T>(T entity) where T : BaseEntity;
}
