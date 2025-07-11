using Dointo.AiRecruiter.Domain.Entities;

namespace Dointo.AiRecruiter.Application.Repositories;
public interface ICandidateRepository
{
	Task<Candidate> SaveAsync(Candidate entity, string username);
}
