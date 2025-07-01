using Dointo.AiRecruiter.AiInfrastructure.Config;
using Dointo.AiRecruiter.AiInfrastructure.Utils;
using Dointo.AiRecruiter.Application.AiAbstractions;
using System.Text.Json;

namespace Dointo.AiRecruiter.AiInfrastructure.Agents;
internal class InterviewAgent(AiProviderFactory aiProviderFactory) : IInterviewAgent
{
	private readonly AiProviderFactory _aiProviderFactory = aiProviderFactory;

	public async Task<string> GenerateInterviewStarter(string jobTitle, string candidateName)
	{
		var aiProvider = _aiProviderFactory.GetProvider(AiProviders.OpenAi);
		var context = "You are a recruitment expert and taking interview of a candidate. You need to start the interview by easing the candidate and asking to introduce themselves.";
		var prompt = @$"You are hiring for the job: {jobTitle}. The name of the candidate in front of you is ""{candidateName}"". Briefly introduce yourself and let them know that you are an ai recruiter named 'Riku'. Then, ask them to intoduce themselves.
Instructions:
- Keep your tone friendly
- Don't use jargons or fluff
- Only use simple English words";
		var completion = await aiProvider.GetCompletionAsync(OpenAiModels.GPT_4_1, context, prompt, JsonUtils.GetJsonSchemaOf(typeof(QuestionCompletionDto)), "question");
		return JsonSerializer.Deserialize<QuestionCompletionDto>(completion)?.Question ?? string.Empty;
	}
	private sealed record QuestionCompletionDto(string Question);
}
