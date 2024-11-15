namespace Dointo.AiRecruiter.Core.Extensions;
public static class CollectionsExtensions
{
	public static Dictionary<TKey, TValue> AddOrReplace<TKey, TValue>(this Dictionary<TKey, TValue> dictionary, TKey key, TValue value) where TKey : notnull
	{
		if (!dictionary.TryAdd(key, value))
			dictionary[key] = value;

		return dictionary;
	}
}
