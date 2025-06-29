using Dointo.AiRecruiter.Application.Services;             // ✅ Correct namespace
using Dointo.AiRecruiter.Core.States;
using Dointo.AiRecruiter.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Dointo.AiRecruiter.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InterviewResultsController : ControllerBase
{
	private readonly IInterviewResultService _service;

	public InterviewResultsController(IInterviewResultService service)
	{
		_service = service;
	}

	[HttpGet("{interviewId}")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(InterviewResultDto))]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	[ProducesResponseType(StatusCodes.Status500InternalServerError)]
	public async Task<IActionResult> GetInterviewResult(string interviewId)
	{
		var state = await _service.GetInterviewResultAsync(interviewId);
		return Ok(state);
	}
}
