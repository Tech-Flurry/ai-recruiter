using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.DbInfrastructure.Database;
using Dointo.AiRecruiter.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dointo.AiRecruiter.DbInfrastructure.Repositories;

internal class PerformanceSummaryRepository : IPerformanceSummaryRepository
{
	private readonly AiRecruiterDbContext _dbContext;
	private readonly DbSet<PerformanceSummary> _dbSet;

	public PerformanceSummaryRepository(AiRecruiterDbContext dbContext)
	{
		_dbContext = dbContext;
		_dbSet = dbContext.Set<PerformanceSummary>( );
	}

	public async Task<PerformanceSummary?> GetByOwnerIdAsync(string ownerId)
	{
		return await _dbSet.FirstOrDefaultAsync(x => x.OwnerId == ownerId);
	}

	public async Task SaveAsync(PerformanceSummary summary)
	{
		var existing = await _dbSet.FirstOrDefaultAsync(x => x.OwnerId == summary.OwnerId);
		if (existing != null)
		{
			existing.Summary = summary.Summary;
			existing.GeneratedOn = summary.GeneratedOn;
			_dbContext.Update(existing);
		}
		else
		{
			await _dbSet.AddAsync(summary);
		}

		await _dbContext.SaveChangesAsync( );
	}
}
