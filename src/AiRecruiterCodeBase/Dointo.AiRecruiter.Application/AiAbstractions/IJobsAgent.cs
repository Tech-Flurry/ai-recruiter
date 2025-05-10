
namespace Dointo.AiRecruiter.Application.AiAbstractions;
public interface IJobsAgent
{
	Task<List<string>> ExtractSkillsAsync(string jobDescription, List<string> predefinedSkills);
}
