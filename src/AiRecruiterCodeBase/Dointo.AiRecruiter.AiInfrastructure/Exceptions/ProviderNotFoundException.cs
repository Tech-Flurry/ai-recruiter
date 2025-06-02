using Dointo.AiRecruiter.AiInfrastructure.Config;

namespace Dointo.AiRecruiter.AiInfrastructure.Exceptions;
public class ProviderNotFoundException : Exception
{
	internal ProviderNotFoundException(AiProviders provider) : base($"Ai Provider: {provider} is not found. Make sure you have configured it correctly in the {nameof(AiProviderFactory)}.")
	{
	}
}
