using AutoMapper;
using Dointo.AiRecruiter.Core.Abstractions;
using Dointo.AiRecruiter.Domain.Entities;
using Dointo.AiRecruiter.Dtos;

namespace Dointo.AiRecruiter.Application.Resolvers;

internal class CandidateDashboardDtoResolver : ResolverBase<Interview, SkillProgressDto>
{
	private readonly IDointoMapper _mapper;

	public CandidateDashboardDtoResolver( )
	{
		var config = new MapperConfiguration(cfg =>
		{
			cfg.CreateMap<SkillRating, SkillProgressDto>( )
				.ForMember(dest => dest.Skill, opt => opt.MapFrom(src => src.Skill))
				.ForMember(dest => dest.Level, opt => opt.MapFrom(src => src.Rating));
		});


		_mapper = new AutoMapperProvider(config.CreateMapper( ));
	}

	protected override IDointoMapper Mapper => _mapper;
}
