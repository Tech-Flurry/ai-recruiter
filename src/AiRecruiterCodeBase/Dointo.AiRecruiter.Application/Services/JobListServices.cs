using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Core.Extensions;
using Dointo.AiRecruiter.Core.States;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Domain.Validators;
using Dointo.AiRecruiter.Domain.ValueObjects;
using Dointo.AiRecruiter.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Dointo.AiRecruiter.Application.Services;

public interface IJobPostService
{
	Task<IProcessingState> GetListAsync(bool allowInactive = false);
}

internal class JobPostService(
	IJobListRepository repository,
	IResolver<JobListEntity, JobPostDto> resolver
) : IJobPostService
{
	public async Task<IProcessingState> GetListAsync(bool allowInactive = false)
	{
		try
		{
			var jobPosts = await repository.GetAllAsync(allowInactive);
			var dtos = jobPosts.Select(resolver.Resolve).ToList( );
			return new SuccessState<List<JobPostDto>>("All job posts have been fetched", dtos);
		}
		catch (Exception ex)
		{
			return new ExceptionState("An error occurred while fetching all job posts", ex.Message);
		}
	}

}
