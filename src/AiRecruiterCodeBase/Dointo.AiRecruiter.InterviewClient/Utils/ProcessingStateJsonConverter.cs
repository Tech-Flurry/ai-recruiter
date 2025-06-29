using Dointo.AiRecruiter.Core.States;
using System.Text.Json.Serialization;

namespace Dointo.AiRecruiter.InterviewClient.Utils;

public class ProcessingStateJsonConverter : JsonConverter<IProcessingState>
{
	public override IProcessingState? Read(ref System.Text.Json.Utf8JsonReader reader, Type typeToConvert, System.Text.Json.JsonSerializerOptions options)
	{
		using var doc = System.Text.Json.JsonDocument.ParseValue(ref reader);
		var root = doc.RootElement;

		// Handle ValidationErrorState (has "errors" property)
		if (root.TryGetProperty("errors", out _))
			return System.Text.Json.JsonSerializer.Deserialize<ValidationErrorState>(root.GetRawText( ), options);

		// Handle ExceptionState (has "exceptionMessage" property)
		if (root.TryGetProperty("exceptionMessage", out _))
			return System.Text.Json.JsonSerializer.Deserialize<ExceptionState>(root.GetRawText( ), options);

		// Handle UnauthorizedState (message == "Unauthorized" or type property if available)
		if (root.TryGetProperty("message", out var messageProp) && messageProp.GetString( ) == "Unauthorized")
			return System.Text.Json.JsonSerializer.Deserialize<UnauthorizedState>(root.GetRawText( ), options);

		// Handle BusinessErrorState (could use a type property or fallback to ErrorState)
		if (root.TryGetProperty("message", out var businessErrorMessageProp) && businessErrorMessageProp.GetString( ) == "Business Error")
			return System.Text.Json.JsonSerializer.Deserialize<BusinessErrorState>(root.GetRawText( ), options);

		// Handle ErrorState (Success == false, not ValidationErrorState, not ExceptionState, not UnauthorizedState, not BusinessErrorState)
		if (root.TryGetProperty("success", out var successProp) && !successProp.GetBoolean( ))
			// If not already handled above, treat as ErrorState
			return System.Text.Json.JsonSerializer.Deserialize<ErrorState>(root.GetRawText( ), options);

		// Handle SuccessState<T> (has "data" property)
		if (root.TryGetProperty("data", out _))
		{
			// Use generic method to deserialize SuccessState<T>
			var successStateGenericType = typeof(SuccessState<>);
			// Try to infer T from the data property
			// Fallback to SuccessState<object> if type cannot be determined
			var constructedType = successStateGenericType.MakeGenericType(typeof(object));
			return (IProcessingState)System.Text.Json.JsonSerializer.Deserialize(root.GetRawText( ), constructedType, options)!;
		}

		// Handle SuccessState (Success == true, no "data" property)
		if (root.TryGetProperty("success", out var successProp2) && successProp2.GetBoolean( ))
			return System.Text.Json.JsonSerializer.Deserialize<SuccessState>(root.GetRawText( ), options);

		// If nothing matches, return null or throw
		return null;
	}

	public override void Write(System.Text.Json.Utf8JsonWriter writer, IProcessingState value, System.Text.Json.JsonSerializerOptions options)
	{
		System.Text.Json.JsonSerializer.Serialize(writer, value, value.GetType( ), options);
	}
}
