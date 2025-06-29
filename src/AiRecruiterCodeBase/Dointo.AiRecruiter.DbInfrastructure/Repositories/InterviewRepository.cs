using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.DbInfrastructure.Database;
using Dointo.AiRecruiter.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Dointo.AiRecruiter.DbInfrastructure.Repositories;

public class InterviewRepository : RepositoryBase<Interview>, IInterviewRepository
{
	private readonly AiRecruiterDbContext _dbContext;
	private readonly DbSet<Interview> _entitySet;

	public InterviewRepository(AiRecruiterDbContext dbContext) : base(dbContext)
	{
		_dbContext = dbContext;
		_entitySet = _dbContext.Set<Interview>( );
	}

	public async Task<Interview?> GetByIdAsync(string id)
	{
		return string.IsNullOrWhiteSpace(id)
			? null
			: await _entitySet
				.Include(i => i.Interviewee)
				.Include(i => i.Job)
				.FirstOrDefaultAsync(i => i.Id == id);
	}

	public async Task<List<Interview>> GetByCandidateIdAsync(string candidateId)
	{
		return string.IsNullOrWhiteSpace(candidateId)
			? new( )
			: await _entitySet
				.Where(i => i.Interviewee != null && i.Interviewee.CandidateId == candidateId)
				.Include(i => i.Job)
				.ToListAsync( );
	}

	public async Task<Interview> SaveAsync(Interview entity, string username)
	{
		var existing = await _entitySet.FirstOrDefaultAsync(i => i.Id == entity.Id);

		if (existing is not null)
		{
			entity.UpdatedBy = username;
			entity.UpdatedAt = DateTime.UtcNow;
			_dbContext.Entry(entity).State = EntityState.Modified;
		}
		else
		{
			entity.CreatedBy = username;
			entity.CreatedAt = DateTime.UtcNow;
			await _entitySet.AddAsync(entity);
		}

		await _dbContext.SaveChangesAsync( );
		return entity;
	}

	public async Task<List<Interview>> GetAllAsync( )
	{
		return await _entitySet
			.Include(i => i.Interviewee)
			.Include(i => i.Job)
			.ToListAsync( );
	}

	public async Task DeleteAsync(string id)
	{
		var entity = await _entitySet.FirstOrDefaultAsync(i => i.Id == id);
		if (entity != null)
		{
			_entitySet.Remove(entity);
			await _dbContext.SaveChangesAsync( );
		}
	}

	public async Task<Interview?> GetInterviewResultByInterviewIdAsync(string interviewId)
	{
		return  await _entitySet
			.Include(i => i.Interviewee)
			.Include(i => i.Job)
			.FirstOrDefaultAsync(i => i.Id == interviewId);
	}
}
