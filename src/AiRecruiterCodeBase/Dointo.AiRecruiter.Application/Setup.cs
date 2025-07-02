using Dointo.AiRecruiter.Application.Resolvers;
using Dointo.AiRecruiter.Application.Services;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Domain.ValueObjects;
using Dointo.AiRecruiter.Dtos;
using Microsoft.Extensions.DependencyInjection;

namespace Dointo.AiRecruiter.Application;

public static class Setup
{
	public static void AddApplication(this IServiceCollection services)
	{
		//3rd party services

		//resolvers
		services.AddTransient<IResolver<Job, EditJobDto>, EditJobDtoResolver>( );
		services.AddTransient<IResolver<Job, JobListDto>, JobListDtoResolver>( );
		services.AddTransient<IResolver<Skill, SkillDto>, SkillDtoResolver>( );
		services.AddTransient<IResolver<Candidate, CreateCandidateDto>, CreateCandidateDtoResolver>( );
		services.AddTransient<IResolver<Interview, InterviewGeneratedDto>, InterviewGeneratedDtoResolver>( );
		services.AddTransient<IResolver<Question, QuestionDto>, QuestionDtoResolver>( );
		services.AddTransient<IResolver<Interview, CandidateInterviewResultDto>, CandidateInterviewResultDtoResolver>( );

		//services
		services.AddTransient<IJobPostsService, JobPostsService>( );
		services.AddTransient<IInterviewsService, InterviewsService>( );
	}
}
