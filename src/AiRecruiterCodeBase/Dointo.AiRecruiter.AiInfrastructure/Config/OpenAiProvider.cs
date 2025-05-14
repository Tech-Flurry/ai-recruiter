using OpenAI;
using OpenAI.Chat;
using System.ClientModel;
using OpenAiChatMessage = OpenAI.Chat.ChatMessage;

namespace Dointo.AiRecruiter.AiInfrastructure.Config;

internal partial class AiProviderFactory
{
	private sealed class OpenAiProvider(AiConfig config) : AiProvider(config)
	{
		public override async Task<string> GetCompletionAsync(string model, string context, string prompt, string? outputFormat = null, string? formatName = null, List<ChatMessage>? history = null, CancellationToken cancellationToken = default)
		{
			var options = new OpenAIClientOptions( );

			var client = new ChatClient(model, new ApiKeyCredential(Config.ApiKey), options);

			var messages = new List<OpenAiChatMessage>
			{
				OpenAiChatMessage.CreateSystemMessage(context)
			};
			if (history is { Count: > 0 })
			{
				foreach (var message in history.Where(x => x.Role is not ChatMessage.ROLE_SYSTEM))
				{
					messages.Add(message.Role switch
					{
						ChatMessage.ROLE_ASSISTANCE => OpenAiChatMessage.CreateAssistantMessage(message.Content),
						_ => OpenAiChatMessage.CreateUserMessage(message.Content),
					});
				}
			}

			messages.Add(OpenAiChatMessage.CreateUserMessage(prompt));
			var completionOptions = new ChatCompletionOptions
			{
				Temperature = 0.7f,
				ResponseFormat = !string.IsNullOrEmpty(outputFormat) && !string.IsNullOrEmpty(formatName)
					? ChatResponseFormat.CreateJsonSchemaFormat(formatName, BinaryData.FromString(outputFormat))
					: null,
				MaxOutputTokenCount = 2000,
			};

			var completion = await client.CompleteChatAsync(messages, completionOptions, cancellationToken);

			return completion.Value.Content[0].Text;
		}
	}
}
