using Dointo.AiRecruiter.Application.Services;
using Dointo.AiRecruiter.Core.States;
using Dointo.AiRecruiter.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dointo.AiRecruiter.RestApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CandidatesController(ICandidateService service) : ControllerBase
{
	private readonly ICandidateService _service = service;

	// ✅ GET: api/Candidates/by-job/{jobId}
	[HttpGet("by-job/{jobId}")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	public async Task<IActionResult> GetCandidatesByJobId(string jobId)
	{
		var result = await _service.GetCandidatesByJobIdAsync(jobId);
		return Ok(result);
	}

	// ✅ PATCH: api/Candidates/update-status
	[HttpPatch("update-status")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	public IActionResult UpdateCandidateStatus([FromBody] UpdateCandidateStatusDto dto) => Ok(_service.UpdateInterviewStatus(dto.InterviewId, dto.Status));
	// ✅ NEW: GET job title by job ID
	[HttpGet("job-title/{jobId}")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	public async Task<IActionResult> GetJobTitle(string jobId)
	{
		var result = await _service.GetJobTitleByJobIdAsync(jobId);

		if (result is BusinessErrorState error)
			return NotFound(new { success = false, message = error.Message });

		if (result is SuccessState<string> success)
			return Ok(new { success = true, jobTitle = success.Data });

		return StatusCode(500, new { success = false, message = "Unexpected error." });
	}
}
