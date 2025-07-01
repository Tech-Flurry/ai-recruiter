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

	[HttpGet("generate-interview/{candidateId}/{jobId}")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(InterviewGeneratedDto))]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	public async Task<IActionResult> GenerateInterview(string candidateId, string jobId) => Ok(await _service.GenerateInterviewAsync(candidateId, jobId));

	[HttpPost("next-question/{interviewId}")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(NextQuestionDto))]
	public async Task<IActionResult> NextQuestion([FromBody] QuestionDto questionDto, string interviewId)
	{
		var result = await _service.NextQuestionAsync(questionDto, interviewId);
		return Ok(result);
	}
}
