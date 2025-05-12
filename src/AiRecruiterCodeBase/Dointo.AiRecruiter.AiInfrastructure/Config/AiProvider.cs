namespace Dointo.AiRecruiter.AiInfrastructure.Config;

internal abstract class AiProvider(AiConfig config)
{
	protected AiConfig Config { get; } = config;

	public abstract Task<string> GetCompletionAsync(string model, string context, string prompt, string? outputFormat = null, string? formatName = null, List<ChatMessage>? history = null, CancellationToken cancellationToken = default);
}

internal record ChatMessage(string Role, string Content)
{
	public const string ROLE_USER = "user";
	public const string ROLE_ASSISTANCE = "assistant";
	public const string ROLE_SYSTEM = "system";

	public static ChatMessage CreateUserMessage(string content) => new(ROLE_USER, content);
	public static ChatMessage CreateAssistantMessage(string content) => new(ROLE_ASSISTANCE, content);
	public static ChatMessage CreateSystemMessage(string content) => new(ROLE_SYSTEM, content);
}

public record AiConfig(string ApiKey, string ApiBaseUrl);
