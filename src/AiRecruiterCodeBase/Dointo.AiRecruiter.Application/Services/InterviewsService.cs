using Dointo.AiRecruiter.Application.AiAbstractions;
using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.Application.Utils;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Core.Extensions;
using Dointo.AiRecruiter.Core.States;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Domain.Validators;
using Dointo.AiRecruiter.Domain.ValueObjects;
using Dointo.AiRecruiter.Dtos;
using System.Text.Json;

namespace Dointo.AiRecruiter.Application.Services;

public interface IInterviewsService
{
	Task<IProcessingState> CreateCandidateAsync(CreateCandidateDto candidate, string username);
	Task<IProcessingState> GenerateInterviewAsync(string candidateId, string jobId);
	Task<IProcessingState> NextQuestionAsync(QuestionDto questionDto, string interviewId);
}

internal class InterviewsService(ICandidateRepository candidatesRepository, IResolver<Candidate, CreateCandidateDto> createCandidateResolver, ICandidatesAgent candidatesAgent, IInterviewsRepository interviewrepository, IReadOnlyRepository readOnlyRepository, IResolver<Interview, InterviewGeneratedDto> interviewDtoResolver, IInterviewAgent interviewAgent, IResolver<Question, QuestionDto> questionDtoResolver) : IInterviewsService
{
	private const string CANDIDATE_STRING = nameof(Candidate);
	private const string INTERVIEW_STRING = nameof(Interview);
	private readonly ICandidateRepository _candidatesRepository = candidatesRepository;
	private readonly IResolver<Candidate, CreateCandidateDto> _createCandidateResolver = createCandidateResolver;
	private readonly ICandidatesAgent _candidatesAgent = candidatesAgent;
	private readonly IInterviewsRepository _interviewsRepository = interviewrepository;
	private readonly IReadOnlyRepository _readOnlyRepository = readOnlyRepository;
	private readonly IResolver<Interview, InterviewGeneratedDto> _interviewDtoResolver = interviewDtoResolver;
	private readonly IInterviewAgent _interviewAgent = interviewAgent;
	private readonly IResolver<Question, QuestionDto> _questionDtoResolver = questionDtoResolver;
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

	public async Task<IProcessingState> GenerateInterviewAsync(string candidateId, string jobId)
	{
		_messageBuilder.Clear( );

		var candidate = await _readOnlyRepository.FindByIdAsync<Candidate>(candidateId);
		if (candidate is null)
			return new BusinessErrorState(_messageBuilder.AddFormat(Messages.RECORD_NOT_FOUND_FORMAT).AddString(CANDIDATE_STRING).Build( ));

		var job = await _readOnlyRepository.FindByIdAsync<Job>(jobId);
		if (job is null)
			return new BusinessErrorState(_messageBuilder.AddFormat(Messages.RECORD_NOT_FOUND_FORMAT).AddString(nameof(Job)).Build( ));

		try
		{
			var interview = await _interviewsRepository.CreateInterviewAsync(job, candidate);
			var dto = _interviewDtoResolver.Resolve(interview);
			dto.InterviewStarter = await _interviewAgent.GenerateInterviewStarter(job.Title, candidate.Name.FirstName);
			return new SuccessState<InterviewGeneratedDto>(
				_messageBuilder.AddFormat(Messages.RECORD_SAVED_FORMAT).AddString(INTERVIEW_STRING).Build( ),
				dto);
		}
		catch (Exception ex)
		{
			return new ExceptionState(_messageBuilder.AddFormat(Messages.ERROR_OCCURRED_FORMAT).AddString(INTERVIEW_STRING).Build( ), ex.Message);
		}
	}

	public async Task<IProcessingState> NextQuestionAsync(QuestionDto questionDto, string interviewId)
	{
		_messageBuilder.Clear( );
		var question = _questionDtoResolver.Resolve(questionDto) ?? new Question( );
		try
		{
			var interview = await _readOnlyRepository.FindByIdAsync<Interview>(interviewId);
			var candidate = await _readOnlyRepository.FindByIdAsync<Candidate>(interview.Interviewee.CandidateId);
			var (scoredQuestion, terminate) = await _interviewAgent.ScoreQuestionAsync(interview, question);
			interview.Questions.Add(scoredQuestion);
			var nextQuestionDto = new NextQuestionDto { Terminate = terminate || interview.Questions.Count == 25 };
			if (!terminate)
			{
				var nextQuestion = await _interviewAgent.GenerateNextQuestionAsync(interview, candidate);
				nextQuestionDto.Question = nextQuestion;
			}
			else
			{
				var (analysis, score) = await _interviewAgent.ScoreInterviewAsync(interview);
				interview.Interviewee.JobFitAnalysis = analysis;
				interview.AiScore = score;
				interview.ScoredSkills = await _interviewAgent.ScoreSkillsAsync(interview);
				interview.EndTime = DateTime.UtcNow;
			}
			return new SuccessState<NextQuestionDto>(
				_messageBuilder.AddFormat(Messages.RECORD_SAVED_FORMAT).AddString(INTERVIEW_STRING).Build( ),
				nextQuestionDto);
		}
		catch (Exception ex)
		{
			return new ExceptionState(_messageBuilder.AddFormat(Messages.ERROR_OCCURRED_FORMAT).AddString(INTERVIEW_STRING).Build( ), ex.Message);
		}
	}
}
