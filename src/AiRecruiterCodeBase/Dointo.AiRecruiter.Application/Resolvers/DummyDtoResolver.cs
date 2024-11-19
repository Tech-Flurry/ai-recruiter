using AutoMapper;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Dtos;

namespace Dointo.AiRecruiter.Application.Resolvers;
internal class DummyDtoResolver : ResolverBase<DummyEntity, DummyDto>
{
	protected override IDointoMapper Mapper
	{
		get
		{
			var configuration = new MapperConfiguration(cfg =>
			{
				cfg.CreateMap<DummyEntity, DummyDto>( ); //TODO: needs to be changed after the implementation of teams
			});
			return new AutoMapperProvider(configuration.CreateMapper( ));
		}
	}
}
