using Dointo.AiRecruiter.Core.Utils;
using System.Globalization;

namespace Dointo.AiRecruiter.Core.Extensions;
public static class StringExtensions
{
	public static string? ToTitleCase(this string? str)
	{
		if (str.IsNullOrEmpty( ))
			return str;

		return CultureInfo.CurrentCulture.TextInfo.ToTitleCase(str!.ToLower( ));
	}

	public static bool IsNullOrEmpty(this string? str) => str is null or AppConstants.EMPTY_STRING;

	public static bool IsNotNullAndEmpty(this string? str) => str is not null and not AppConstants.EMPTY_STRING;

	public static bool IsWhiteSpace(this string str) => string.IsNullOrWhiteSpace(str);

	public static bool IsEqualIgnoreCase(this string str, string value) => str.Equals(value, StringComparison.OrdinalIgnoreCase);

	public static bool IsEqual(this string str, string value) => str.Equals(value, StringComparison.Ordinal);
}
