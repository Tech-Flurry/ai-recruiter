using Dointo.AiRecruiter.Application.Resolvers;
using Dointo.AiRecruiter.Application.Services;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Dtos;
using Microsoft.Extensions.DependencyInjection;

namespace Dointo.AiRecruiter.Application;

public static class Setup
{
	public static void AddApplication(this IServiceCollection services)
	{
		//3rd party services

		//resolvers
		services.AddScoped<IResolver<Job, EditJobDto>, EditJobDtoResolver>( );
		services.AddScoped<IResolver<Skill, SkillDto>, SkillDtoResolver>( );

		//services
		services.AddTransient<IJobPostsService, JobPostsService>( );
	}
}
