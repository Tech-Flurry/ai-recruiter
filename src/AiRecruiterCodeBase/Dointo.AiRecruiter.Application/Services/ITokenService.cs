namespace Dointo.AiRecruiter.Application.Services;

public interface ITokenService
{
	string GenerateToken(string username, string id, bool rememberMe);
}
