using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Domain.ValueObjects;

namespace Dointo.AiRecruiter.Application.AiAbstractions;
public interface IInterviewAgent
{
	Task<string> GenerateInterviewStarter(string jobTitle, string candidateName);
	Task<string> GenerateNextQuestionAsync(Interview interview, Candidate candidate);
	Task<(string analysis, double score)> ScoreInterviewAsync(Interview interview, Job job);
	Task<(ScoredQuestion question, bool terminate)> ScoreQuestionAsync(Interview interview, Question question);
	Task<List<SkillRating>> ScoreSkillsAsync(Interview interview, List<string> requiredSkills);
}
