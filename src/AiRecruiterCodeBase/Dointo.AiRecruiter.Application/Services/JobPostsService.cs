using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.Application.Utils;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Core.Extensions;
using Dointo.AiRecruiter.Core.States;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Domain.Validators;
using Dointo.AiRecruiter.Domain.ValueObjects;
using Dointo.AiRecruiter.Dtos;
using Humanizer;

namespace Dointo.AiRecruiter.Application.Services;

public interface IJobPostsService
{
	Task<IProcessingState> DeleteAsync(string id);
	Task<IProcessingState> GetByIdAsync(string id);
	Task<IProcessingState> GetJobsListAsync( );
	Task<IProcessingState> SaveAsync(EditJobDto jobPostDto, string username);
	Task<IProcessingState> CloseMultipleJobsAsync(CloseMultipleJobsDto closeJobDto);
	Task<JobPostDto> GetJobStatusByIdAsync(string id);



}

internal class JobPostsService(IJobPostRepository repository, IResolver<Job, EditJobDto> editJobResolver, IResolver<Job, JobListDto> jobListResolver) : IJobPostsService
{
	private const string JOB_STRING = nameof(Job);
	private readonly IJobPostRepository _repository = repository;
	private readonly IResolver<Job, EditJobDto> _editJobResolver = editJobResolver;
	private readonly IResolver<Job, JobListDto> _jobListResolver = jobListResolver;
	private readonly MessageBuilder _messageBuilder = new( );

	public async Task<IProcessingState> SaveAsync(EditJobDto jobPostDto, string username)
	{
		_messageBuilder.Clear( );
		var jobPost = _editJobResolver.Resolve(jobPostDto) ?? new Job( );
		var validationResult = new JobPostValidator( ).Validate(jobPost);
		if (!validationResult.IsValid)
			return validationResult.ToValidationErrorState(nameof(Job));
		try
		{
			var savedEntity = await _repository.SaveAsync(jobPost, username);
			return new SuccessState<EditJobDto>(_messageBuilder.AddFormat(Messages.RECORD_SAVED_FORMAT).AddString(JOB_STRING).Build( ), _editJobResolver.Resolve(savedEntity));
		}
		catch (Exception ex)
		{
			return new ExceptionState(_messageBuilder.AddFormat(Messages.ERROR_OCCURRED_FORMAT).AddString(JOB_STRING).Build( ), ex.Message);
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
			dto.Posted = x.CreatedAt.Humanize( );
			return dto;
		}).ToList( );
		return new SuccessState<List<JobListDto>>("Job posts retrieved successfully", jobPostDtos);
	}

	public async Task<IProcessingState> GetByIdAsync(string id)
	{
		_messageBuilder.Clear( );
		var jobPost = await _repository.GetByIdAsync(id);
		if (jobPost is null)
			return new BusinessErrorState(RecordNotFoundMessage( ));
		var jobPostDto = _editJobResolver.Resolve(jobPost);
		return new SuccessState<EditJobDto>(_messageBuilder.AddFormat(Messages.RECORD_RETRIEVED_FORMAT).AddString(JOB_STRING).Build( ), jobPostDto);
	}

	public async Task<IProcessingState> DeleteAsync(string id)
	{
		_messageBuilder.Clear( );
		var jobPost = await _repository.GetByIdAsync(id);
		if (jobPost is null)
			return new BusinessErrorState(RecordNotFoundMessage( ));

		jobPost.IsDeleted = true;
		await _repository.SaveAsync(jobPost, string.Empty);
		return new SuccessState(_messageBuilder.AddFormat(Messages.RECORD_DELETED_FORMAT).AddString(JOB_STRING).Build( ));
	}

	public async Task<IProcessingState> CloseMultipleJobsAsync(CloseMultipleJobsDto closeJobDto)
	{
		if (closeJobDto is { JobIds.Count: 0 })
			return new BusinessErrorState(Messages.JOB_NOT_CLOSED);
		foreach (var jobId in closeJobDto.JobIds)
		{
			var job = await _repository.GetByIdAsync(jobId);
			if (job is null)
				continue;
			job.Status = JobStatus.Closed;
			job.ClosedReason = !string.IsNullOrEmpty(closeJobDto.Reason) ? closeJobDto.Reason : Messages.JOB_CLOSE_NO_REASON;
		}
		return new SuccessState(Messages.JOB_CLOSED);
	}

	private string RecordNotFoundMessage( )
	{
		_messageBuilder.Clear( );
		return _messageBuilder.AddFormat(Messages.RECORD_NOT_FOUND_FORMAT).AddString(JOB_STRING).Build( );
	}
	public async Task<JobPostDto> GetJobStatusByIdAsync(string id)
	{
		var job = await _repository.GetByIdAsync(id);
		if (job == null) return null;

		return new JobPostDto
		{
			Id = job.Id,
			JobTitle = job.Title,
			Status = job.Status.ToString( ),
			HasInterviews = job.HasInterviews ?? false,

			YearsOfExperience = job.Experience,
			JobDescription = job.JobDescription,
			RequiredSkills = job.RequiredSkills ?? new List<string>( ),
			BudgetAmount = job.Budget?.Amount ?? 0,
			BudgetCurrency = job.Budget?.CurrencySymbol ?? "USD",
			AdditionalQuestions = string.Join(", ", job.AdditionalQuestions?.Select(q => q.ToBeAsked) ?? [ ])
		};

	}



}
