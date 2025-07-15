using Dointo.AiRecruiter.Application.Services;
using Dointo.AiRecruiter.Core.States;
using Dointo.AiRecruiter.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Dointo.AiRecruiter.RestApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class InterviewsController(IInterviewsService service) : ControllerBase
{
	private readonly IInterviewsService _service = service;
	[HttpPost("create-candidate")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	public async Task<IActionResult> CreateCandidate([FromBody] CreateCandidateDto dto) =>
	Ok(await _service.CreateCandidateAsync(dto, User.Identity?.Name ?? "system"));

	[HttpGet("get-candidate")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(CreateCandidateDto))]
	public async Task<IActionResult> GetCandidate() =>
		Ok(await _service.GetCandidateByUserAsync(User));

	[HttpGet("generate-interview/{candidateId}/{jobId}")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(InterviewGeneratedDto))]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	public async Task<IActionResult> GenerateInterview(string candidateId, string jobId) =>
		Ok(await _service.GenerateInterviewAsync(candidateId, jobId));

	[HttpPost("next-question/{interviewId}")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(NextQuestionDto))]
	public async Task<IActionResult> NextQuestion([FromBody] QuestionDto questionDto, string interviewId)
	{
		var result = await _service.NextQuestionAsync(questionDto, interviewId);
		return Ok(result);
	}

	[HttpGet("candidate-results/{interviewId}")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(CandidateInterviewResultDto))]
	public async Task<IActionResult> CandidateResults(string interviewId) =>
		Ok(await _service.GetInterviewResultForCandidateAsync(interviewId));

	[HttpGet("interview-results/{interviewId}")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(InterviewResultDto))]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	[ProducesResponseType(StatusCodes.Status500InternalServerError)]
	public async Task<IActionResult> GetInterviewResult(string interviewId)
	{
		var state = await _service.GetInterviewResultAsync(interviewId);
		return Ok(state);
	}


	[HttpGet("candidate-dashboard")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(CandidateDashboardDto))]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	[ProducesResponseType(StatusCodes.Status500InternalServerError)]
	public async Task<IActionResult> GetCandidateDashboard( )
	{
		var state = await _service.GetCandidateDashboardAsync(User);

		if (state is BusinessErrorState)
			return NotFound(state);

		return Ok(state);
	}

	[HttpGet("history")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<InterviewHistoryDto>))]
	public async Task<IActionResult> GetInterviewHistoryByOwner( )
	{
		var result = await _service.GetInterviewHistoryByOwnerAsync(User);
		return Ok(result);
	}
	[HttpGet("interview-report/{interviewId}")]
	public async Task<IActionResult> GetInterviewReport(string interviewId)
	{
		var report = await _service.GetReportAsync(interviewId);
		return Ok(report);
	}
}
