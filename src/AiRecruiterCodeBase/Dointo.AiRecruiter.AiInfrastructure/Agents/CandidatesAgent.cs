using Dointo.AiRecruiter.AiInfrastructure.Config;
using Dointo.AiRecruiter.AiInfrastructure.Utils;
using Dointo.AiRecruiter.Application.AiAbstractions;
using System.Text.Json;

namespace Dointo.AiRecruiter.AiInfrastructure.Agents;

internal class CandidatesAgent(AiProviderFactory aiProviderFactory) : ICandidatesAgent
{
	private readonly AiProviderFactory _aiProviderFactory = aiProviderFactory;
	public async Task<string> GenerateCandidateSummaryAsync(string candidateJson)
	{
		var aiProvider = _aiProviderFactory.GetProvider(AiProviders.OpenAi);
		var context = "You are an intelligent assistant that helps generate a concise summary of a candidate's profile which is in json format.";
		var prompt = @$"**Candidate Profile**:{candidateJson}
**Instructions**:
- Generate a concise summary of the candidate's profile that highlights their most relevant skills and experiences for the job.
- The summary should be no longer than 200 words.
- Focus on the candidate's strengths and how they align with the job requirements.
- Your output should be a single paragraph without any additional formatting or bullet points.";
		var completion = await aiProvider.GetCompletionAsync(OpenAiModels.GPT_4O_MINI, context, prompt, JsonUtils.GetJsonSchemaOf(typeof(SummaryCompletionDto)), "string");
		return JsonSerializer.Deserialize<SummaryCompletionDto>(completion)?.Summary ?? string.Empty;
	}
	private sealed record SummaryCompletionDto(string Summary);
}
