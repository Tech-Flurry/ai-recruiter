using Dointo.AiRecruiter.Application.Services;
using Dointo.AiRecruiter.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Dointo.AiRecruiter.RestApi.Controllers;
[ApiController]
[Route("api/[controller]")]
public class InterviewsController(IInterviewsService service) : ControllerBase
{
	private readonly IInterviewsService _service = service;

	[HttpPost("create-candidate")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	public async Task<IActionResult> CreateCandidate([FromBody] CreateCandidateDto dto) => Ok(await _service.CreateCandidateAsync(dto, User.Identity?.Name ?? "system"));
}
