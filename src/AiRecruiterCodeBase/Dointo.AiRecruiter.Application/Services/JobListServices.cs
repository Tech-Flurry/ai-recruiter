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
	Task<IProcessingState> DeleteAsync(string id, string ownerId);
	Task<IProcessingState> GetAsync(string ownerId, bool allowInactive = false);
	Task<IProcessingState> SaveAsync(JobPostDto jobPostDto, Owner owner, string username);
}

internal class JobPostService(
	IJobListRepository repository,
	IResolver<JobListEntity, JobPostDto> resolver
) : IJobPostService
{

	public async Task<IProcessingState> SaveAsync(JobPostDto jobPostDto, Owner owner, string username)
	{
		var JobListEntity = await repository.GetByIdAsync(jobPostDto.Id) ?? new JobListEntity( );

		
		JobListEntity = await repository.GetByIdAsync(jobPostDto.Id) ?? new JobListEntity( );
		JobListEntity.Title = jobPostDto.Title;
		JobListEntity.Status = jobPostDto.Status;
		JobListEntity.HasInterviews = jobPostDto.HasInterviews;
		JobListEntity.CreatedBy = owner.Id;
		JobListEntity.CreatedAt = jobPostDto.CreatedAt == default ? DateTime.UtcNow : jobPostDto.CreatedAt;

		var validationResult = new JobListValidator( ).Validate(JobListEntity);

		if (!validationResult.IsValid)
			return validationResult.ToValidationErrorState(nameof(JobListEntity));

		try
		{
			var savedEntity = await repository.SaveAsync(JobListEntity, username);
			await repository.CommitAsync( );
			return new SuccessState<JobListEntity>("Job post has been saved", savedEntity);
		}
		catch (Exception ex)
		{
			return new ExceptionState("An error occurred while saving the job post", ex.Message);
		}
	}

	public async Task<IProcessingState> GetAsync(string ownerId, bool allowInactive = false)
	{
		try
		{
			var jobPosts = await repository.GetByOwnerAsync(ownerId, allowInactive);
			var dtos = jobPosts.Select(resolver.Resolve).ToList( );
			return new SuccessState<List<JobPostDto>>("Job posts have been fetched", dtos);
		}
		catch (Exception ex)
		{
			return new ExceptionState("An error occurred while fetching job posts", ex.Message);
		}
	}

	public async Task<IProcessingState> DeleteAsync(string id, string ownerId)
	{
		var entity = await repository.GetByIdAsync(id);
		if (entity is null)
			return new ErrorState("Job post not found");

		// Optionally: enforce owner check
		// if (entity.CreatedBy != ownerId)
		//     return new UnauthorizedState("You are not authorized to delete this job post");

		try
		{
			entity.IsDeleted = true;
			await repository.SaveAsync(entity, ownerId);
			await repository.CommitAsync( );
			return new SuccessState("Job post has been deleted");
		}
		catch (Exception ex)
		{
			return new ExceptionState("An error occurred while deleting the job post", ex.Message);
		}
	}
}
