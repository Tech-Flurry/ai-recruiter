using Dointo.AiRecruiter.Domain.Entities;

namespace Dointo.AiRecruiter.Domain.Aggregates;
public static class JobsAggregateExtensions
{
	public static List<Interviewee> GetSortedInterviewees(this Job job, IQueryable<Interview> interviewSet, int? top = null)
	{
		var interviewList = interviewSet
							.Where(x => x.Job.JobId == job.Id)
							.Select(i => new { Interview = i, i.Interviewee, i.Questions })
							.ToList( );

		var sortedInterviewees = interviewList
			.OrderByDescending(i => i.Interview.GetScorePercentage( ))
			.Select(i => i.Interviewee);

		if (top.HasValue)
			sortedInterviewees = sortedInterviewees.Take(top.Value);

		return [.. sortedInterviewees];
	}

	public static int GetInterviewCount(this Job job, IQueryable<Interview> interviewSet) => interviewSet.Count(i => i.Job.JobId == job.Id);
}
