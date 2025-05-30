
namespace Dointo.AiRecruiter.AiInfrastructure.Config;

internal partial class AiProviderFactory
{
	private sealed class DeepSeekProvider(AiConfig config) : AiProvider(config)
	{
		public override Task<string> GetCompletionAsync(string model, string context, string prompt, string? outputFormat = null, string? formatName = null, List<ChatMessage>? history = null, CancellationToken cancellationToken = default) => throw new NotImplementedException( );
	}
}
