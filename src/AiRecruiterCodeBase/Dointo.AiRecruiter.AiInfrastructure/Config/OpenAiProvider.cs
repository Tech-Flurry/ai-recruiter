using OpenAI;
using OpenAI.Chat;
using System.ClientModel;

namespace Dointo.AiRecruiter.AiInfrastructure.Config;

internal partial class AiProviderFactory
{
	private sealed class OpenAiProvider(AiConfig config) : AiProvider(config)
	{
		public override async Task<string> GetCompletionAsync(string model, string context, string prompt, string? completionFormat = null, List<ChatMessage>? history = null, CancellationToken cancellationToken = default)
		{
			// Create the OpenAI client with options
			var options = new OpenAIClientOptions( );

			if (!string.IsNullOrEmpty(Config.ApiBaseUrl))
			{
				options.Endpoint = new Uri(Config.ApiBaseUrl);
			}

			var client = new OpenAIClient(new ApiKeyCredential(Config.ApiBaseUrl), options);

			var messages = new List<ChatMessage>( );

			if (history is { Count: > 0 })
				messages.AddRange(history);

			if (messages.Count == 0)
				messages.Add(ChatMessage.CreateSystemMessage(context));


			// Add the user prompt
			messages.Add(new ChatRequestUserMessage(prompt));

			// Set up completion options
			var completionOptions = new ChatCompletionOptions
			{
				Messages = messages,
				Model = model,
				Temperature = 0.7f,
				MaxTokens = 2000
			};

			// Request the completion
			var response = await client.GetChatCompletionsAsync(completionOptions, cancellationToken);

			// Return the completion text
			return response.Choices[0].Message.Content;
		}
	}
}
