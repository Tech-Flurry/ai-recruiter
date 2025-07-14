using System.Security.Claims;

namespace Dointo.AiRecruiter.Application.Utils;
internal static class Extensions
{
	public static string GetOwnerId(this ClaimsPrincipal user)
	{
		if (user == null || user.Identity?.IsAuthenticated == false)
			return string.Empty;
		var ownerId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
		return ownerId ?? string.Empty;
	}
}
