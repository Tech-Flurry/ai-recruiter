using Dointo.AiRecruiter.AiInfrastructure.Config;
using Dointo.AiRecruiter.Application.AiAbstractions;
using System.Text.Json;

namespace Dointo.AiRecruiter.AiInfrastructure.Agents;
internal class JobsAgent(AiProviderFactory aiProviderFactory) : IJobsAgent
{
	private readonly AiProviderFactory _aiProviderFactory = aiProviderFactory;

	public async Task<List<string>> ExtractSkillsAsync(string jobDescription, List<string> predefinedSkills)
	{
		var aiProvider = _aiProviderFactory.GetProvider(AiProviders.OpenAi);
		var context = "You are an intelligent assistant that helps extract relevant professional skills from job descriptions. Only return the relevant skills that match both the job description and the skills database. Do not add a single word except the provided output format.";
		var prompt = @$"You are helping a recruitment system identify the most relevant skills required for a specific job role, based on the job description provided. These skills will be used to better match candidates with job requirements.
**Available Skills (Database)**:
 {JsonSerializer.Serialize(predefinedSkills)}
(*This is a flat array of strings*)
**Job Description**:  
{jobDescription}
**Instructions**:
- Only pick skills that appear in the provided skills database.
- Match even if the job description uses similar language or synonyms (e.g., ""developing APIs"" → ""API Development"").
- Do **not** generate any new skills not in the given list.
- Your output should only be the list of matched skills in a **valid JSON string format**.";
		var format = @"```json
[""skill_1"", ""skill_2"", ""skill_3""]";
		var completion = await aiProvider.GetCompletionAsync(OpenAiModels.GPT_4_1_NANO, context, prompt, format);
		var skills = JsonSerializer.Deserialize<List<string>>(completion);
		return skills ?? [ ];
	}
}
