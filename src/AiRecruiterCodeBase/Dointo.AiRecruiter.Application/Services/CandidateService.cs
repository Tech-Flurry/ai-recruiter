using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.Application.Resolvers;
using Dointo.AiRecruiter.Application.Utils;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Core.Extensions;
using Dointo.AiRecruiter.Core.States;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Dtos;

namespace Dointo.AiRecruiter.Application.Services;

public interface ICandidateService
{
	Task<IProcessingState> GetCandidatesByJobIdAsync(string jobId);
	Task<IProcessingState> UpdateCandidateStatusAsync(string candidateId, string newStatus);
}

internal class CandidateService(
	IReadOnlyRepository readOnlyRepository,
	IWriteOnlyRepository writeOnlyRepository,
	IResolver<Interview, CandidateListDto> resolver
) : ICandidateService
{
	private readonly IReadOnlyRepository _readOnlyRepository = readOnlyRepository;
	private readonly IWriteOnlyRepository _writeOnlyRepository = writeOnlyRepository;
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

	public async Task<IProcessingState> UpdateCandidateStatusAsync(string candidateId, string newStatus)
	{
		_messageBuilder.Clear( );

		// ✅ Update Candidate (Main source of truth for frontend)
		var candidate = _readOnlyRepository.Query<Candidate>( )
			.FirstOrDefault(c => c.Id == candidateId);

		if (candidate is null)
		{
			return new BusinessErrorState(_messageBuilder.AddString("Candidate not found.").Build( ));
		}

		candidate.Status = newStatus;
		await _writeOnlyRepository.UpdateAsync(candidate);

		// 🔄 Optional: Also update Interviewee.Status if needed
		var interview = _readOnlyRepository.Query<Interview>( )
			.FirstOrDefault(i => i.Interviewee.CandidateId == candidateId);

		if (interview is not null)
		{
			interview.Interviewee.Status = newStatus;
			await _writeOnlyRepository.UpdateAsync(interview);
		}

		return new SuccessState(
			_messageBuilder.AddString("Candidate status updated successfully.").Build( )
		);
	}
}
