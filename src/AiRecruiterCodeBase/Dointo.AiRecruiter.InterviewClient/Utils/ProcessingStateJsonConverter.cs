using Dointo.AiRecruiter.Core.States;
using System.Text.Json.Serialization;

namespace Dointo.AiRecruiter.InterviewClient.Utils;
public class ProcessingStateJsonConverter : JsonConverter<IProcessingState>
{
	public override IProcessingState? Read(ref System.Text.Json.Utf8JsonReader reader, Type typeToConvert, System.Text.Json.JsonSerializerOptions options)
	{
		using var doc = System.Text.Json.JsonDocument.ParseValue(ref reader);
		var root = doc.RootElement;
		var type = root.GetProperty("message").GetString( );

		// You may need to adjust the logic below based on your actual JSON structure
		if (root.TryGetProperty("errors", out _))
			return System.Text.Json.JsonSerializer.Deserialize<ValidationErrorState>(root.GetRawText( ), options);
		if (root.TryGetProperty("exceptionMessage", out _))
			return System.Text.Json.JsonSerializer.Deserialize<ExceptionState>(root.GetRawText( ), options);
		return System.Text.Json.JsonSerializer.Deserialize<SuccessState>(root.GetRawText( ), options);
	}

	public override void Write(System.Text.Json.Utf8JsonWriter writer, IProcessingState value, System.Text.Json.JsonSerializerOptions options)
	{
		System.Text.Json.JsonSerializer.Serialize(writer, (object)value, value.GetType( ), options);
	}
}
