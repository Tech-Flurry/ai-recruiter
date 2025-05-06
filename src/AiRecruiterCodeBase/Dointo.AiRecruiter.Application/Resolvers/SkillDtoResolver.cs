using AutoMapper;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Dtos;

namespace Dointo.AiRecruiter.Application.Resolvers;
internal class SkillDtoResolver : ResolverBase<Skill, SkillDto>
{
	protected override IDointoMapper Mapper
	{
		get
		{
			var configuration = new MapperConfiguration(cfg =>
			{
				cfg.CreateMap<Skill, SkillDto>( )
				   .ReverseMap( );
			});
			return new AutoMapperProvider(configuration.CreateMapper( ));
		}
	}
}
