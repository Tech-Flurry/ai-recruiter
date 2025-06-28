

namespace Dointo.AiRecruiter.Application.AiAbstractions;
public interface ICandidatesAgent
{
	Task<string> GenerateCandidateSummaryAsync(string candidateJson);
}
