using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using Dointo.AiRecruiter.Dtos;
using Dointo.AiRecruiter.Application.Services;

namespace Dointo.AiRecruiter.RestApi.Controllers;

[ApiController]
[Route("api/job-posts")]
public class JobListController(IJobPostService jobPostService) : ControllerBase
{
	private static readonly List<JobList> jobList = new( )
	{
		new JobList { Id = "1", Title = "Software Engineer", CreatedAt = DateTime.UtcNow.AddDays(-5), Status = "open", HasInterviews = false },
		new JobList { Id = "2", Title = "UI/UX Designer", CreatedAt = DateTime.UtcNow.AddDays(-3), Status = "open", HasInterviews = true },
		new JobList { Id = "3", Title = "QA Tester", CreatedAt = DateTime.UtcNow.AddDays(-10), Status = "closed", HasInterviews = false }
	};

	// GET: /api/job-posts
	[HttpGet]
	public async Task<IActionResult> GetJobPostsAsync( )
	{
		return Ok(await jobPostService.GetListAsync());
	}

	// POST: /api/job-posts/close
	[HttpPost("close")]
	public IActionResult CloseJobPosts([FromBody] CloseJobListRequest request)
	{
		if (request == null || request.JobIds == null || !request.JobIds.Any( ) || string.IsNullOrWhiteSpace(request.Reason))
		{
			return BadRequest("Job IDs and a reason for closing are required.");
		}

		foreach (var job in jobList.Where(j => request.JobIds.Contains(j.Id)))
		{
			job.Status = "closed";
			// Optionally: log request.Reason somewhere
		}

		return Ok(new { message = "Selected job posts closed successfully." });
	}
}
