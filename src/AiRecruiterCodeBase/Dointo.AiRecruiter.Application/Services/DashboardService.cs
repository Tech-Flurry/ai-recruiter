using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.Application.Utils;
using Dointo.AiRecruiter.Core.States;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Domain.ValueObjects;
using Dointo.AiRecruiter.Dtos;
using Humanizer;

namespace Dointo.AiRecruiter.Application.Services;

public interface IDashboardService
{
	Task<IProcessingState> GetDashboardMetricsAsync( );
	Task<IProcessingState> GetJobPostInsightsAsync( );
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
			var passedInterviews = allInterviews.Count(i => i is { AiScore: >= 7.0 });

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

			if (interviews == null || !interviews.Any( ))
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
					var last = group.Max(x => x.EndTime);

					var avgDuration = group
						.Where(x => x.EndTime > x.StartTime)
						.Average(x => ( x.EndTime - x.StartTime ).TotalMinutes);

					return new JobPostInsightDto
					{
						JobTitle = group.Key,
						TotalInterviews = group.Count( ),
						ScreeningTimeDays = "day".ToQuantity((int)Math.Round(( last - first ).TotalDays), ShowQuantityAs.Numeric),
						AverageInterviewDuration = TimeSpan.FromMinutes(avgDuration).Humanize(),
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
}
