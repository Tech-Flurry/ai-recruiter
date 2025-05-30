using NJsonSchema;

namespace Dointo.AiRecruiter.AiInfrastructure.Utils;
internal static class JsonUtils
{
	public static string GetJsonSchemaOf(Type type)
	{
		var schema = JsonSchema.FromType(type);
		return schema.ToJson( );
	}
}
