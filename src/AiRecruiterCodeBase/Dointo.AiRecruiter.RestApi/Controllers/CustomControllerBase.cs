using Microsoft.AspNetCore.Mvc;

namespace Dointo.AiRecruiter.RestApi.Controllers;

public class CustomControllerBase : ControllerBase
{
	protected IActionResult HandleError(string message, int statusCode)
	{
		return StatusCode(statusCode, new { Message = message });
	}
	protected IActionResult HandleSuccess(object data)
	{

		return Ok(data);
	}
}
