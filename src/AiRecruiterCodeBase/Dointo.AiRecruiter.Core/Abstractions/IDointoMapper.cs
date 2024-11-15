namespace Dointo.AiRecruiter.Core.Abstractions;

public interface IDointoMapper
{
	TDestination Map<TSource, TDestination>(TSource source);
}
