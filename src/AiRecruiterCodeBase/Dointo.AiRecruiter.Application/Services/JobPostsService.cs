using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.Application.Utils;
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
	Task<IProcessingState> SaveAsync(EditJobDto jobPostDto, string username);
}

internal class JobPostsService(IJobPostRepository repository, IResolver<Job, EditJobDto> resolver) : IJobPostsService
{
	private const string JOB_STRING = nameof(Job);
	private readonly IJobPostRepository _repository = repository;
	private readonly IResolver<Job, EditJobDto> _resolver = resolver;
	private readonly MessageBuilder _messageBuilder = new( );

	public async Task<IProcessingState> SaveAsync(EditJobDto jobPostDto, string username)
	{
		_messageBuilder.Clear( );
		var jobPost = _resolver.Resolve(jobPostDto) ?? new Job( );
		var validationResult = new JobPostValidator( ).Validate(jobPost);
		if (!validationResult.IsValid)
			return validationResult.ToValidationErrorState(nameof(Job));
		try
		{
			var savedEntity = await _repository.SaveAsync(jobPost, username);
			return new SuccessState<EditJobDto>(_messageBuilder.AddFormat(Messages.RECORD_SAVED_FORMAT).AddString(JOB_STRING).Build( ), _resolver.Resolve(savedEntity));
		}
		catch (Exception ex)
		{
			return new ExceptionState(_messageBuilder.AddFormat(Messages.ERROR_OCCURRED_FORMAT).AddString(JOB_STRING).Build( ), ex.Message);
		}
	}

	public async Task<IProcessingState> GetByIdAsync(string id)
	{
		_messageBuilder.Clear( );
		var jobPost = await _repository.GetByIdAsync(id);
		if (jobPost is null)
			return new BusinessErrorState(RecordNotFoundMessage( ));
		var jobPostDto = _resolver.Resolve(jobPost);
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

	private string RecordNotFoundMessage( )
	{
		_messageBuilder.Clear( );
		return _messageBuilder.AddFormat(Messages.RECORD_NOT_FOUND_FORMAT).AddString(JOB_STRING).Build( );
	}
}
