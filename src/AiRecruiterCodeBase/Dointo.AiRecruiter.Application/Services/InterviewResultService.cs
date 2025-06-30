using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.Application.Utils;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Core.States;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Dtos;

namespace Dointo.AiRecruiter.Application.Services;

public interface IInterviewResultService
{
	Task<IProcessingState> GetInterviewResultAsync(string interviewId);
}

public class InterviewResultService(
	IInterviewRepository interviewRepository,
	IResolver<Interview, InterviewResultDto> resolver, IReadOnlyRepository readOnlyRepository) : IInterviewResultService
{
	private readonly IInterviewRepository _interviewRepository = interviewRepository;
	private readonly IResolver<Interview, InterviewResultDto> _resolver = resolver;
	private readonly IReadOnlyRepository _readOnlyRepository = readOnlyRepository;
	private readonly MessageBuilder _messageBuilder = new( );

	private const string INTERVIEW_STRING = nameof(Interview);

	public async Task<IProcessingState> GetInterviewResultAsync(string interviewId)
	{
		_messageBuilder.Clear( );

		try
		{
			var interview = await _interviewRepository.GetInterviewResultByInterviewIdAsync(interviewId);

			if (interview == null)
			{
				return new BusinessErrorState(
					_messageBuilder
						.AddFormat(Messages.RECORD_NOT_FOUND_FORMAT)
						.AddString(INTERVIEW_STRING)
						.Build( ));
			}
			var candidate = await _readOnlyRepository.FindByIdAsync<Candidate>(interview.Interviewee.CandidateId);
			var dto = _resolver.Resolve(interview);
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
			dto.SkillRatings = candidate.Skills
				.Select(kvp => new SkillRatingDto
				{
					Skill = kvp.Skill,
					Rating = kvp.Rating
				}).ToList( );
			return new SuccessState<InterviewResultDto>(
				_messageBuilder
					.AddFormat(Messages.RECORD_RETRIEVED_FORMAT)
					.AddString(INTERVIEW_STRING)
					.Build( ),
				dto);
		}
		catch (Exception ex)
		{
			Console.WriteLine("❌ EXCEPTION in GetInterviewResultAsync:");
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
}
