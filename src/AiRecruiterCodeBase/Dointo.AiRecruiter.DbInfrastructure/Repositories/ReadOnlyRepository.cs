using Dointo.AiRecruiter.Application.Exceptions;
using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.DbInfrastructure.Database;
using Dointo.AiRecruiter.Domain.Entities;

namespace Dointo.AiRecruiter.DbInfrastructure.Repositories;
internal class ReadOnlyRepository(AiRecruiterDbContext dbContext) : IReadOnlyRepository
{
	public IQueryable<T> Query<T>( ) where T : BaseEntity => dbContext.Set<T>( ).Where(x => !x.IsDeleted).AsQueryable( );
	public async Task<T> FindByIdAsync<T>(string id) where T : BaseEntity => await dbContext.Set<T>( ).FindAsync(id) ?? throw new RecordNotFoundException<T>($"{nameof(id)} = {id}");
}
