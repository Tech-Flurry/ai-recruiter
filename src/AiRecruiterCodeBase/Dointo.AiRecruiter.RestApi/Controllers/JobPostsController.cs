using Dointo.AiRecruiter.Application.Services;
using Dointo.AiRecruiter.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Dointo.AiRecruiter.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobPostsController(IJobPostsService service) : ControllerBase
{
	private readonly IJobPostsService _service = service;

	[HttpGet("{id}")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	public async Task<IActionResult> GetJobPost(string id) => Ok(await _service.GetByIdAsync(id));

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

	[HttpDelete("{id}")]
	[ProducesResponseType(StatusCodes.Status204NoContent)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	public async Task<IActionResult> DeleteJobPost(string id) => Ok(await _service.DeleteAsync(id));

	//[HttpPost("reset")]
	//[ProducesResponseType(StatusCodes.Status200OK)]
	//public async Task<IActionResult> ResetAllJobPosts( )
	//{
	//	_logger.LogWarning("Resetting all job posts by marking them deleted.");

	//	var posts = await _repository.GetByOwnerAsync("system", true); // Adjust owner logic as needed
	//	foreach (var post in posts)
	//	{
	//		post.IsDeleted = true;
	//		await _repository.SaveAsync(post, "system");
	//	}

	//	return Ok(new { Message = "All job posts have been soft-deleted." });
	//} //TODO: Need to confirm with the team if this is needed or not.
}
