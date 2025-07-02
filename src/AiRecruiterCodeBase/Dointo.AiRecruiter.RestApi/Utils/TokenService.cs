using Dointo.AiRecruiter.Application.Services;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Dointo.AiRecruiter.RestApi.Utils;

public class TokenService(IConfiguration configuration) : ITokenService
{
	private readonly IConfiguration _configuration = configuration;

	public string GenerateToken(string username, string id, bool rememberMe)
	{
		var keyString = _configuration["Jwt:Key"]!;
		var issuer = _configuration["Jwt:Issuer"]!;

		var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
		var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

		var claims = new List<Claim>
		{
			new(JwtRegisteredClaimNames.Sub, id),
			new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
			new(ClaimTypes.Name, username),
			new(ClaimTypes.NameIdentifier, id)
		};

		// Extend expiration time if rememberMe is true
		var expires = rememberMe
			? DateTime.UtcNow.AddDays(14)
			: DateTime.UtcNow.AddHours(1);

		var token = new JwtSecurityToken(
			issuer: issuer,
			claims: claims,
			expires: expires,
			signingCredentials: creds
		);

		return new JwtSecurityTokenHandler( ).WriteToken(token);
	}
}
