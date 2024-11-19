using Dointo.AiRecruiter.Core.Extensions;
using Dointo.AiRecruiter.Core.Params;
using Dointo.AiRecruiter.Core.States;
using Dointo.AiRecruiter.Core.Utils;
using Microsoft.AspNetCore.Http;
using System.IdentityModel.Tokens.Jwt;

namespace Dointo.AiRecruiter.Functions.Shared.Extensions;

public static class JwtExtensions
{
	public static string? ValidateRequest(this HttpRequest request, string? audienceId = null)
	{
		const string REQUEST_IS_NOT_AUTHORIZED_MESSAGE = "The request is not authorized";
		const string TOKEN_EXPIRED = "The authentication token has been expired";

		var jwt = GetJwt(request);
		if (jwt is null)
			return REQUEST_IS_NOT_AUTHORIZED_MESSAGE;

		var utc = DateTime.UtcNow;
		if (jwt.ValidFrom > utc || jwt.ValidTo < utc)
			return TOKEN_EXPIRED;

		if (audienceId is not null && jwt.Audiences.All(x => !x.IsEqual(audienceId)))
			return REQUEST_IS_NOT_AUTHORIZED_MESSAGE;

		return null;
	}

	public static IProcessingState AuthorizeRequest(this HttpRequest request, string? audienceId = null)
	{
		const string AUTHORIZED_MESSAGE = "The request has been authorized";

		try
		{
			if (request.ValidateRequest(audienceId) is not string validationMessage)
				return new SuccessState(AUTHORIZED_MESSAGE);
			return new UnauthorizedState(validationMessage);
		}
		catch (Exception)
		{
			return new UnauthorizedState("Invalid token");
		}

	}

	public static UserInfo? GetUserInfo(this HttpRequest request)
	{
		var jwt = GetJwt(request);
		if (jwt is null)
			return null;

		var objectId = jwt.Claims.FirstOrDefault(x => x.Type.IsEqualIgnoreCase("oid"))?.Value ?? AppConstants.EMPTY_STRING;
		var firstName = jwt.Claims.FirstOrDefault(x => x.Type.IsEqualIgnoreCase("given_name"))?.Value ?? AppConstants.EMPTY_STRING;
		var lastName = jwt.Claims.FirstOrDefault(x => x.Type.IsEqualIgnoreCase("family_name"))?.Value ?? AppConstants.EMPTY_STRING;
		var email = jwt.Claims.FirstOrDefault(x => x.Type.IsEqualIgnoreCase("emails"))?.Value ?? AppConstants.EMPTY_STRING;
		var username = email.IsNullOrEmpty( ) ? firstName : email;
		return new UserInfo(objectId, firstName, lastName, email, username);
	}

	private static JwtSecurityToken? GetJwt(HttpRequest request)
	{
		try
		{
			const string AUTH_HEADER_NAME = "Authorization";
			const string BEARER_NAME = "Bearer";
			if (request is null || request.Headers.All(x => !x.Key.IsEqualIgnoreCase(AUTH_HEADER_NAME)))
				return null;
			var header = request.Headers.First(x => x.Key.IsEqualIgnoreCase(AUTH_HEADER_NAME));
			var token = header.Value.FirstOrDefault( );
			if (token is null || !token.StartsWith(BEARER_NAME))
				return null;

			token = token.Replace(BEARER_NAME, string.Empty).Trim( );
			return new JwtSecurityToken(token);
		}
		catch (Exception)
		{
			return null;
		}
	}
}
