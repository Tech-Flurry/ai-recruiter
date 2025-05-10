
namespace Dointo.AiRecruiter.AiInfrastructure.Config;

internal partial class AiProviderFactory
{
	private readonly Dictionary<AiProviders, AiProvider> _providers = [ ];
	private readonly Dictionary<AiProviders, AiConfig> _configs = [ ];
	public AiProviderFactory AddAiProvider(AiProviders name, AiConfig config)
	{
		_configs.TryAdd(name, config);
		return this;
	}

	public AiProvider? GetProvider(AiProviders name)
	{
		_providers.TryGetValue(name, out var provider);
		if (provider is not null)
			return provider;

		var isAdded = _configs.TryGetValue(name, out var config);
		if (!isAdded || config is null)
			return null;
		provider = name switch
		{
			AiProviders.OpenAi => new OpenAiProvider(config),
			AiProviders.DeepSeek => new DeepSeekProvider(config),
			_ => null
		};
		if (provider is not null)
			_providers.Add(name, provider);
		return provider;
	}
}
