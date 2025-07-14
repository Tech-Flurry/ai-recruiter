using Dointo.AiRecruiter.Application.Services;
using Dointo.AiRecruiter.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Dointo.AiRecruiter.RestApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthenticationController(IAuthenticationService authenticationService) : ControllerBase
{
	private readonly IAuthenticationService _authenticationService = authenticationService;

	[AllowAnonymous]
	[HttpPost("login")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status401Unauthorized)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	public async Task<IActionResult> LoginAsync([FromBody] LoginCredentialsDto request)
	{
		if (request is null || string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
			return BadRequest("Invalid login credentials.");
		try
		{
			var token = await _authenticationService.LoginAsync(request);
			return Ok(new { Token = token });
		}
		catch (UnauthorizedAccessException ex)
		{
			return Unauthorized(ex.Message);
		}
		catch (Exception ex)
		{
			return BadRequest($"An error occurred: {ex.Message}");
		}
	}

	[AllowAnonymous]
	[HttpPost("register")]
	[ProducesResponseType(StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status400BadRequest)]
	public async Task<IActionResult> RegisterAsync([FromBody] RegisterUserDto request)
	{
		if (request is null || string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
			return BadRequest("Invalid registration details.");
		try
		{
			var token = await _authenticationService.RegisterUserAsync(request);
			return Ok(new { Token = token });
		}
		catch (InvalidOperationException ex)
		{
			return BadRequest(ex.Message);
		}
		catch (Exception ex)
		{
			return BadRequest($"An error occurred: {ex.Message}");
		}
	}
}
