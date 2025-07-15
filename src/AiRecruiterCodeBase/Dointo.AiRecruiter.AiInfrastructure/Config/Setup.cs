using Dointo.AiRecruiter.AiInfrastructure.Agents;
using Dointo.AiRecruiter.Application.AiAbstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Dointo.AiRecruiter.AiInfrastructure.Config;

public static class Setup
{
	public const string AI_DETECTOR = "AiDetectorClient";
	public static void AddAiInfrastructure(this IServiceCollection services, string aiDetectorUrl, params string[ ] aiProviderConfigs)
	{
		//injections
		services.AddSingleton(sp =>
		{
			var aiProviderFactory = new AiProviderFactory( );
			foreach (var configSectionName in aiProviderConfigs)
			{
				var configSection = sp.GetRequiredService<IConfiguration>( ).GetSection(configSectionName);
				var config = configSection.Get<AiConfig>( ) ?? throw new InvalidOperationException($"Configuration for '{configSectionName}' is missing or invalid.");
				aiProviderFactory.AddAiProvider(Enum.Parse<AiProviders>(configSectionName), config);
			}
			return aiProviderFactory;
		});
		services.AddHttpClient(AI_DETECTOR, client => client.BaseAddress = new Uri(aiDetectorUrl));
		//agents  
		services.AddTransient<IJobsAgent, JobsAgent>( );
		services.AddTransient<ICandidatesAgent, CandidatesAgent>( );
		services.AddSingleton<IInterviewAgent, InterviewAgent>( );
	}
}
