using Dointo.AiRecruiter.Application.Services;
using Dointo.AiRecruiter.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Dointo.AiRecruiter.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobPostsController(IJobPostsService jobPostsService) : ControllerBase
{
	private readonly IJobPostsService _jobPostsService = jobPostsService;

	// ✅ GET: api/JobPosts/{id}
	[HttpGet("{id}")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	public async Task<IActionResult> GetJobPost(string id)
	{
		var result = await _jobPostsService.GetByIdAsync(id);
		return Ok(result);
	}

	// ✅ POST: api/JobPosts
	[HttpPost]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	public async Task<IActionResult> CreateOrUpdateJobPost([FromBody] EditJobDto dto)
	{
		if (dto is null)
			return BadRequest(new { Message = "Invalid job post data." });

		var result = await _jobPostsService.SaveAsync(dto, User.Identity?.Name ?? "system");
		return Ok(result);
	}

	// ✅ DELETE: api/JobPosts/{id}
	[HttpDelete("{id}")]
	[ProducesResponseType(StatusCodes.Status204NoContent)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	public async Task<IActionResult> DeleteJobPost(string id)
	{
		var result = await _jobPostsService.DeleteAsync(id);
		return Ok(result);
	}
	// ✅ POST: api/JobPosts/extract-skills
	[HttpPost("extract-skills")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	public async Task<IActionResult> ExtractSkillsFromDescription([FromBody] JobDescriptionDto dto)
	{
		if (string.IsNullOrWhiteSpace(dto?.JobDescription))
			return BadRequest("Job description is required.");

		var skills = await _jobPostsService.ExtractSkillsFromDescriptionAsync(dto.JobDescription);
		return Ok(skills);
	}
	// ✅ GET: api/JobPosts/skills
	[HttpGet("skills")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public IActionResult GetAllSkills( )
	{
		var skills = _jobPostsService.GetAllSkills( );
		return Ok(skills);
	}


}

