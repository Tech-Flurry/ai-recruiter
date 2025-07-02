namespace Dointo.AiRecruiter.Dtos;
public class LoginCredentialsDto
{
	public string Username { get; set; } = string.Empty;
	public string Password { get; set; } = string.Empty;
	public bool RememberMe { get; set; }
}
