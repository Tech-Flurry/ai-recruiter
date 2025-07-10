using Dointo.AiRecruiter.Application.Repositories;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Dtos;
using System.Security.Cryptography;

namespace Dointo.AiRecruiter.Application.Services;

public interface IAuthenticationService
{
	Task<string> LoginAsync(LoginCredentialsDto credentials);
	Task<string> RegisterUserAsync(RegisterUserDto registerUser);
}

internal class AuthenticationService(ITokenService tokenService, IUsersRepository userRepository) : IAuthenticationService
{
	private readonly ITokenService _tokenService = tokenService;
	private readonly IUsersRepository _userRepository = userRepository;

	public async Task<string> LoginAsync(LoginCredentialsDto credentials)
	{
		const string UNAUTHORIZED_MESSAGE = "Invalid username or password.";
		var user = await _userRepository.GetByUsernameAsync(credentials.Username) ?? throw new UnauthorizedAccessException(UNAUTHORIZED_MESSAGE);
		if (!VerifyPassword(credentials.Password, user.PasswordHash))
			throw new UnauthorizedAccessException(UNAUTHORIZED_MESSAGE);
		return _tokenService.GenerateToken(user.Username, user.Id, credentials.RememberMe);
	}

	public async Task<string> RegisterUserAsync(RegisterUserDto registerUser)
	{
		const string USERNAME_TAKEN_MESSAGE = "Username already taken.";
		if (await _userRepository.UsernameExistsAsync(registerUser.Username))
			throw new InvalidOperationException(USERNAME_TAKEN_MESSAGE);
		var user = new User
		{
			Username = registerUser.Username,
			PasswordHash = GenerateHash(registerUser.Password)
		};
		user = await _userRepository.EditAsync(user);
		if (user == null)
			throw new InvalidOperationException("Failed to register user.");
		return _tokenService.GenerateToken(user.Username, user.Id, false);
	}

	private static string GenerateHash(string password)
	{
		const int SALT_SIZE = 16;
		const int KEY_SIZE = 32;
		const int ITERATIONS = 100000;

		using var rfc2898 = new Rfc2898DeriveBytes(
			password,
			SALT_SIZE,
			ITERATIONS,
			HashAlgorithmName.SHA256
		);
		var key = Convert.ToBase64String(rfc2898.GetBytes(KEY_SIZE));
		var salt = Convert.ToBase64String(rfc2898.Salt);
		return $"{ITERATIONS}.{salt}.{key}";
	}

	private static bool VerifyPassword(string enteredPassword, string storedHash)
	{
		// storedHash format: "<iterations>.<base64Salt>.<base64Key>"
		var parts = storedHash.Split('.');
		if (parts.Length != 3) return false;

		if (!int.TryParse(parts[0], out var iterations)) return false;
		var salt = Convert.FromBase64String(parts[1]);
		var storedKey = Convert.FromBase64String(parts[2]);

		// Re-create the key from the entered password
		using var rfc2898 = new Rfc2898DeriveBytes(
			enteredPassword,
			salt,
			iterations,
			HashAlgorithmName.SHA256
		);
		var enteredKey = rfc2898.GetBytes(storedKey.Length);

		// Compare byte arrays in constant time
		return CryptographicOperations.FixedTimeEquals(storedKey, enteredKey);
	}
}
