using Dointo.AiRecruiter.Core.States;
using Dointo.AiRecruiter.Domain.Entities;

namespace Dointo.AiRecruiter.Application.Repositories; // Corrected namespace to avoid conflict


public interface IInterviewRepository
{
    // Use the 'new' keyword to explicitly hide the inherited member
    Task<Interview?> GetByIdAsync(string id);
    Task<List<Interview>> GetByCandidateIdAsync(string candidateId);
    Task<Interview> SaveAsync(Interview entity, string username);
	Task<Interview?> GetInterviewResultByInterviewIdAsync(string interviewId);

}
