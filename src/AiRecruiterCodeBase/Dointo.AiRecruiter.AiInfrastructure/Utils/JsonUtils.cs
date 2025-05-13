using Newtonsoft.Json.Schema.Generation;

namespace Dointo.AiRecruiter.AiInfrastructure.Utils;
internal static class JsonUtils
{
	public static string GetJsonSchemaOf(Type type)
	{
		var schemaGenerator = new JSchemaGenerator( );
		var schema = schemaGenerator.Generate(type);
		return schema.ToString( );
	}
}
