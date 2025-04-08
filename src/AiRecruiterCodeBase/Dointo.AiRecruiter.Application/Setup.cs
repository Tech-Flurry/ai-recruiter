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
		services.AddScoped<IResolver<DummyEntity, DummyDto>, DummyDtoResolver>( );

		//services
		services.AddTransient<IDummyService, DummyService>( );

		services.AddTransient<IJobPostService, JobPostService>( );
	}
}
