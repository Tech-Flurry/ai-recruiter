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
		services.AddScoped<IResolver<Job, JobListDto>, JobListDtoResolver>( );
		services.AddScoped<IResolver<Interview, CandidateListDto>, CandidateListDtoResolver>( );



		//services
		services.AddTransient<IJobPostsService, JobPostsService>( );
		services.AddTransient<ICandidateService, CandidateService>( );
	}
}
