using Dointo.AiRecruiter.Application.Services;
using Dointo.AiRecruiter.Core.States;
using Dointo.AiRecruiter.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace Dointo.AiRecruiter.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController(IDashboardService service) : ControllerBase
{
	private readonly IDashboardService _service = service;

	// ✅ GET: api/Dashboard
	[HttpGet]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(DashboardMetricsDto))]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	[ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
	[ProducesResponseType(StatusCodes.Status500InternalServerError)]
	public async Task<IActionResult> GetDashboardMetrics( )
	{
		var result = await _service.GetDashboardMetricsAsync(User);

		return result switch
		{
			SuccessState<DashboardMetricsDto> success => Ok(success.Data),
			BusinessErrorState error => BadRequest(new { error.Message }),
			ValidationErrorState validation => UnprocessableEntity(new { validation.Errors }),
			ExceptionState ex => StatusCode(500, new { ex.Message }),
			_ => StatusCode(500, new { Message = "Unhandled state." })
		};
	}

	// ✅ GET: api/Dashboard/insights
	[HttpGet("insights")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<JobPostInsightDto>))]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	[ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
	[ProducesResponseType(StatusCodes.Status500InternalServerError)]
	public async Task<IActionResult> GetJobPostInsights( )
	{
		var result = await _service.GetJobPostInsightsAsync(User);

		return result switch
		{
			SuccessState<List<JobPostInsightDto>> success => Ok(success.Data),
			BusinessErrorState error => BadRequest(new { error.Message }),
			ValidationErrorState validation => UnprocessableEntity(new { validation.Errors }),
			ExceptionState ex => StatusCode(500, new { ex.Message }),
			_ => StatusCode(500, new { Message = "Unhandled state." })
		};
	}

	// ✅ GET: api/Dashboard/pipeline-metrics
	[HttpGet("pipeline-metrics")]
	[ProducesResponseType(StatusCodes.Status200OK, Type = typeof(CandidatePipelineMetricsDto))]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	[ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
	[ProducesResponseType(StatusCodes.Status500InternalServerError)]
	public async Task<IActionResult> GetCandidatePipelineMetrics( )
	{
		var result = await _service.GetCandidatePipelineMetricsAsync(User);

		return result switch
		{
			SuccessState<CandidatePipelineMetricsDto> success => Ok(success.Data),
			BusinessErrorState error => BadRequest(new { error.Message }),
			ValidationErrorState validation => UnprocessableEntity(new { validation.Errors }),
			ExceptionState ex => StatusCode(500, new { ex.Message }),
			_ => StatusCode(500, new { Message = "Unhandled state." })
		};
	}
}
