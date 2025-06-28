using Dointo.AiRecruiter.Application.AiAbstractions;
using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.Application.Utils;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Core.Extensions;
using Dointo.AiRecruiter.Core.States;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Domain.Validators;
using Dointo.AiRecruiter.Dtos;
using System.Text.Json;

namespace Dointo.AiRecruiter.Application.Services;

public interface IInterviewsService
{
	Task<IProcessingState> CreateCandidateAsync(CreateCandidateDto candidate, string username);
}

internal class InterviewsService(ICandidateRepository candidatesRepository, IResolver<Candidate, CreateCandidateDto> createCandidateResolver, ICandidatesAgent candidatesAgent) : IInterviewsService
{
	private const string CANDIDATE_STRING = nameof(Candidate);
	private readonly ICandidateRepository _candidatesRepository = candidatesRepository;
	private readonly IResolver<Candidate, CreateCandidateDto> _createCandidateResolver = createCandidateResolver;
	private readonly ICandidatesAgent _candidatesAgent = candidatesAgent;
	private readonly MessageBuilder _messageBuilder = new( );

	public async Task<IProcessingState> CreateCandidateAsync(CreateCandidateDto candidateDto, string username)
	{
		_messageBuilder.Clear( );
		var candidate = _createCandidateResolver.Resolve(candidateDto) ?? new Candidate( );
		try
		{
			var candidateJson = JsonSerializer.Serialize(candidate);
			candidate.Summary = await _candidatesAgent.GenerateCandidateSummaryAsync(candidateJson);
		}
		catch
		{
			// If AI generation fails, we can still save the candidate without a summary.
		}
		var validationResult = new CandidateValidator( ).Validate(candidate);
		if (!validationResult.IsValid)
			return validationResult.ToValidationErrorState(CANDIDATE_STRING);
		try
		{
			var savedEntity = await _candidatesRepository.SaveAsync(candidate, username);
			return new SuccessState<CreateCandidateDto>(_messageBuilder.AddFormat(Messages.RECORD_SAVED_FORMAT).AddString(CANDIDATE_STRING).Build( ), _createCandidateResolver.Resolve(savedEntity));
		}
		catch (Exception ex)
		{
			return new ExceptionState(_messageBuilder.AddFormat(Messages.ERROR_OCCURRED_FORMAT).AddString(CANDIDATE_STRING).Build( ), ex.Message);
		}
	}
}
