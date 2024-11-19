using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.Core.Extensions;
using Dointo.AiRecruiter.Core.Utils;
using Dointo.AiRecruiter.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using MongoDB.Bson;

namespace Dointo.AiRecruiter.DbInfrastructure.Repositories;
public abstract class RepositoryBase<T>(DbContext dbContext) : IRepository where T : BaseEntity
{
	private const string ANONYMOUS = "anonymous";
	protected readonly DbSet<T> _entitySet = dbContext.Set<T>( );
	protected IQueryable<T> QueryableEntity => _entitySet.Where(x => !x.IsDeleted);
	public EntityEntry<T> Add(T entity, string username = AppConstants.EMPTY_STRING)
	{
		entity.Id = entity.Id.IsNullOrEmpty( ) ? ObjectId.GenerateNewId( ).ToString( ) : entity.Id;
		entity.CreatedBy = username ?? ANONYMOUS;
		entity.CreatedAt = DateTime.UtcNow;
		return _entitySet.Add(entity);
	}

	public EntityEntry<T> Update(T entity, string username = AppConstants.EMPTY_STRING)
	{
		entity.UpdatedBy = username ?? ANONYMOUS;
		entity.UpdatedAt = DateTime.UtcNow;
		return _entitySet.Update(entity);
	}

	public EntityEntry<T> Remove(T entity) => _entitySet.Remove(entity);
	public virtual Task CommitAsync(CancellationToken cancellationToken = default) => dbContext.SaveChangesAsync(cancellationToken);
}
