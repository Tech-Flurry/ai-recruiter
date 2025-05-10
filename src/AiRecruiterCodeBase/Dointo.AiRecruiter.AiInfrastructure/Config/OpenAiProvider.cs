
namespace Dointo.AiRecruiter.AiInfrastructure.Config;

internal partial class AiProviderFactory
{
	private sealed class OpenAiProvider(AiConfig config) : AiProvider(config)
	{
		public override Task<string> GetCompletionAsync(string model, string context, string prompt, string? completionFormat = null, List<ChatMessage>? history = null, CancellationToken cancellationToken = default) => throw new NotImplementedException( );
	}
}
