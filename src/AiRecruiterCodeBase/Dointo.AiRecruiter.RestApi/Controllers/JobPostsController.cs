using Dointo.AiRecruiter.Application.Services;
using Dointo.AiRecruiter.Core.States;
using Dointo.AiRecruiter.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace Dointo.AiRecruiter.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class JobPostsController(IJobPostsService service) : ControllerBase
{
	private readonly IJobPostsService _service = service;

	// ✅ GET: api/JobPosts/{id}
	[HttpGet("{id}")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(EditJobDto))]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	public async Task<IActionResult> GetJobPost(string id) => Ok(await _service.GetByIdAsync(id));

	[HttpGet]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<JobListDto>))]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	public async Task<IActionResult> GetJobsList( ) => Ok(await _service.GetJobsListAsync(User));

	[HttpPost]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	public async Task<IActionResult> CreateOrUpdateJobPost([FromBody] EditJobDto dto) => Ok(await _service.SaveAsync(dto, User.Identity?.Name ?? "system"));

	// ✅ DELETE: api/JobPosts/{id}
	[HttpDelete("{id}")]
	[ProducesResponseType(StatusCodes.Status204NoContent)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	public async Task<IActionResult> DeleteJobPost(string id) => Ok(await _service.DeleteAsync(id));

	// ✅ POST: api/JobPosts/extract-skills
	[HttpPost("extract-skills")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	public async Task<IActionResult> ExtractSkillsFromDescription([FromBody] JobDescriptionDto dto) => Ok(await _service.ExtractSkillsFromDescriptionAsync(dto.JobDescription));

	// ✅ POST: api/JobPosts/close-multiple
	[HttpPost("close-multiple")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	public async Task<IActionResult> CloseMultipleJobPosts([FromBody] CloseMultipleJobsDto dto) => Ok(await _service.CloseMultipleJobsAsync(dto));

	// ✅ GET: api/JobPosts/skills
	[HttpGet("skills")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(SkillDto))]
	public IActionResult GetAllSkills( ) => Ok(_service.GetAllSkills( ));

	[HttpGet("candidate-jobs")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<CandidateJobViewDto>))]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	public async Task<IActionResult> GetCandidateJobs( )
	{
		var result = await _service.GetActiveCandidateJobsAsync( );

		if (result is not SuccessState<List<CandidateJobViewDto>> successState)
			return NotFound(result.Message); // Or BadRequest if you want to handle business/validation errors differently

		return Ok(successState.Data);
	}



}

