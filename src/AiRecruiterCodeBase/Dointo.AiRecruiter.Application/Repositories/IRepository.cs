namespace Dointo.AiRecruiter.Application.Repositories;
public interface IRepository
{
	Task CommitAsync(CancellationToken cancellationToken = default);
}
