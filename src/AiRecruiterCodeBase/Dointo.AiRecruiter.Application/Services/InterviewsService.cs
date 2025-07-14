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
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.Text.Json;

namespace Dointo.AiRecruiter.Application.Services;

public interface IInterviewsService
{
	Task<IProcessingState> CreateCandidateAsync(CreateCandidateDto candidateDto, string username);
	Task<IProcessingState> GenerateInterviewAsync(string candidateId, string jobId);
	Task<IProcessingState> GetInterviewResultForCandidateAsync(string interviewId);
	Task<IProcessingState> NextQuestionAsync(QuestionDto questionDto, string interviewId);
	Task<IProcessingState> GetInterviewResultAsync(string interviewId);
	Task<IProcessingState> GetInterviewHistoryByOwnerAsync(ClaimsPrincipal user);
	Task<IProcessingState> GetReportAsync(string interviewId);
	Task<IProcessingState> GetCandidateByUserAsync(ClaimsPrincipal user);
}

internal class InterviewsService(ICandidateRepository candidatesRepository, IResolver<Candidate, CreateCandidateDto> createCandidateResolver, ICandidatesAgent candidatesAgent, IInterviewsRepository interviewRepository, IResolver<Interview, InterviewGeneratedDto> interviewDtoResolver, IInterviewAgent interviewAgent, IResolver<Question, QuestionDto> questionDtoResolver, IResolver<Interview, CandidateInterviewResultDto> resultResolver,
	IResolver<Interview, InterviewResultDto> interviewResultsResolver, IResolver<Interview, InterviewReportDto> interviewReportDtoResolver, IReadOnlyRepository readOnlyRepository, IResolver<Interview, InterviewHistoryDto> interviewHistoryResolver) : IInterviewsService
{
	private const string CANDIDATE_STRING = nameof(Candidate);
	private const string INTERVIEW_STRING = nameof(Interview);
	private readonly ICandidateRepository _candidatesRepository = candidatesRepository;
	private readonly IResolver<Candidate, CreateCandidateDto> _createCandidateResolver = createCandidateResolver;
	private readonly ICandidatesAgent _candidatesAgent = candidatesAgent;
	private readonly IInterviewsRepository _interviewsRepository = interviewRepository;
	private readonly IReadOnlyRepository _readOnlyRepository = readOnlyRepository;
	private readonly IResolver<Interview, InterviewGeneratedDto> _interviewDtoResolver = interviewDtoResolver;
	private readonly IInterviewAgent _interviewAgent = interviewAgent;
	private readonly IResolver<Question, QuestionDto> _questionDtoResolver = questionDtoResolver;
	private readonly IResolver<Interview, CandidateInterviewResultDto> _resultResolver = resultResolver;
	private readonly IResolver<Interview, InterviewResultDto> _interviewResultsResolver = interviewResultsResolver;
	private readonly IResolver<Interview, InterviewHistoryDto> _interviewHistoryResolver = interviewHistoryResolver;
	private readonly IResolver<Interview, InterviewReportDto> _reportResolver = interviewReportDtoResolver;
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
			// If AI generation fails, we can still save the candidate without a summary.
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
			var aiScore = await _interviewAgent.GetAiScore(question.Answer ?? string.Empty);
			var aiPercent = ( aiScore / 5 ) * 100;
			var finalizedScore = scoredQuestion.ScoreObtained - ( aiPercent / 100 * scoredQuestion.ScoreObtained );
			scoredQuestion.ScoreObtained = finalizedScore;
			interview.Questions.Add(scoredQuestion);
			if (aiScore > 2)
				interview.Violations.Add($"Question: {scoredQuestion.Question} has an AI score of {aiScore}, which is above the acceptable threshold.");
			if (interview.Violations.Count > 3)
			{
				interview.Violations.Add("Interview has more than 3 violations.");
				terminate = true;
			}
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

	public async Task<IProcessingState> GetInterviewResultForCandidateAsync(string interviewId)
	{
		var interview = await _readOnlyRepository.FindByIdAsync<Interview>(interviewId);
		if (interview is null)
			return new BusinessErrorState(_messageBuilder.AddFormat(Messages.RECORD_NOT_FOUND_FORMAT).AddString(INTERVIEW_STRING).Build( ));
		var result = _resultResolver.Resolve(interview);
		result.InterviewLength = interview.GetLength( ).Minutes;
		result.IsPassed = interview.IsPassed( );
		return new SuccessState<CandidateInterviewResultDto>(
			_messageBuilder.AddFormat(Messages.RECORD_RETRIEVED_FORMAT).AddString(INTERVIEW_STRING).Build( ),
			result);
	}
    public async Task<IProcessingState> GetInterviewHistoryByOwnerAsync(ClaimsPrincipal user)
    {
        _messageBuilder.Clear();

        try
        {
            var ownerId = user.GetOwnerId();
            var interviews = await _interviewsRepository.GetByOwnerAsync(ownerId);

            var interviewDtos = interviews.Select(_interviewHistoryResolver.Resolve).ToList();

            if (interviewDtos.Count == 0)
            {
                return new SuccessState<List<InterviewHistoryDto>>(
                    _messageBuilder
                        .AddFormat("No interviews found for this user.")
                        .Build(),
                    interviewDtos
                );
            }

            // Prepare lookup to map interview to job
            var jobIds = interviews
                .Select(i => i.Job?.JobId)
                .Where(id => id != null)
                .Distinct()
                .ToList();

            var jobs = _readOnlyRepository.Query<Job>()
                .Where(j => jobIds.Contains(j.Id))
                .ToList();

            var jobDict = jobs.ToDictionary(j => j.Id);
            var interviewDict = interviews.ToDictionary(x => x.Id);

            // Update each DTO with job status
            foreach (var item in interviewDtos)
            {
                if (interviewDict.TryGetValue(item.InterviewId, out var interview))
                {
                    var jobId = interview.Job?.JobId;
                    if (jobId != null && jobDict.TryGetValue(jobId, out var job))
                    {
                        item.JobStatus = job.Status.Humanize();
                    }
                    else
                    {
                        item.JobStatus = "Unknown";
                    }
                }
            }

            return new SuccessState<List<InterviewHistoryDto>>(
                _messageBuilder
                    .AddFormat(Messages.RECORD_RETRIEVED_FORMAT)
                    .AddString(INTERVIEW_STRING)
                    .Build(),
                interviewDtos
            );
        }
        catch (Exception ex)
        {
            throw new Exception("Failed to retrieve interview history.", ex);
        }
    }

	public async Task<IProcessingState> GetReportAsync(string interviewId)
	{
		_messageBuilder.Clear( );

		try
		{
			var interview = await _interviewsRepository.GetInterviewResultByInterviewIdAsync(interviewId);

			if (interview == null)
			{
				return new BusinessErrorState(
					_messageBuilder
						.AddFormat(Messages.RECORD_NOT_FOUND_FORMAT)
						.AddString("Interview Report")
						.Build( ));
			}
			var dto = _reportResolver.Resolve(interview);
			var job = await _readOnlyRepository.FindByIdAsync<Job>(interview.Job.JobId);
			if (job != null)
			{
				dto.Status = job.Status.Humanize( );
			}
			return new SuccessState<InterviewReportDto>(
				_messageBuilder
					.AddFormat(Messages.RECORD_RETRIEVED_FORMAT)
					.AddString("Interview Report")
					.Build( ),
				dto
			);
		}
		catch (Exception ex)
		{
			return new ExceptionState(
				_messageBuilder
					.AddFormat(Messages.ERROR_OCCURRED_FORMAT)
					.AddString("Interview Report")
					.Build( ),
				ex.Message
			);
		}
	}

	public async Task<IProcessingState> GetInterviewResultAsync(string interviewId)
	{
		_messageBuilder.Clear( );

		try
		{
			var interview = await _interviewsRepository.GetInterviewResultByInterviewIdAsync(interviewId);

			if (interview == null)
			{
				return new BusinessErrorState(
					_messageBuilder
						.AddFormat(Messages.RECORD_NOT_FOUND_FORMAT)
						.AddString(INTERVIEW_STRING)
						.Build( ));
			}
			var candidate = await _readOnlyRepository.FindByIdAsync<Candidate>(interview.Interviewee.CandidateId);
			var dto = _interviewResultsResolver.Resolve(interview);
			dto.Experience = candidate.Experiences
				.OrderByDescending(e => e.StartDate)
				.Select(e => new ExperienceDto
				{
					Company = e.Company,
					JobTitle = e.JobTitle,
					StartDate = e.StartDate,
					EndDate = e.EndDate,
					Details = e.Details
				})
				.ToList( );
			dto.Education = candidate.EducationHistory
				.OrderByDescending(e => e.YearOfCompletion)
				.Select(e => new CredentialDto
				{
					Institution = e.Institution,
					Certificate = e.Certificate,
					YearOfCompletion = e.YearOfCompletion
				})
				.ToList( );
			dto.Certifications = candidate.Certifications
											.OrderByDescending(c => c.YearOfCompletion)
											.Select(c => new CredentialDto
											{
												Institution = c.Institution,
												Certificate = c.Certificate,
												YearOfCompletion = c.YearOfCompletion
											}).ToList( );
			dto.SkillRatings = [.. candidate.Skills
				.Select(kvp => new SkillRatingDto
				{
					Skill = kvp.Skill,
					Rating = kvp.Rating
				})];
			return new SuccessState<InterviewResultDto>(
				_messageBuilder
					.AddFormat(Messages.RECORD_RETRIEVED_FORMAT)
					.AddString(INTERVIEW_STRING)
					.Build( ),
				dto);
		}
		catch (Exception ex)
		{
			Console.WriteLine("❌ EXCEPTION in GetInterviewResultForCandidateAsync:");
			Console.WriteLine($"Message: {ex.Message}");
			Console.WriteLine($"StackTrace: {ex.StackTrace}");
			Console.WriteLine($"InnerException: {ex.InnerException?.Message}");

			return new ExceptionState(
				_messageBuilder
					.AddFormat(Messages.ERROR_OCCURRED_FORMAT)
					.AddString(INTERVIEW_STRING)
					.Build( ),
				ex.Message);
		}
	}

	public Task<IProcessingState> GetCandidateByUserAsync(ClaimsPrincipal user)
	{
		var ownerId = user.GetOwnerId( );
		var candidate = _readOnlyRepository.Query<Candidate>( )
			.FirstOrDefault(c => c.CreatedBy == ownerId);
		if (candidate is null)
			return Task.FromResult<IProcessingState>(new BusinessErrorState(
				_messageBuilder.AddFormat(Messages.RECORD_NOT_FOUND_FORMAT).AddString(CANDIDATE_STRING).Build( )));
		var dto = _createCandidateResolver.Resolve(candidate);
		return Task.FromResult<IProcessingState>(new SuccessState<CreateCandidateDto>(
			_messageBuilder.AddFormat(Messages.RECORD_RETRIEVED_FORMAT).AddString(CANDIDATE_STRING).Build( ),
			dto));
	}
}
