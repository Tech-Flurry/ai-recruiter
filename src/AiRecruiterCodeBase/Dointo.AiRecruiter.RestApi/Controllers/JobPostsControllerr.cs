using Microsoft.AspNetCore.Mvc;
using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.Domain.Entities;

namespace Dointo.AiRecruiter.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobPostsController : ControllerBase
{
	private readonly IJobPostRepository _repository;
	private readonly ILogger<JobPostsController> _logger;

	public JobPostsController(IJobPostRepository repository, ILogger<JobPostsController> logger)
	{
		_repository = repository;
		_logger = logger;
	}


	[HttpGet("{id}")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	public async Task<IActionResult> GetJobPost(string id)
	{
		var post = await _repository.GetByIdAsync(id);
		if (post is null)
		{
			_logger.LogWarning("Job post with ID {Id} not found.", id);
			return NotFound(new { Message = "Job post not found." });
		}
		return Ok(post);
	}

	[HttpGet("owner/{ownerId}")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> GetByOwner(string ownerId, [FromQuery] bool allowInactive = false)
	{
		var posts = await _repository.GetByOwnerAsync(ownerId, allowInactive);
		return Ok(posts);
	}

	[HttpPost]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	public async Task<IActionResult> CreateOrUpdateJobPost([FromBody] JobPostDto dto)
	{
		if (!ModelState.IsValid)
		{
			_logger.LogWarning("Invalid job post submission.");
			return BadRequest(ModelState);
		}

		var jobPost = new JobPostEntity
		{
			Id = dto.Id ?? string.Empty,
			JobTitle = dto.JobTitle,
			YearsOfExperience = dto.YearsOfExperience,
			JobDescription = dto.JobDescription,
			RequiredSkills = dto.RequiredSkills,
			AdditionalQuestions = dto.AdditionalQuestions,
			Budget = new HiringBudget
			{
				Amount = dto.HiringBudget?.Amount ?? 0,
				Currency = dto.HiringBudget?.Currency ?? "USD"
			}
		};

		var result = await _repository.SaveAsync(jobPost, "system"); // replace with User.Identity?.Name

		return Ok(new
		{
			Message = string.IsNullOrEmpty(dto.Id) ? "Job post created." : "Job post updated.",
			JobPost = result
		});
	}

	[HttpDelete("{id}")]
	[ProducesResponseType(StatusCodes.Status204NoContent)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	public async Task<IActionResult> DeleteJobPost(string id)
	{
		var post = await _repository.GetByIdAsync(id);
		if (post is null)
		{
			_logger.LogWarning("Job post to delete not found: {Id}", id);
			return NotFound(new { Message = "Job post not found." });
		}

		post.IsDeleted = true;
		await _repository.SaveAsync(post, "system");
		_logger.LogInformation("Job post soft-deleted with ID: {Id}", id);

		return NoContent( );
	}

	[HttpPost("reset")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> ResetAllJobPosts( )
	{
		_logger.LogWarning("Resetting all job posts by marking them deleted.");

		var posts = await _repository.GetByOwnerAsync("system", true); // Adjust owner logic as needed
		foreach (var post in posts)
		{
			post.IsDeleted = true;
			await _repository.SaveAsync(post, "system");
		}

		return Ok(new { Message = "All job posts have been soft-deleted." });
	}
}
