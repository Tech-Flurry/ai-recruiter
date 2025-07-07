using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Domain.ValueObjects;

namespace Dointo.AiRecruiter.Application.Repositories;
public interface IInterviewsRepository
{
	Task<Interview> CreateInterviewAsync(Job job, Candidate candidate);
	Task<Interview> AddQuestionAsync(Question question, string interviewId, double score, double outOf);
	Task<Interview?> GetInterviewResultByInterviewIdAsync(string interviewId);
	Task<List<Interview>> GetByCandidateIdAsync(string candidateId);

}
