
using Dointo.AiRecruiter.AiInfrastructure.Exceptions;

namespace Dointo.AiRecruiter.AiInfrastructure.Config;

internal partial class AiProviderFactory
{
	private readonly Dictionary<AiProviders, AiProvider> _providers = [ ];
	private readonly Dictionary<AiProviders, AiConfig> _configs = [ ];
	public AiProviderFactory AddAiProvider(AiProviders name, AiConfig config)
	{
		_configs[name] = config;
		return this;
	}

	public AiProvider GetProvider(AiProviders name)
	{
		if (_providers.TryGetValue(name, out var provider))
			return provider;

		if (!_configs.TryGetValue(name, out var config))
			throw new ProviderNotFoundException(name);

		provider = name switch
		{
			AiProviders.OpenAi => new OpenAiProvider(config),
			AiProviders.DeepSeek => new DeepSeekProvider(config),
			_ => throw new ProviderNotFoundException(name)
		};
		return _providers[name] = provider;
	}
}
