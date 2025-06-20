using Dointo.AiRecruiter.Application.Services;
using Dointo.AiRecruiter.Core.States;
using Dointo.AiRecruiter.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Dointo.AiRecruiter.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CandidatesController(ICandidateService service) : ControllerBase
{
	private readonly ICandidateService _service = service;

	// ✅ GET: api/Candidates/by-job/{jobId}
	[HttpGet("by-job/{jobId}")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<CandidateListDto>))]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	public async Task<IActionResult> GetCandidatesByJobId(string jobId)
	{
		var result = await _service.GetCandidatesByJobIdAsync(jobId);
		return Ok(result);
	}

	// ✅ PATCH: api/Candidates/update-status/{candidateId}
	[HttpPatch("update-status/{candidateId}")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	public async Task<IActionResult> UpdateCandidateStatus(string candidateId, [FromBody] UpdateCandidateStatusDto dto)
	{
		if (string.IsNullOrWhiteSpace(dto.Status))
		{
			return BadRequest("Status is required.");
		}

		var result = await _service.UpdateCandidateStatusAsync(candidateId, dto.Status);

		if (result is BusinessErrorState)
			return NotFound(result);

		return Ok(result);
	}
}
