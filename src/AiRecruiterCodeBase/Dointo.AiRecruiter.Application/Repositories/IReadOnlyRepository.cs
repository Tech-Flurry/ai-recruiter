using Dointo.AiRecruiter.Domain.Entities;

namespace Dointo.AiRecruiter.Application.Repositories;
public interface IReadOnlyRepository
{
	IQueryable<T> Query<T>( ) where T : BaseEntity;
	Task<T> FindByIdAsync<T>(string id) where T : BaseEntity;
}
