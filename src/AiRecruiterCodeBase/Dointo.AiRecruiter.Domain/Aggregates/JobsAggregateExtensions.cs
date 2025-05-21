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

	public static List<Candidate> GetRecommendedCandidates(
	this Job job,
	IQueryable<Candidate> candidateSet,
	IQueryable<Interview> interviewSet,
	double idealScore,
	int? top = null)
	{
		var jobIntervieweesQuery = interviewSet
			.Where(x => x.Job.JobId == job.Id && x.AiScore >= idealScore)
			.OrderByDescending(x => x.AiScore)
			.Select(i => i.Interviewee);
		if (top.HasValue)
			jobIntervieweesQuery = jobIntervieweesQuery.Take(top.Value);
		var jobInterviewees = jobIntervieweesQuery.ToList( );
		var candidateIds = jobInterviewees.Select(y => y.CandidateId).ToList( );
		var candidatesDict = candidateSet
			.Where(x => candidateIds.Contains(x.Id))
			.AsEnumerable( )
			.ToDictionary(c => c.Id);
		var orderedCandidates = candidateIds
			.Where(candidatesDict.ContainsKey)
			.Select(id => candidatesDict[id])
			.ToList( );
		return orderedCandidates;
	}
}
