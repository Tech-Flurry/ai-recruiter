using Dointo.AiRecruiter.AiInfrastructure.Agents;
using Dointo.AiRecruiter.Application.AiAbstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Dointo.AiRecruiter.AiInfrastructure.Config;

public static class Setup
{
	public static void AddAiInfrastructure(this IServiceCollection services, params string[ ] aiProviderConfigs)
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
		//agents  
		services.AddTransient<IJobsAgent, JobsAgent>( );
	}
}
