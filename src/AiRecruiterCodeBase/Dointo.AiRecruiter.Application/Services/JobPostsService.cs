using Dointo.AiRecruiter.Application.AiAbstractions;
using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.Application.Utils;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Core.Extensions;
using Dointo.AiRecruiter.Core.States;
using Dointo.AiRecruiter.Domain.Aggregates;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Domain.Validators;
using Dointo.AiRecruiter.Domain.ValueObjects;
using Dointo.AiRecruiter.Dtos;
using Humanizer;
using System.Security.Claims;

namespace Dointo.AiRecruiter.Application.Services;

public interface IJobPostsService
{
	Task<IProcessingState> DeleteAsync(string id);
	Task<IProcessingState> GetByIdAsync(string id);
	Task<IProcessingState> GetJobsListAsync(ClaimsPrincipal user);
	Task<IProcessingState> SaveAsync(EditJobDto jobPostDto, string username);
	Task<IProcessingState> CloseMultipleJobsAsync(CloseMultipleJobsDto closeJobDto);
	Task<IProcessingState> ExtractSkillsFromDescriptionAsync(string jobDescription);
	IProcessingState GetAllSkills( );
	Task<IProcessingState> GetAllInterviews(string jobId);

}

internal class JobPostsService(IJobPostRepository repository, IResolver<Job, EditJobDto> editJobResolver, IResolver<Job, JobListDto> jobListResolver, IReadOnlyRepository readOnlyRepository, IResolver<Skill, SkillDto> skillsResolver, IJobsAgent jobsAgent) : IJobPostsService
{
	private const string JOB_STRING = nameof(Job);
	private const string SKILL_STRING = nameof(Skill);
	private readonly IJobPostRepository _repository = repository;
	private readonly IResolver<Job, EditJobDto> _editJobResolver = editJobResolver;
	private readonly IResolver<Job, JobListDto> _jobListResolver = jobListResolver;
	private readonly IReadOnlyRepository _readOnlyRepository = readOnlyRepository;
	private readonly IResolver<Skill, SkillDto> _skillsResolver = skillsResolver;
	private readonly IJobsAgent _jobsAgent = jobsAgent;
	private readonly MessageBuilder _messageBuilder = new( );

	public async Task<IProcessingState> SaveAsync(EditJobDto jobPostDto, string username)
	{
		_messageBuilder.Clear( );
		var jobPost = _editJobResolver.Resolve(jobPostDto) ?? new Job( );
		var validationResult = new JobValidator( ).Validate(jobPost);
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

	public async Task<IProcessingState> GetJobsListAsync(ClaimsPrincipal user)
	{
		var userId = user.GetOwnerId( );
		var jobs = await _repository.GetByOwnerAsync(userId);
		var interviewsSet = _readOnlyRepository.Query<Interview>( );
		_messageBuilder.Clear( );
		var jobPostDtos = jobs.Select(x =>
		{
			var dto = _jobListResolver.Resolve(x);
			dto.IsEditable = x.Status != JobStatus.Closed;
			dto.URL = $"/jobs/conduct/{x.Id}?usp=share";
			dto.Posted = x.CreatedAt.Humanize( );
			dto.NumberOfInterviews = x.GetInterviewCount(interviewsSet);
			return dto;
		}).ToList( );
		return new SuccessState<List<JobListDto>>(_messageBuilder.AddFormat(Messages.RECORD_RETRIEVED_FORMAT).AddString(JOB_STRING).Build( ), jobPostDtos);
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

		var interviewCount = jobPost.GetInterviewCount(_readOnlyRepository.Query<Interview>( ));

		if (interviewCount > 0)
			return new BusinessErrorState(_messageBuilder.AddFormat(Messages.JOB_NOT_CLOSED_DUE_TO_INTERVIEWS).AddString(JOB_STRING).Build( ));

		jobPost.IsDeleted = true;
		await _repository.SaveAsync(jobPost, string.Empty);

		return new SuccessState(
		 _messageBuilder.AddFormat(Messages.RECORD_DELETED_FORMAT).AddString(JOB_STRING).Build( )
		);
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

	public async Task<IProcessingState> ExtractSkillsFromDescriptionAsync(string jobDescription)
	{
		_messageBuilder.Clear( );
		if (string.IsNullOrWhiteSpace(jobDescription))
		{
			return new BusinessErrorState(
				_messageBuilder
					.AddFormat(Messages.PROPERTY_REQUIRED_FORMAT)
					.AddString(nameof(jobDescription).Humanize( ))
					.Build( ));
		}

		try
		{
			var predefinedSkills = QuerySkills( )
				.Select(skillDto => skillDto.Name)
				.ToList( );
			var extractedSkills = await _jobsAgent.ExtractSkillsAsync(jobDescription, predefinedSkills);
			return new SuccessState<List<string>>(
				_messageBuilder
					.AddFormat(Messages.RECORD_RETRIEVED_FORMAT)
					.AddString("Skill")
					.Build( ),
				extractedSkills);
		}
		catch (Exception ex)
		{
			Console.WriteLine($"Error in ExtractSkillsFromDescriptionAsync: {ex.Message}");
			Console.WriteLine(ex.StackTrace);
			return new ExceptionState(
				_messageBuilder
					.AddFormat(Messages.ERROR_OCCURRED_FORMAT)
					.AddString("Skill")
					.Build( ),
				ex.Message);
		}
	}


	public IProcessingState GetAllSkills( )
	{
		var skills = QuerySkills( );
		return new SuccessState<List<SkillDto>>(_messageBuilder.AddFormat(Messages.RECORD_RETRIEVED_FORMAT).AddString(SKILL_STRING).Build( ), skills);
	}

	private List<SkillDto> QuerySkills( ) => _readOnlyRepository.Query<Skill>( )
		.Select(_skillsResolver.Resolve)
		.ToList( );

    public async Task<IProcessingState> GetAllInterviews(string jobId)
    {
        _messageBuilder.Clear();

        var jobPost = await _repository.GetByIdAsync(jobId);
        if (jobPost is null)
            return new BusinessErrorState(RecordNotFoundMessage());

        var interviews = _readOnlyRepository.Query<Interview>();
        var interviewees = jobPost.GetSortedInterviewees(interviews);
        return new SuccessState<List<Interviewee>>(
            _messageBuilder.AddFormat(Messages.RECORD_RETRIEVED_FORMAT).AddString(JOB_STRING).Build(),
            interviewees
        );
    }

	private string RecordNotFoundMessage( )
	{
		_messageBuilder.Clear( );
		return _messageBuilder.AddFormat(Messages.RECORD_NOT_FOUND_FORMAT).AddString(JOB_STRING).Build( );
	}
}
