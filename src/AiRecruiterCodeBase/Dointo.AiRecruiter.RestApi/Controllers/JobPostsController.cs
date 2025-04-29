using Dointo.AiRecruiter.Application.Services;
using Dointo.AiRecruiter.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Dointo.AiRecruiter.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobPostsController(IJobPostsService service) : ControllerBase
{
	private readonly IJobPostsService _service = service;

	// ✅ GET: api/JobPosts/{id}
	[HttpGet("{id}")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	public async Task<IActionResult> GetJobPost(string id)
	{
		var result = await _service.GetByIdAsync(id);
		return Ok(result);
	}

	// ✅ NEW: GET: api/JobPosts
	[HttpGet]
	[ProducesResponseType(StatusCodes.Status200OK)]
	public async Task<IActionResult> GetAllJobPosts( )
	{
		var result = await _service.GetAllAsync( );
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

		var result = await _service.SaveAsync(dto, User.Identity?.Name ?? "system");
		return Ok(result);
	}

	// ✅ DELETE: api/JobPosts/{id}
	[HttpDelete("{id}")]
	[ProducesResponseType(StatusCodes.Status204NoContent)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	public async Task<IActionResult> DeleteJobPost(string id)
	{
		var result = await _service.DeleteAsync(id);
		return Ok(result);
	}

	// 🔒 Reset method remains commented unless approved
	// [HttpPost("reset")]
	// [ProducesResponseType(StatusCodes.Status200OK)]
	// public async Task<IActionResult> ResetAllJobPosts()
	// {
	//     var posts = await _repository.GetByOwnerAsync("system", true);
	//     foreach (var post in posts)
	//     {
	//         post.IsDeleted = true;
	//         await _repository.SaveAsync(post, "system");
	//     }
	//     return Ok(new { Message = "All job posts have been soft-deleted." });
	// }
}
