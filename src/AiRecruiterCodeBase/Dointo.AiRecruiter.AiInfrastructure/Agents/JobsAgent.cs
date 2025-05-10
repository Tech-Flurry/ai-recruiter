using Dointo.AiRecruiter.AiInfrastructure.Config;
using Dointo.AiRecruiter.Application.AiAbstractions;

namespace Dointo.AiRecruiter.AiInfrastructure.Agents;
internal class JobsAgent(AiProviderFactory aiProviderFactory) : IJobsAgent
{
	private readonly AiProviderFactory _aiProviderFactory = aiProviderFactory;

	public async Task<List<string>> ExtractSkillsAsync(string jobDescription, List<string> predefinedSkills)
	{
		var completion = await _aiProviderFactory.GetCompletionAsync(
			"gpt-3.5-turbo",
			jobDescription,
			"Extract the skills from the job description and return them as a list of strings.",
		);
	}
}
