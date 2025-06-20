using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.DbInfrastructure.Database;
using Dointo.AiRecruiter.Domain.Entities;

namespace Dointo.AiRecruiter.DbInfrastructure.Repositories;

internal class WriteOnlyRepository(AiRecruiterDbContext dbContext) : IWriteOnlyRepository
{
	public async Task AddAsync<T>(T entity) where T : BaseEntity
	{
		await dbContext.Set<T>( ).AddAsync(entity);
		await dbContext.SaveChangesAsync( );
	}

	public async Task UpdateAsync<T>(T entity) where T : BaseEntity
	{
		dbContext.Set<T>( ).Update(entity);
		await dbContext.SaveChangesAsync( );
	}

	public async Task DeleteAsync<T>(T entity) where T : BaseEntity
	{
		dbContext.Set<T>( ).Remove(entity);
		await dbContext.SaveChangesAsync( );
	}
}
