namespace Dointo.AiRecruiter.Application.AiAbstractions;
public interface IInterviewAgent
{
	Task<string> GenerateInterviewStarter(string jobTitle, string candidateName);
}
