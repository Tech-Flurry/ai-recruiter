using Dointo.AiRecruiter.AiInfrastructure.Agents;
using Dointo.AiRecruiter.Application.AiAbstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Text.Json;

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
				var config = JsonSerializer.Deserialize<AiConfig>(configSection.Value!)!;
				aiProviderFactory.AddAiProvider(Enum.Parse<AiProviders>(configSectionName), config);
			}
			return aiProviderFactory;
		});
		//agents  
		services.AddTransient<IJobsAgent, JobsAgent>( );
	}
}
