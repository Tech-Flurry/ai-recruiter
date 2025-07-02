using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.Application.Utils;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Core.States;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Dtos;

namespace Dointo.AiRecruiter.Application.Services;

public interface ICandidateService
{
	Task<IProcessingState> GetCandidatesByJobIdAsync(string jobId);
	IProcessingState UpdateInterviewStatus(string interviewId, string newStatus);
	Task<IProcessingState> GetJobTitleByJobIdAsync(string jobId);
}

internal class CandidateService(
	IReadOnlyRepository readOnlyRepository,
	IResolver<Interview, CandidateListDto> resolver
) : ICandidateService
{
	private readonly IReadOnlyRepository _readOnlyRepository = readOnlyRepository;
	private readonly IResolver<Interview, CandidateListDto> _resolver = resolver;
	private readonly MessageBuilder _messageBuilder = new( );

	private const string CANDIDATE_STRING = nameof(Candidate);

	public Task<IProcessingState> GetCandidatesByJobIdAsync(string jobId)
	{
		_messageBuilder.Clear( );

		var interviews = _readOnlyRepository.Query<Interview>( )
			.Where(i => i.Job.JobId == jobId)
			.ToList( );

		if (!interviews.Any( ))
		{
			return Task.FromResult<IProcessingState>(
				new BusinessErrorState(_messageBuilder.AddString("No candidates found for this job.").Build( ))
			);
		}

		var candidateDtos = interviews
			.Select(_resolver.Resolve)
			.Where(dto => dto != null)
			.ToList( );

		if (!candidateDtos.Any( ))
		{
			return Task.FromResult<IProcessingState>(
				new BusinessErrorState(_messageBuilder.AddString("No candidates found for this job.").Build( ))
			);
		}

		return Task.FromResult<IProcessingState>(
			new SuccessState<List<CandidateListDto>>(
				_messageBuilder.AddFormat(Messages.RECORD_RETRIEVED_FORMAT).AddString(CANDIDATE_STRING).Build( ),
				candidateDtos
			)
		);
	}

	public IProcessingState UpdateInterviewStatus(string interviewId, string newStatus)
	{
		_messageBuilder.Clear( );

		if (string.IsNullOrWhiteSpace(interviewId))
			return new BusinessErrorState(_messageBuilder.AddString("Interview Id is required.").Build( ));

		var interview = _readOnlyRepository.Query<Interview>( )
			.FirstOrDefault(i => i.Id == interviewId);

		if (interview is null)
			return new BusinessErrorState(_messageBuilder.AddFormat(Messages.RECORD_NOT_FOUND_FORMAT).AddString(nameof(Interview)).Build( ));

		interview.Interviewee.Status = newStatus;

		return new SuccessState(
			_messageBuilder.AddString("Candidate status updated successfully.").Build( )
		);
	}
	public Task<IProcessingState> GetJobTitleByJobIdAsync(string jobId)
	{
		_messageBuilder.Clear( );

		var job = _readOnlyRepository.Query<Job>( )
			.FirstOrDefault(j => j.Id == jobId); 

		if (job is null)
		{
			return Task.FromResult<IProcessingState>(
				new BusinessErrorState(
					_messageBuilder.AddFormat(Messages.RECORD_NOT_FOUND_FORMAT).AddString(nameof(Job)).Build( )
				)
			);
		}

		return Task.FromResult<IProcessingState>(
			new SuccessState<string>(
				_messageBuilder.AddString("Job title retrieved successfully.").Build( ),
				job.Title
			)
		);
	}

}
