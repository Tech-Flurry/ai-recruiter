using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.Application.Utils;
using Dointo.AiRecruiter.Core.States;
using Dointo.AiRecruiter.Domain.Aggregates;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Domain.ValueObjects;
using Dointo.AiRecruiter.Dtos;
using Humanizer;

namespace Dointo.AiRecruiter.Application.Services;

public interface IDashboardService
{
	Task<IProcessingState> GetDashboardMetricsAsync( );
	Task<IProcessingState> GetJobPostInsightsAsync( );
	Task<IProcessingState> GetCandidatePipelineMetricsAsync( );
}

internal class DashboardService(IReadOnlyRepository readOnlyRepository) : IDashboardService
{
	private readonly IReadOnlyRepository _readOnlyRepository = readOnlyRepository;
	private readonly MessageBuilder _messageBuilder = new( );
	private const string DASHBOARD_STRING = "Dashboard";

	public Task<IProcessingState> GetDashboardMetricsAsync( )
	{
		_messageBuilder.Clear( );

		try
		{
			var jobQuery = _readOnlyRepository.Query<Job>( );
			var activeJobCount = jobQuery.Any( )
				? jobQuery.Count(j => j.Status == JobStatus.Open)
				: 0;

			var allInterviews = _readOnlyRepository.Query<Interview>( ).ToList( );

			var totalScreened = allInterviews.Count;
			var passedInterviews = allInterviews.Count(i => i.IsPassed( ));

			var passRate = totalScreened == 0
				? 0
				: Math.Round((double)passedInterviews / totalScreened * 100, 2);

			var metrics = new DashboardMetricsDto
			{
				ActiveJobPosts = activeJobCount,
				TotalCandidatesScreened = totalScreened,
				PassRate = passRate
			};

			return Task.FromResult<IProcessingState>(
				new SuccessState<DashboardMetricsDto>(
					_messageBuilder
						.AddFormat(Messages.RECORD_RETRIEVED_FORMAT)
						.AddString(DASHBOARD_STRING)
						.Build( ),
					metrics
				)
			);
		}
		catch (Exception ex)
		{
			return Task.FromResult<IProcessingState>(
				new ExceptionState(
					_messageBuilder
						.AddFormat(Messages.ERROR_OCCURRED_FORMAT)
						.AddString(DASHBOARD_STRING)
						.Build( ),
					ex.Message
				)
			);
		}
	}

	public Task<IProcessingState> GetJobPostInsightsAsync( )
	{
		_messageBuilder.Clear( );

		try
		{
			var interviews = _readOnlyRepository
				.Query<Interview>( )
				.Where(x => !x.IsDeleted)
				.ToList( );

			if (interviews is { Count: 0 })
			{
				return Task.FromResult<IProcessingState>(new BusinessErrorState(
					_messageBuilder
						.AddFormat(Messages.RECORD_NOT_FOUND_FORMAT)
						.AddString("Interview Data")
						.Build( )
				));
			}

			var insights = interviews
				.GroupBy(i => i.Job.JobTitle)
				.Select(group =>
				{
					var first = group.Min(x => x.StartTime);
					var last = group.Max(x => x.EndTime ?? DateTime.UtcNow);

					var validDurations = group
						.Where(x => x.EndTime.HasValue && x.EndTime > x.StartTime)
						.Select(x => x.GetLength( ).TotalMinutes)
						.ToList( );

					var avgDuration = validDurations.Any( )
						? validDurations.Average( )
						: 0;

					return new JobPostInsightDto
					{
						JobTitle = group.Key,
						TotalInterviews = group.Count( ),
						ScreeningTimeDays = "day".ToQuantity((int)Math.Round(( last - first ).TotalDays), ShowQuantityAs.Numeric),
						AverageInterviewDuration = TimeSpan.FromMinutes(avgDuration).Humanize( )
					};
				})
				.OrderByDescending(x => x.TotalInterviews)
				.ToList( );

			return Task.FromResult<IProcessingState>(new SuccessState<List<JobPostInsightDto>>(
				_messageBuilder
					.AddFormat(Messages.RECORD_RETRIEVED_FORMAT)
					.AddString("Job Post Insights")
					.Build( ),
				insights
			));
		}
		catch (Exception ex)
		{
			return Task.FromResult<IProcessingState>(new ExceptionState(
				_messageBuilder
					.AddFormat(Messages.ERROR_OCCURRED_FORMAT)
					.AddString("Job Post Insights")
					.Build( ),
				ex.Message
			));
		}
	}


	public Task<IProcessingState> GetCandidatePipelineMetricsAsync( )
	{
		_messageBuilder.Clear( );

		try
		{
			var now = DateTime.UtcNow;

			var interviews = _readOnlyRepository
				.Query<Interview>( )
				.Where(i => !i.IsDeleted)
				.ToList( );

			var weeklyApplications = interviews
				.Count(i => i.CreatedAt >= now.AddDays(-7));

			var newCandidates = interviews
				.Where(i => i.Interviewee is not null)
				.GroupBy(i => i.Interviewee.Email) // Assuming Email is unique
				.Select(g => g.OrderBy(x => x.CreatedAt).First( ))
				.Count(i => i.CreatedAt >= now.AddDays(-14));

			var interviewsScheduled = interviews
				.Count(i => i.StartTime >= now.AddDays(-7));

			var screenedCandidates = interviews
				.Count(i => i.AiScore >= 7.0);

			var metrics = new CandidatePipelineMetricsDto
			{
				WeeklyApplications = weeklyApplications,
				NewCandidates = newCandidates,
				InterviewsScheduled = interviewsScheduled,
				ScreenedCandidates = screenedCandidates
			};

			return Task.FromResult<IProcessingState>(
				new SuccessState<CandidatePipelineMetricsDto>(
					_messageBuilder
						.AddFormat(Messages.RECORD_RETRIEVED_FORMAT)
						.AddString("Candidate Pipeline Metrics")
						.Build( ),
					metrics
				)
			);
		}
		catch (Exception ex)
		{
			return Task.FromResult<IProcessingState>(
				new ExceptionState(
					_messageBuilder
						.AddFormat(Messages.ERROR_OCCURRED_FORMAT)
						.AddString("Candidate Pipeline Metrics")
						.Build( ),
					ex.Message
				)
			);
		}
	}

}
