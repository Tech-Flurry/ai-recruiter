namespace Dointo.AiRecruiter.AiInfrastructure.Config;

internal abstract class AiProvider(AiConfig config)
{
	protected AiConfig Config { get; } = config;

	public abstract Task<string> GetCompletionAsync(string model, string context, string prompt, string? completionFormat = null, List<ChatMessage>? history = null, CancellationToken cancellationToken = default);
}

internal record ChatMessage(string Role, string Content)
{
	public static ChatMessage CreateUserMessage(string content) => new("user", content);
	public static ChatMessage CreateAssistantMessage(string content) => new("assistant", content);
	public static ChatMessage CreateSystemMessage(string content) => new("system", content);
}

public record AiConfig(string ApiKey, string ApiBaseUrl);
