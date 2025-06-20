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
}

internal class CandidateService(
	IReadOnlyRepository readOnlyRepository,
	IResolver<Interview, CandidateListDto> resolver // ✅ Correct type
) : ICandidateService
{
	private readonly IReadOnlyRepository _readOnlyRepository = readOnlyRepository;
	private readonly IResolver<Interview, CandidateListDto> _resolver = resolver;
	private readonly MessageBuilder _messageBuilder = new( );

	public Task<IProcessingState> GetCandidatesByJobIdAsync(string jobId)
	{
		_messageBuilder.Clear( );

		// Step 1: Get all interviews for this job
		var interviews = _readOnlyRepository.Query<Interview>( )
			.Where(i => i.Job.JobId == jobId)
			.ToList( );

		Console.WriteLine($"[DEBUG] Found {interviews.Count} interview(s) for JobId: {jobId}");

		if (!interviews.Any( ))
		{
			return Task.FromResult<IProcessingState>(
				new BusinessErrorState(
					_messageBuilder.AddString("No candidates found for this job.").Build( )
				)
			);
		}

		// Step 2: Map to Candidate DTOs using Interview → DTO resolver
		var candidateDtos = interviews
			.Select(_resolver.Resolve)
			.Where(dto => dto != null)
			.ToList( );

		Console.WriteLine($"[DEBUG] Resolved {candidateDtos.Count} candidate DTO(s)");

		// Step 3: If no DTOs mapped, return error
		if (!candidateDtos.Any( ))
		{
			return Task.FromResult<IProcessingState>(
				new BusinessErrorState(
					_messageBuilder.AddString("No candidates found for this job.").Build( )
				)
			);
		}

		// Step 4: Return success
		return Task.FromResult<IProcessingState>(
			new SuccessState<List<CandidateListDto>>(
				_messageBuilder
					.AddFormat(Messages.RECORD_RETRIEVED_FORMAT)
					.AddString("Candidates")
					.Build( ),
				candidateDtos
			)
		);
	}
}
