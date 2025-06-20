using Dointo.AiRecruiter.Application.Services;
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
}
