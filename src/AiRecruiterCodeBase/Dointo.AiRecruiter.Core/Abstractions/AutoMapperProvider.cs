using AutoMapper;

namespace Dointo.AiRecruiter.Core.Abstractions;

public class AutoMapperProvider(IMapper mapper) : IDointoMapper
{
	public TDestination Map<TSource, TDestination>(TSource source) => mapper.Map<TSource, TDestination>(source);
}
