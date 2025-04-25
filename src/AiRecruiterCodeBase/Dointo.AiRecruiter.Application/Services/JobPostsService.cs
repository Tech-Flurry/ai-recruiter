using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Core.Extensions;
using Dointo.AiRecruiter.Core.States;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Domain.Validators;
using Dointo.AiRecruiter.Dtos;

namespace Dointo.AiRecruiter.Application.Services;

public interface IJobPostsService
{
	Task<IProcessingState> DeleteAsync(string id);
	Task<IProcessingState> GetByIdAsync(string id);
	Task<IProcessingState> GetJobsListAsync( );
	Task<IProcessingState> SaveAsync(EditJobDto jobPostDto, string username);
}

internal class JobPostsService(IJobPostRepository repository, IResolver<Job, EditJobDto> editJobResolver, IResolver<Job, JobListDto> jobListResolver) : IJobPostsService
{
	private readonly IJobPostRepository _repository = repository;
	private readonly IResolver<Job, EditJobDto> _editJobResolver = editJobResolver;
	private readonly IResolver<Job, JobListDto> _jobListResolver = jobListResolver;

	public async Task<IProcessingState> SaveAsync(EditJobDto jobPostDto, string username)
	{
		var jobPost = _editJobResolver.Resolve(jobPostDto) ?? new Job( );
		var validationResult = new JobPostValidator( ).Validate(jobPost);
		if (!validationResult.IsValid)
			return validationResult.ToValidationErrorState(nameof(Job));
		try
		{
			var savedEntity = await _repository.SaveAsync(jobPost, username);
			return new SuccessState<Job>("Job post has been saved", savedEntity);
		}
		catch (Exception ex)
		{
			return new ExceptionState("An error occurred while saving the job post", ex.Message);
		}
	}

	public async Task<IProcessingState> GetJobsListAsync( )
	{
		var jobs = await _repository.GetByOwnerAsync("system");
		var jobPostDtos = jobs.Select(x =>
		{
			var dto = _jobListResolver.Resolve(x);
			dto.IsEditable = x.Status != Domain.ValueObjects.JobStatus.Closed;
			dto.URL = $"/jobs/conduct/{x.Id}?usp=share";
			return dto;
		}).ToList( );
		return new SuccessState<List<JobListDto>>("Job posts retrieved successfully", jobPostDtos);
	}

	public async Task<IProcessingState> GetByIdAsync(string id)
	{
		var validateResult = ValidateJobPostId(id);
		if (validateResult is not null)
			return validateResult;

		var jobPost = await _repository.GetByIdAsync(id);
		if (jobPost is null)
			return new BusinessErrorState("Job post not found");
		var jobPostDto = _editJobResolver.Resolve(jobPost);
		return new SuccessState<EditJobDto>("Job post retrieved successfully", jobPostDto);
	}

	public async Task<IProcessingState> DeleteAsync(string id)
	{
		var validateResult = ValidateJobPostId(id);
		if (validateResult is not null)
			return validateResult;

		var jobPost = await _repository.GetByIdAsync(id);
		if (jobPost is null)
			return new BusinessErrorState("Job post not found");
		jobPost.IsDeleted = true;
		await _repository.SaveAsync(jobPost, string.Empty);
		return new SuccessState("Job post deleted successfully");
	}
	private static ValidationErrorState? ValidateJobPostId(string id)
	{
		if (id.IsNullOrEmpty( ))
		{
			return new ValidationErrorState("Job post ID cannot be null or empty")
			{
				Errors = [new ValidationErrorState.ValidationFailure(nameof(id), "Job post ID cannot be null or empty")]
			};
		}
		return null;
	}
}
